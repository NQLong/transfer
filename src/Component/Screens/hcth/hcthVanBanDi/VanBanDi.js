import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, TouchableOpacity, View } from 'react-native';
import { Card, List, Text, Menu, useTheme } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';

import Timeline from 'react-native-timeline-flatlist';

import { renderScrollView } from '@/Utils/component';

import T from '@/Utils/common';

import { Comment, FormTextBox } from '@/Utils/component';
import { createPhanHoi, getPhanHoi, getVanBanDi } from './redux';
const RNFS = require('react-native-fs');

import commonStyles from '../../../../Asset/Styles/styles';
import styles from './styles';

// const trangThaiVanBanDi = {
//     NHAP: { id: 1, text: 'Nháp', color: '#17a2b8' },
//     XEM_XET: { id: 6, text: 'Xem xét', color: '#007bff' },
//     CHO_KIEM_TRA: { id: 2, text: 'Chờ kiểm tra', color: '#007bff' },
//     CHO_DUYET: { id: 3, text: 'Chờ duyệt', color: '#007bff' },
//     TRA_LAI: { id: 4, text: 'Trả lại', color: '#dc3545' },
//     DA_XEM_XET: { id: 5, text: 'Đã xem xét', color: '#28a745' },
//     DA_DUYET: { id: 7, text: 'Đã duyệt', color: '#28a745' },
//     CHO_PHAN_PHOI: { id: 8, text: 'Chờ phân phối', color: '#007bff' },
//     CHO_KY: { id: 9, text: 'Chờ ký', color: '#007bff' },
//     DA_PHAN_PHOI: { id: 10, text: 'Đã phân phối', color: '#28a745' },
//     TRA_LAI_PHONG: { id: 11, text: 'Trả lại (Đơn vị)', color: '#dc3545' },
//     TRA_LAI_HCTH: { id: 12, text: 'Trả lại (HCTH)', color: '#dc3545' },
// }

const trangThaiVanBanDi = {
    NHAP: { text: 'Nháp', id: 'NHAP', color: 'red' },
    KIEM_TRA_NOI_DUNG: { text: 'Kiểm tra nội dung', id: 'KIEM_TRA_NOI_DUNG', color: 'blue' },
    TRA_LAI_NOI_DUNG: { text: 'Trả lại nội dung', id: 'TRA_LAI_NOI_DUNG', color: 'red' },
    KIEM_TRA_THE_THUC: { text: 'Kiểm tra thê thức', id: 'KIEM_TRA_THE_THUC', color: 'blue' },
    TRA_LAI_THE_THUC: { text: 'Trả lại thể thức', id: 'TRA_LAI_THE_THUC', color: 'red' },
    TRA_LAI: { text: 'Trả lại', id: 'TRA_LAI', color: 'red' },
    KY_THE_THUC: { text: 'Ký thể thức', id: 'KY_THE_THUC', color: 'blue' },
    KY_NOI_DUNG: { text: 'Kiểm tra thê thức', id: 'KIEM_TRA_THE_THUC', color: 'blue' },
    KY_PHAT_HANH: { text: 'Ký phát hành', id: 'KY_PHAT_HANH', color: 'blue' },
    DONG_DAU: { text: 'Đóng dấu mộc đỏ', id: 'DONG_DAU', color: 'blue' },
    DA_PHAT_HANH: { text: 'Đã phát hành', id: 'DA_PHAT_HANH', color: 'green' },
};

const action = {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    RETURN: 'RETURN',
    APPROVE: 'APPROVE',
    PUBLISH: 'PUBLISH',
    UPDATE_STATUS: 'UPDATE_STATUS',
    ACCEPT: 'ACCEPT',
    READ: 'READ',
    SEND: 'SEND',
    ADD_EMPLOYEES: 'ADD_EMPLOYEES',
    REMOVE_EMPOYEE: 'REMOVE_EMPLOYEE',
    CHANGE_ROLE: 'CHANGE_ROLE',
    COMPLETE: 'COMPLETE',
    CLOSE: 'CLOSE',
    REOPEN: 'REOPEN',
    RESET: 'RESET',
    VIEW: 'VIEW',
    ADD_SIGN_REQUEST: 'ADD_SIGN_REQUEST',
    REMOVE_SIGN_REQUEST: 'REMOVE_SIGN_REQUEST',
    UPDATE_SIGN_REQUEST: 'UPDATE_SIGN_REQUEST',
    WAIT_SIGN: 'WAIT_SIGN',
    DISTRIBUTE: 'DISTRIBUTE'
};

const actionToText = (value) => {
    switch (value) {
        case action.CREATE:
            return 'tạo';
        case action.UPDATE:
            return 'cập nhật';
        case action.RETURN:
            return 'trả lại';
        case action.APPROVE:
            return 'duyệt';
        case action.ACCEPT:
            return 'chấp nhận';
        case action.READ:
            return 'đọc';
        case action.SEND:
            return 'gửi';
        case action.VIEW:
            return 'xem';
        case action.ADD_SIGN_REQUEST:
            return 'thêm 1 yêu cầu trình ký ở';
        case action.REMOVE_SIGN_REQUEST:
            return 'xoá 1 yêu cầu trình ký ở';
        case action.UPDATE_SIGN_REQUEST:
            return 'cập nhật 1 yêu cầu trình ký ở';
        case action.WAIT_SIGN:
            return 'chuyển trạng thái sang chờ ký tại';
        case action.DISTRIBUTE:
            return 'đã phân phối';
        default:
            return '';
    }
};

const actionColor = (value) => {
    switch (value) {
        case action.ACCEPT:
        case action.APPROVE:
        case action.UPDATE_SIGN_REQUEST:
            return '#00a65a';
        case action.RETURN:
        case action.CREATE:
        case action.REMOVE_SIGN_REQUEST:
            return 'red';
        case action.ADD_SIGN_REQUEST:
        case action.VIEW:
            return '#28a745';
        default:
            return 'blue';
    }
};

const CanBoNhan = () => {
    const list = useSelector(state => state?.hcthVanBanDi?.item?.canBoNhan);
    const { colors } = useTheme();
    const [isExpand, setIsExpand] = useState(true);
    const renderContent = () => {
        if (!list) {
            return <ActivityIndicator size='large' color={colors.primary} style={commonStyles.mb20} />
        } else if (!list.length) {
            return <List.Item title={'Chưa có cán bộ nhận'} />
        } else {
            const items = list.map((item, key) => {
                return <List.Item key={key} title={`${item.ho} ${item.ten}`.normalizedName()} right={() => <Text variant='bodyMedium' style={commonStyles.alignSelfCenter}>{item.shcc}</Text>} />
            })
            return items;
        }
    }

    return (
        <Card style={commonStyles.m5} elevation={4}>
            <List.Accordion id='canBoNhan'
                title='Cán bộ nhận'
                left={props => {
                    return <Ionicons {...props} size={20} style={commonStyles.m5} name='people-outline' />
                }}
                expanded={isExpand}
                onPress={() => setIsExpand(!isExpand)}
            >
                {renderContent()}
            </List.Accordion>
        </Card>
    );
}

const DonViNhan = () => {
    const list = useSelector(state => state?.hcthVanBanDi?.item?.donViNhan);
    const { colors } = useTheme();
    const [isExpand, setIsExpand] = useState(true);
    const renderContent = () => {
        if (!list) {
            return <ActivityIndicator size='large' color={colors.primary} style={commonStyles.mb20} />
        } else if (list.length > 0) {
            return <List.Item title='Chưa có danh sách đơn vị nhận' />
        } else {
            const items = list.map((item, key) => {
                return <List.Item key={key} title={`${item.ten}`} right={() => null} />
            })
            return items;
        }
    }

    return (
        <Card style={commonStyles.m5} elevation={4}>
            <List.Accordion id='donViNhan'
                title='Đơn vị nhận'
                left={props => {
                    return <Ionicons {...props} size={20} style={commonStyles.m5} name='business' />
                }}
                expanded={isExpand}
                onPress={() => setIsExpand(!isExpand)}
            >
                {renderContent()}
            </List.Accordion>
        </Card>
    );
}

const DonViNhanNgoai = () => {
    const list = useSelector(state => state?.hcthVanBanDi?.item?.donViNhanNgoai);
    const { colors } = useTheme();
    const [isExpand, setIsExpand] = useState(true);
    const renderContent = () => {
        if (!list) {
            return <ActivityIndicator size='large' color={colors.primary} style={commonStyles.mb20} />
        } else if (list.length > 0) {
            return <List.Item title='Chưa có danh sách đơn vị nhận ngoài' />
        } else {
            const items = list.map((item, key) => {
                return <List.Item key={key} title={`${item.ten}`} right={() => null} titleNumberOfLines={3} />
            })
            return items;
        }
    }

    return (
        <Card style={commonStyles.m5} elevation={4}>
            <List.Accordion id='donViNhanNgoai'
                title='Đơn vị nhận ngoài'
                left={props => {
                    return <Ionicons {...props} size={20} style={commonStyles.m5} name='business-outline' />
                }}
                expanded={isExpand}
                onPress={() => setIsExpand(!isExpand)}
            >
                {renderContent()}
            </List.Accordion>
        </Card>
    );
}

const PhanHoi = () => {
    const list = useSelector(state => state?.hcthVanBanDi?.item?.phanHoi);
    const id = useSelector(state => state?.hcthVanBanDi?.item?.id);
    const shcc = useSelector(state => state?.settings?.user?.shcc);
    const { colors } = useTheme();
    const [isExpand, setIsExpand] = useState(true);
    const [phanHoi, setPhanHoi] = useState('');
    const dispatch = useDispatch();

    const renderContent = () => {
        if (!list)
            return <ActivityIndicator size='large' color={colors.primary} style={commonStyles.mb20} />
        else {
            const content = [];
            if (!list.length)
                content.push(<List.Item key='empty-phan-hoi' title={'Chưa có phản hồi'} />)
            else {
                list.forEach((item, key) => {
                    content.push(<List.Item key={key} style={styles.replyItem} left={() => null} title={() => (<Comment style={commonStyles.flex1} name={`${item.ho} ${item.ten}`.trim().normalizedName()} timestamp={item.ngayTao} content={item.noiDung} image={T.config.API_URL + (item.image ? item.image.substring(1) : 'img/avatar.png')} />)} />);
                });
            }
            content.push(phanHoiBox);
            return content;
        };
    }

    const onSubmit = () => {
        const data = {
            key: id,
            canBoGui: shcc,
            noiDung: phanHoi,
            ngayTao: new Date().getTime(),
            loai: 'DI'
        };
        dispatch(createPhanHoi(data, () => dispatch(getPhanHoi(id, () => setPhanHoi('')))));

    }

    const phanHoiBox = shcc ? <List.Item key='phanHoiBox' left={() => null} style={styles.replyTitleWrapper} title={() => (<View style={styles.replyTitleText}>
        <FormTextBox style={styles.replyInput} value={phanHoi} onChangeText={text => setPhanHoi(text)} placeholder='Nhập phản hồi' />
        <TouchableOpacity onPress={onSubmit}>
            <Ionicons name='paper-plane-outline' size={30} style={{ color: colors.primary }} />
        </TouchableOpacity>
    </View>)} /> : null;

    return (
        <Card style={commonStyles.m5} elevation={4}>
            <List.Accordion id='phanHoi'
                title='Phản hồi'
                left={props => {
                    return <Ionicons {...props} size={20} style={commonStyles.m5} name='chatbox-ellipses-outline' />
                }}
                expanded={isExpand}
                onPress={() => setIsExpand(!isExpand)}>
                {renderContent()}
            </List.Accordion>
        </Card>
    );

}

const FileList = ({ navigation }) => {
    const listFile = useSelector(state => state.hcthVanBanDi?.item?.files);
    const id = useSelector(state => state.hcthCongVanDi?.item?.id);
    const { colors } = useTheme();
    const [isExpand, setIsExpand] = useState(true);
    const renderContent = () => {

        if (!listFile)
            return <ActivityIndicator size='large' color={colors.primary} style={commonStyles.mb20} />
        else if (listFile.length === 0)
            return <List.Item title={'Chưa có tập tin công văn'} />
        else {
            const items = listFile.map((item, key) => {
                const
                    originalName = item.file.tenFile,
                    linkFile = `${T.config.API_URL}api/hcth/van-ban-di/download/${item.vanBanDi}/${originalName}`,
                    style = {};
                if (key == 0)
                    style.borderTopWidth = 0;
                return <List.Item key={key} left={() => null} title={() => <TouchableOpacity onPress={() => navigation.push('ReadFile', { item, source: { uri: linkFile, cache: true } })}><Text variant="bodyMedium">{item.file.ten}</Text></TouchableOpacity>} />
            });
            return items;
        };
    }


    return <Card style={commonStyles.m5} elevation={4}>

        <List.Accordion id='files'
            title='Danh sách tập tin công văn'
            left={props => {
                return <Ionicons {...props} size={20} style={commonStyles.m5} name='document-text-outline' />
            }}
            expanded={isExpand}
            onPress={() => setIsExpand(!isExpand)}>
            {renderContent()}
        </List.Accordion>
    </Card>
}

const History = () => {
    const history = useSelector(state => state.hcthVanBanDi?.item?.history);
    const user = useSelector(state => state.settings?.user);
    const userShcc = user.shcc;
    const { colors } = useTheme();
    const [isExpand, setIsExpand] = useState(true);

    const renderContent = () => {
        if (!history) {
            return <ActivityIndicator size='large' color={colors.primary} style={commonStyles.mb20} />
        } else if (!history.length) {
            return <List.Item title='Chưa có lịch sử' />
        } else {
            const data = history.map(item => {
                const style = {};
                // if (item.hanhDong == action.)

                // style.lineColor = actionColor(item.hanhDong);
                style.circleColor = actionColor(item.hanhDong);

                return {
                    title: item?.thoiGian ? T.dateToText(new Date(item.thoiGian), 'hh:mm, dd/mm/yyyy') : null,
                    description: (item.shcc != userShcc ? `${item.ho || ''} ${item.ten || ''}`.trim().normalizedName() : 'Bạn' + ` đã ${actionToText(item.hanhDong)} công văn này.`),
                    ...style
                }
            });
            return (
                <List.Item style={commonStyles.flex1} left={() => null} title={() => (<Timeline data={data} isUsingFlatlist={false} showTime={false} separator={true} />)} />
            );
        }
    }

    return (<Card style={commonStyles.m5} elevation={4}>
        <List.Accordion id='history'
            title='Lịch sử'
            left={props => {
                return <Ionicons {...props} size={20} style={commonStyles.m5} name='calendar' />
            }}
            expanded={isExpand}
            onPress={() => setIsExpand(!isExpand)}
        >
            {renderContent()}
        </List.Accordion>
    </Card>);

}

const VanBanDi = (props) => {
    const { navigation, route } = props;
    const dispatch = useDispatch();
    const item = useSelector(state => {
        return state?.hcthVanBanDi?.item;
    });

    console.log('item :', item?.trangThai);

    const files = item?.files || [];

    const userInfo = useSelector(state => state?.settings.user);
    const [context, setContext] = useState({});
    const [refreshing, setRefreshing] = useState(false);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const { colors } = useTheme();

    useEffect(() => {
        // dispatch({ type: HcthVanBanDiGet, item: null });
        getData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        getData(() => setRefreshing(false));
    }

    const getData = (done) => {
        const vanBanDiId = route?.params.vanBanDiId;
        dispatch(getVanBanDi(vanBanDiId, context, done));
    }

    const onSignVanVanDi = async () => {
        try {
            const listSignFile = files.filter(file => file.config.length > 0 && file.config.some(cfg => cfg.shcc === userInfo.shcc && !cfg.signAt));

            const congVanId = route?.params?.vanBanDiId;
            const keyDir = RNFS.DocumentDirectoryPath + `/${userInfo.shcc}.p12`; 
            
            const key = await RNFS.readFile(keyDir, 'base64');

            const signFile = listSignFile[0];

            const linkFile = `${T.config.API_URL}api/hcth/van-ban-di/download/${signFile.vanBanDi}/${signFile.file.tenFile}`;

            navigation.push('SelectSignPos', { id: congVanId, key, fileIndex: 0, listSignFile, source: { uri: linkFile, cache: true } });
            
        } catch (error) {
            console.error(error);
        }
    }

    const enabledSignBtn = () => {
        return files.some(file => {
            if (file.config.length > 0 && file.config.some(cf => cf.shcc === userInfo.shcc && !cf.signAt)) return true
            else return false
        })
    }

    const generalInfo = () => {
        return <Card style={styles.generalInfoWrapper} elevation={4}>
            <Card.Title title={`Văn bản đi ${item?.id}`} right={headerRightButton}/>
            <Card.Content>
                <List.Item title='Số công văn' right={() => <Text variant='bodyMedium' style={styles.generalInfoItem}>{item?.soCongVan || 'Chưa có'}</Text>} />
                <List.Item title='Ngày gửi' right={() => <Text variant='bodyMedium' style={styles.generalInfoItem}>{item?.ngayGui ? T.dateToText(item.ngayGui) : 'Chưa có'}</Text>} />
                <List.Item title='Ngày ký' right={() => <Text variant='bodyMedium' style={styles.generalInfoItem}>{item?.ngayKy ? T.dateToText(item.ngayKy) : 'Chưa có'}</Text>} />
                <List.Item title='Ngày tạo' right={() => <Text variant='bodyMedium' style={styles.generalInfoItem}>{item?.ngayTao ? T.dateToText(item.ngayTao) : 'Chưa có'}</Text>} />

                {/* <List.Item title='Trạng thái' right={() => <Text variant='bodyMedium' style={{ ...styles.generalInfoItem, color: trangThaiVanBanDi[item.trangThai]?.color  || 'black', fontWeight: 'bold' }}>{trangThaiVanBanDi[item.trangThai]?.text || 'Nháp'}</Text>} /> */}

                {/* <List.Item title='Ngôn ngữ' right={() => <Text variant='bodyMedium' style={styles.generalInfoItem}>{item?.ngoaiNgu}</Text>} /> */}

                <List.Item title='Đơn vị gửi' description={item?.tenDonViGui} descriptionNumberOfLines={null} />

                <List.Item title='Trích yếu' description={item?.trichYeu} descriptionNumberOfLines={null} />


            </Card.Content>
        </Card>
    }

    const openMenu = () => setIsMenuVisible(true);
    const closeMenu = () => setIsMenuVisible(false);
    const menuItems = [];
    
    enabledSignBtn && menuItems.push(<Menu.Item key='ky' onPress={onSignVanVanDi} title="Ký văn bản" />);

    // const headerRightButton = () => <Text>askdaks</Text>;
    const headerRightButton = () => menuItems.length ? <Menu
        visible={isMenuVisible}
        onDismiss={closeMenu}
        anchor={<TouchableOpacity onPress={openMenu}><Ionicons name={'ellipsis-vertical'} color='black' size={20} style={commonStyles.m10} /></TouchableOpacity>}>
        {menuItems}
    </Menu> : null;

    return renderScrollView({
        ...props,
        content: <>
            {/* <Text>Hello</Text> */}
            {generalInfo()}
            <FileList navigation={navigation} />
            <CanBoNhan />
            <DonViNhan />
            <DonViNhanNgoai />
            <PhanHoi />
            <History />
        </>,
        style: {},
        refreshControl: <RefreshControl colors={['#9Bd35A', '#689F38']} refreshing={refreshing} onRefresh={onRefresh} />
    })
};

export default VanBanDi;