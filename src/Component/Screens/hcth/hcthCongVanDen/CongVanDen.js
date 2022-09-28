import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, TouchableOpacity, View } from 'react-native';
import { Button, Card, List, Menu, Switch, Text, useTheme, TextInput } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { createChiDao, createPhanHoi, duyetCongVan, getChiDao, getCongVanDen, getPhanHoi, getStaffPage, HcthCongVanDenGet, traLaiCongVan, updateQuyenChiDao } from './redux';

import T from '@/Utils/common';
import { AdminModal, Comment, FormTextBox, renderScrollView } from '@/Utils/component';
import Timeline from 'react-native-timeline-flatlist';

import styles from './styles';
import commonStyles from '../../../../Asset/Styles/styles';

const trangThai = {
    MOI: { id: 0, text: 'Nháp', color: '#17a2b8' },
    CHO_DUYET: { id: 1, text: 'Chờ duyệt', color: '#007bff' },
    TRA_LAI_BGH: { id: 2, text: 'Trả lại', color: '#dc3545' },
    CHO_PHAN_PHOI: { id: 3, text: 'Chờ phân phối', color: '#ffc107' },
    TRA_LAI_HCTH: { id: 4, text: 'Trả lại (HCTH)', color: '#dc3545' },
    DA_PHAN_PHOI: { id: 5, text: 'Đã phân phối', color: '#28a745' },
    DA_DUYET: { id: 6, text: 'Đã duyệt', color: '#007bff' },
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
    VIEW: 'VIEW'
};

const DonViNhan = () => {
    const list = useSelector(state => state?.hcthCongVanDen?.item?.danhSachDonViNhan);
    const { colors } = useTheme();
    const [isExpand, setIsExpand] = useState(true);
    const renderContent = () => {
        if (!list)
            return <ActivityIndicator size='large' color={colors.primary} style={commonStyles.mb20} />
        else if (!list.length)
            return <List.Item title={'Chưa có đơn vị nhận'} />

        else {
            const items = list.map((item, key) => {
                return <List.Item key={key} title={item.ten} right={() => null} />
            });
            return items;
        };
    }


    return (
        <Card style={commonStyles.m5} elevation={4}>
            <List.Accordion id='donViNhan'
                title='Đơn vị nhận'
                left={props => {
                    return <Ionicons {...props} size={20} style={commonStyles.m5} name='business' />
                }}
                expanded={isExpand}
                onPress={() => setIsExpand(!isExpand)}>
                {renderContent()}
            </List.Accordion>
        </Card>
    );
}

const CanBoNhan = () => {
    const list = useSelector(state => state?.hcthCongVanDen?.item?.danhSachCanBoNhan);
    const { colors } = useTheme();
    const [isExpand, setIsExpand] = useState(true);
    const renderContent = () => {
        if (!list)
            return <ActivityIndicator size='large' color={colors.primary} style={commonStyles.mb20} />
        else if (!list.length)
            return <List.Item title={'Chưa có cán bộ nhận'} />
        else {
            const items = list.map((item, key) => {
                return <List.Item key={key} title={`${item.ho} ${item.ten}`.normalizedName()} right={() => <Text variant='bodyMedium' style={commonStyles.alignSelfCenter}>{item.shcc}</Text>} />
            });
            return items;
        };
    }


    return (
        <Card style={commonStyles.m5} elevation={4}>
            <List.Accordion id='canBoNhan'
                title='Cán bộ nhận'
                left={props => {
                    return <Ionicons {...props} size={20} style={commonStyles.m5} name='people-outline' />
                }}
                expanded={isExpand}
                onPress={() => setIsExpand(!isExpand)}>
                {renderContent()}
            </List.Accordion>
        </Card>
    );
}

const CanBoChiDao = (props) => {
    const list = useSelector(state => state?.hcthCongVanDen?.item?.quyenChiDao);
    const trangThaiCv = useSelector(state => state?.hcthCongVanDen?.item?.trangThai);
    const user = useSelector(state => state?.settings?.user);
    const { colors } = useTheme();
    const dispatch = useDispatch();
    const [isExpand, setIsExpand] = useState(true);
    const lstCanBoChiDao = list !== '' ? list.split(',') : [];
    const [canBoChiDao, setCanBoChiDao] = useState([]);

    useEffect(() => {
        setCanBoChiDao(lstCanBoChiDao);
    }, [list]);

    const onChangeCanBoChiDao = (shcc, value) => {
        let newQuyenChiDao = [...canBoChiDao];
        if (value) {
            newQuyenChiDao.push(shcc);
        } else {
            newQuyenChiDao = newQuyenChiDao.filter((item) => item !== shcc);
        }
        if (newQuyenChiDao.length === 0) {
            T.alert('Cập nhật cán bộ chỉ đạo', 'Chọn ít nhất 1 cán bộ chỉ đạo đối với công văn cần chỉ đạo!');
        }
        else {
            const congVanId = props.id;
            dispatch(updateQuyenChiDao(congVanId, shcc, trangThaiCv, value, (res) => {
                T.alert('Công văn đến', `${value ? 'Thêm' : 'Xoá'} cán bộ chỉ đạo ${!res.error || (res.error && Object.keys(res.error).length === 0) ? 'thành công' : 'lỗi'}`);
                setCanBoChiDao(newQuyenChiDao);
            }));
        }
    }

    const renderContent = () => {
        if (!canBoChiDao)
            return <ActivityIndicator size='large' color={colors.primary} style={commonStyles.mb20} />
        else if (canBoChiDao.length <= 0)
            return <List.Item title={'Chưa có cán bộ chỉ đạo'} />
        else {
            const items = props.banGiamHieu.map((item, key) => {
                return <List.Item key={key} title={`${item.ho} ${item.ten}`.normalizedName()}
                    left={() => user.permissions.includes('rectors:login') ? <Switch
                        color="#007bff"
                        style={commonStyles.switchButton}
                        value={canBoChiDao.includes(item.shcc)}
                        onValueChange={(value) => onChangeCanBoChiDao(item.shcc, value)}
                    /> : null}
                    right={() => <Text variant='bodyMedium' style={commonStyles.alignSelfCenter}>{item.shcc}</Text>} />
            });
            return items;
        };
    }


    return (
        <Card style={commonStyles.m5} elevation={4}>
            <List.Accordion id='canBoNhan'
                title='Cán bộ chỉ đạo'
                left={props => {
                    return <Ionicons {...props} size={20} style={commonStyles.m5} name='people-outline' />
                }}
                expanded={isExpand}
                onPress={() => setIsExpand(!isExpand)}>
                {renderContent()}
            </List.Accordion>
        </Card>
    );
}

const PhanHoi = () => {
    const list = useSelector(state => state?.hcthCongVanDen?.item?.phanHoi);
    const id = useSelector(state => state?.hcthCongVanDen?.item?.id);
    const shcc = useSelector(state => state?.settings?.user?.shcc);
    const dispatch = useDispatch();
    const { colors } = useTheme();
    const [isExpand, setIsExpand] = useState(true);
    const [phanHoi, setPhanHoi] = useState('');
    const renderContent = () => {
        if (!list)
            return <ActivityIndicator size='large' color={colors.primary} style={commonStyles.mb20} />
        else {
            const content = [];
            if (!list.length)
                content.push(<List.Item key='empty-phan-hoi' title={'Chưa có phản hồi'} />)
            else {
                list.forEach((item, key) => {
                    content.push(<List.Item key={key} style={styles.replyItem} left={() => null} title={() => (<Comment style={commonStyles.flex1} name={`${item.ho} ${item.ten}`.trim().normalizedName()} timestamp={item.ngayTao} image={T.config.API_URL + (item.image ? item.image.substring(1) : 'img/avatar.png')} content={item.noiDung} />)} />);
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

const ChiDao = () => {
    const list = useSelector(state => state?.hcthCongVanDen?.item?.danhSachChiDao);
    const { colors } = useTheme();
    const [isExpand, setIsExpand] = useState(true);
    const [chiDao, setChiDao] = useState('');
    const id = useSelector(state => state?.hcthCongVanDen?.item?.id);
    const shcc = useSelector(state => state?.settings?.user?.shcc);
    const dispatch = useDispatch();

    const renderContent = () => {
        if (!list)
            return <ActivityIndicator size='large' color={colors.primary} style={commonStyles.mb20} />
        else {
            const content = [];
            if (!list.length)
                content.push(<List.Item key='emptyChiDao' title={'Chưa có chỉ đạo'} />)
            else {
                list.forEach((item, key) => {
                    content.push(<List.Item key={key} style={styles.conductItem} left={() => null} title={() => (<Comment style={commonStyles.m5} name={`${item.ho} ${item.ten}`.trim().normalizedName()} timestamp={item.thoiGian} image={T.config.API_URL + (item.image ? item.image.substring(1) : 'img/avatar.png')} content={item.chiDao} />)} />);
                });
            }
            content.push(chiDaoBox);
            return content;
        }
    };

    const onSubmit = () => {
        const data = {
            canBo: shcc,
            chiDao: chiDao,
            thoiGian: new Date().getTime(),
            congVan: id,
        };
        dispatch(createChiDao(data, () => dispatch(getChiDao(id, () => setChiDao('')))));
    }

    const chiDaoBox = shcc ? <List.Item key='chiDaoTextBox' left={() => null} style={styles.conductTitleWrapper} title={() => (<View style={styles.conductTitleText}>
        <FormTextBox style={styles.conductInput} value={chiDao} onChangeText={text => setChiDao(text)} placeholder='Nhập chỉ đạo' />
        <TouchableOpacity onPress={onSubmit}>
            <Ionicons name='paper-plane-outline' size={30} style={{ color: colors.primary }} />
        </TouchableOpacity>
    </View>)} /> : null;


    return <Card elevation={4} style={commonStyles.m5}>
        <List.Accordion id='chiDao'
            title='Chỉ đạo'
            left={props => {
                return <Ionicons {...props} size={20} style={commonStyles.m5} name='alert-circle-outline' />
            }}
            expanded={isExpand}
            onPress={() => setIsExpand(!isExpand)}>
            {renderContent()}
        </List.Accordion>
    </Card>

}

const actionToText = (value) => {
    switch (value) {
        case action.CREATE:
            return 'tạo';
        case action.VIEW:
            return 'xem';
        case action.UPDATE:
            return 'cập nhật';
        case action.RETURN:
            return 'trả lại';
        case action.APPROVE:
            return 'duyệt';
        case action.PUBLISH:
            return 'phân phối';
        case action.UPDATE_STATUS:
            return 'cập nhật trạng thái';
        default:
            return '';
    }
};


const FileList = ({ navigation }) => {
    const listFile = useSelector(state => state.hcthCongVanDen?.item?.files);
    const id = useSelector(state => state.hcthCongVanDen?.item?.id);
    const { colors } = useTheme();
    const [isExpand, setIsExpand] = useState(true);
    const renderContent = () => {

        if (!listFile)
            return <ActivityIndicator size='large' color={colors.primary} style={commonStyles.mb20} />
        else if (!listFile.length)
            return <List.Item title={'Chưa có tập tin công văn'} />
        else {
            const items = listFile.map((item, key) => {
                const originalName = item.file.ten,
                    linkFile = `${T.config.API_URL}api/hcth/cong-van-den/download/${id || 'new'}/${originalName}`,
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
    const history = useSelector(state => state.hcthCongVanDen?.item?.history);
    const user = useSelector(state => state.settings?.user);
    const userShcc = user.shcc;
    const { colors } = useTheme();
    const [isExpand, setIsExpand] = useState(true);
    const renderContent = () => {

        if (!history)
            return <ActivityIndicator size='large' color={colors.primary} style={commonStyles.mb20} />
        else if (!history.length)
            return <List.Item left={() => null} title={'Chưa có lịch sử'} />
        else {
            const data = history.map(item => {
                const style = {};
                if (item.hanhDong == action.CREATE) {
                    style.lineColor = '#009688';
                    style.circleColor = '#009688';
                }
                else if (item.hanhDong == action.RETURN) {
                    style.lineColor = 'red';
                    style.circleColor = 'red';
                }
                return {
                    title: item?.thoiGian ? T.dateToText(new Date(item.thoiGian), 'hh:mm, dd/mm/yyyy') : null,
                    description: (item.shcc !== userShcc ? `${item.ho || ''} ${item.ten || ''}`.trim().normalizedName() : 'Bạn') + ` đã ${actionToText(item.hanhDong)} công văn này.`,
                    ...style
                }
            });
            return (<List.Item style={commonStyles.flex1} left={() => null} title={() => (<Timeline data={data} isUsingFlatlist={false} showTime={false} separator={true} />)} />);

        };
    }


    return <Card style={commonStyles.m5} elevation={4}>
        <List.Accordion id='history'
            title='Lịch sử'
            left={props => {
                return <Ionicons {...props} size={20} style={commonStyles.m5} name='people-outline' />
            }}
            expanded={isExpand}
            onPress={() => setIsExpand(!isExpand)}>
            {renderContent()}
        </List.Accordion>
    </Card>
};

class TraLaiCongVanModal extends AdminModal {
    state = { lyDo: '' }

    traLai = () => {
        const data = {
            lyDo: this.state.lyDo,
            id: this.props.id
        }
        this.props.onTraLaiCongVan(data, this.hide);
    }

    render = () => {
        return this.renderModal({
            title: 'Trả lại công văn',
            content: <>
                <TextInput mode='outlined' label={'Lý do'} theme={{ roundness: 20 }} value={this.state.lyDo} onChangeText={value => this.setState({ lyDo: value })} />
            </>,
            button: [<Button key={1} color='red' onPress={this.traLai}>Trả lại</Button>]
        });
    }
}

class DuyetCongVanModal extends AdminModal {
    state = { noiDung: '' }

    duyet = () => {
        const data = {
            noiDung: this.state.noiDung,
            id: this.props.id
        }
        this.props.onDuyetCongVan(data, this.hide);
    }

    render = () => {
        return this.renderModal({
            title: 'Duyệt công văn',
            content: <>
                <FormTextBox placeholder='Nội dung' value={this.state.noiDung} onChangeText={value => this.setState({ noiDung: value })} />
            </>,
            button: [<Button key={1} color='red' onPress={this.duyet}>Duyệt</Button>]
        });
    }
}

const CongVanDen = (props) => {
    const { navigation, route } = props;
    const dispatch = useDispatch();
    const item = useSelector(state => state?.hcthCongVanDen?.item);
    const user = useSelector(state => state?.settings);
    const userPermissions = useSelector(state => state?.settings?.user?.permissions);
    const isPresident = userPermissions.includes('rectors:login');
    const [context, setContext] = useState({});
    const [refreshing, setRefreshing] = useState();
    const [isMenuVisible, setIsMenuVisible] = React.useState(false);
    const [banGiamHieu, setBanGiamHieu] = useState([]);
    const danhSachQuyenChiDao = (item?.quyenChiDao && item.quyenChiDao.split(',')) || [];
    const [quyenChiDao, setQuyenChiDao] = useState(danhSachQuyenChiDao.length > 0);
    const traLaiModal = useRef(null);
    const duyetModal = useRef(null);
    const { colors } = useTheme();
    const getData = (done) => {
        const congVanId = route.params.congVanDenId;
        dispatch(getCongVanDen(congVanId, context, done));
        dispatch(getStaffPage(1, 100, '', { listDonVi: '68' }, (page) => {
            setBanGiamHieu(page.list);
        }));
    };



    const onRefresh = () => {
        setRefreshing(true);
        getData(() => setRefreshing(false));
    };

    useEffect(() => {
        dispatch({ type: HcthCongVanDenGet, item: null });
        getData();
    }, []);

    const onChangeNeedConduct = (value) => {
        setQuyenChiDao(value);
        if (value) {
            const presiendents = banGiamHieu.filter(item => item.maChucVuChinh === '001').map(item => item.shcc);
            const congVanId = route.params.congVanDenId;
            dispatch(updateQuyenChiDao(congVanId, presiendents.join(','), item.trangThai, true, (res) => {
                if (!res.error) {
                    T.alert('Công văn đến', 'Thêm quyền chỉ đạo thành công')
                }
                else {
                    T.alert('Lỗi', 'Thêm quyền chỉ đạo lỗi');
                    setQuyenChiDao(!value);
                }
            }));
        } else {
            let newTrangThai = item.trangThai;
            if (newTrangThai == trangThai.CHO_DUYET.id) newTrangThai = trangThai.CHO_PHAN_PHOI.id;
            const congVanId = route.params.congVanDenId;

            dispatch(updateQuyenChiDao(congVanId, item.quyenChiDao, newTrangThai, false, (res) => {
                if (res.error) {
                    T.alert('Lỗi', 'Xoá quyền chỉ đạo lỗi');
                    setQuyenChiDao(!value);
                }
                else {
                    T.alert('Công văn đến', 'Xoá quyền chỉ đạo thành công');
                }
            }));
        }
    }

    const genneralInfo = () => {
        return <Card style={styles.generalInfoWrapper} elevation={4}>
            <Card.Title title={`Công văn đến #${item.id}`} right={headerRightButton} />
            <Card.Content>
                <List.Item title='Số công văn' right={() => <Text variant='bodyMedium' style={styles.generalInfoItem}>{item?.soCongVan || 'Chưa có'}</Text>} />
                <List.Item title='Số đến' right={() => <Text variant='bodyMedium' style={styles.generalInfoItem}>{item?.soDen || 'Chưa có'}</Text>} />
                <List.Item title='Ngày công văn' right={() => <Text variant='bodyMedium' style={styles.generalInfoItem}>{item?.ngayCongVan ? T.dateToText(item.ngayCongVan) : 'Chưa có'}</Text>} />
                <List.Item title='Ngày nhận' right={() => <Text variant='bodyMedium' style={styles.generalInfoItem}>{item?.ngayNhan ? T.dateToText(item.ngayNhan) : 'Chưa có'}</Text>} />
                <List.Item title='Ngày hết hạn' right={() => <Text variant='bodyMedium' style={styles.generalInfoItem}>{item?.ngayHetHan ? T.dateToText(item.ngayHetHan) : 'Chưa có'}</Text>} />
                <List.Item title='Trạng thái' right={() => <Text variant='bodyMedium' style={{ ...styles.generalInfoItem, color: Object.values(trangThai)[item.trangThai]?.color, fontWeight: 'bold' }}>{Object.values(trangThai)[item.trangThai]?.text}</Text>} />
                <List.Item title='Đơn vị gửi'
                    description={item?.tenDonViGui}
                    descriptionNumberOfLines={null}
                />
                <List.Item title='Trích yếu'
                    description={item?.trichYeu}
                    descriptionNumberOfLines={null}
                />
                <List.Item title='Công văn cần chỉ đạo'
                    right={() =>
                        <Switch
                            color="#007bff"
                            style={commonStyles.switchButton}
                            value={quyenChiDao}
                            onValueChange={onChangeNeedConduct}
                            disabled={!isPresident}
                        />
                    } />
            </Card.Content>
        </Card>
    }

    if (!item)
        return <ActivityIndicator size='large' color={colors.primary} style={commonStyles.activityIndicator} />


    const openMenu = () => setIsMenuVisible(true);
    const closeMenu = () => setIsMenuVisible(false);
    const onTraLaiCongVan = (data, done) => dispatch(traLaiCongVan(data, () => getData(done)));
    const onDuyetCongVan = (data, done) => dispatch(duyetCongVan(data, () => getData(done)));
    const menuItems = [];
    if (item?.trangThai == trangThai.CHO_DUYET.id) {
        menuItems.push(<Menu.Item key='duyet' onPress={() => { closeMenu(); duyetModal.current?.show(); }} title="Duyệt công văn" />);
        menuItems.push(<Menu.Item key='tra-lai' onPress={() => { closeMenu(); traLaiModal.current?.show(); }} title="Trả lại công văn" />);
    }

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
            {genneralInfo()}
            <FileList navigation={navigation} />
            <CanBoNhan />
            {quyenChiDao && <CanBoChiDao id={route.params.congVanDenId} banGiamHieu={banGiamHieu} />}
            <DonViNhan />
            <ChiDao />
            <PhanHoi />
            <History />
            <TraLaiCongVanModal ref={traLaiModal} id={item.id} onTraLaiCongVan={onTraLaiCongVan} />
            <DuyetCongVanModal ref={duyetModal} id={item.id} onDuyetCongVan={onDuyetCongVan} />
            <View style={commonStyles.mb50} />
        </>,
        // scrollEnabled: !isModalShown,
        // headerRightButton: headerRightButton,
        style: {},
        refreshControl: <RefreshControl colors={['#9Bd35A', '#689F38']} refreshing={refreshing} onRefresh={onRefresh} />,
    });
};

export default CongVanDen;
