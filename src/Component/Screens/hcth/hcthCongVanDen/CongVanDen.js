import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getCongVanDen, HcthCongVanDenGet } from './redux';
import { useTheme } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FloatingAction } from "react-native-floating-action";

import { Tile, MenuItem, Comment, FormTextBox } from '@/Utils/componennt';
import T from '@/Utils/common';
import { renderScrollView } from '@/Utils/componennt';
import Timeline from 'react-native-timeline-flatlist';

const trangThai = {
    MOI: { id: 0, text: 'Nháp' },
    CHO_DUYET: { id: 1, text: 'Chờ duyệt' },
    TRA_LAI_BGH: { id: 2, text: 'Trả lại' },
    CHO_PHAN_PHOI: { id: 3, text: 'Chờ phân phối' },
    TRA_LAI_HCTH: { id: 4, text: 'Trả lại (HCTH)' },
    DA_PHAN_PHOI: { id: 5, text: 'Đã phân phối' },
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

const PhanHoi = () => {
    const list = useSelector(state => state?.hcthCongVanDen?.item?.phanHoi);
    const { colors } = useTheme();
    const [isExpand, setIsExpand] = useState(false);
    const [phanHoi, setPhanHoi] = useState('');
    const renderContent = () => {
        if (!list)
            return <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 20 }} />
        else if (!list.length)
            return <Text>Chưa có phản hồi</Text>
        else {
            const items = list.map((item, key) => {
                return <Comment style={{ marginLeft: 5, marginBottom: 10 }} key={key} name={`${item.ho} ${item.ten}`.trim().normalizedName()} timestamp={item.ngayTao} image={item.image ? item.image : T.config.API_URL + 'img/avatar.png'} content={item.noiDung} />
            });
            return items;
        };
    }

    const expand = <View style={{ marginTop: 10, paddingLeft: 10, paddingRight: 10 }}>
        {renderContent()}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <FormTextBox style={{ flex: 1, marginRight: 10 }} value={phanHoi} onChangeText={text => setPhanHoi(text)} placeholder='Nhập phản hồi' />
            <TouchableOpacity>
                <Ionicons name='paper-plane-outline' size={30} style={{ color: colors.primary }} />
            </TouchableOpacity>
        </View>
    </View >;
    const button = <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => { setIsExpand(!isExpand) }} >
        <Text style={{ fontSize: 15, color: 'black' }}>{isExpand ? 'Thu gọn' : 'Mở rộng'}</Text>
        <Ionicons name={isExpand ? 'chevron-down-outline' : 'chevron-forward-outline'} size={20} />
    </TouchableOpacity>;


    return <Tile style={{}}>
        <MenuItem style={{ borderBottomWidth: 1 }} title='Phản hồi' isExpand={isExpand} button={button} expand={expand} />
    </Tile>
}

const ChiDao = () => {
    const list = useSelector(state => state?.hcthCongVanDen?.item?.danhSachChiDao);
    const { colors } = useTheme();
    const [isExpand, setIsExpand] = useState(false);
    const [chiDao, setChiDao] = useState('')
    const renderContent = () => {

        if (!list)
            return <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 20 }} />
        else if (!list.length)
            return <Text>Chưa có chỉ đạo</Text>
        else {
            const items = list.map((item, key) => {
                return <Comment style={{ marginLeft: 5, marginBottom: 10 }} key={key} name={`${item.ho} ${item.ten}`.trim().normalizedName()} timestamp={item.thoiGian} image={item.image ? item.image : T.config.API_URL + 'img/avatar.png'} content={item.chiDao} />
            });
            return items;
        };
    }

    const expand = <View style={{ marginTop: 10, paddingLeft: 10, paddingRight: 10 }}>
        {renderContent()}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <FormTextBox style={{ flex: 1, marginRight: 10 }} value={chiDao} onChangeText={text => setChiDao(text)} placeholder='Nhập chỉ đạo' />
            <TouchableOpacity>
                <Ionicons name='paper-plane-outline' size={30} style={{ color: colors.primary }} />
            </TouchableOpacity>
        </View>
    </View>;
    const button = <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => { setIsExpand(!isExpand) }} >
        <Text style={{ fontSize: 15, color: 'black' }}>{isExpand ? 'Thu gọn' : 'Mở rộng'}</Text>
        <Ionicons name={isExpand ? 'chevron-down-outline' : 'chevron-forward-outline'} size={20} />
    </TouchableOpacity>;


    return <Tile style={{}}>
        <MenuItem style={{ borderBottomWidth: 1 }} title='Chỉ đạo' isExpand={isExpand} button={button} expand={expand} />
    </Tile>
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
    const listFile = useSelector(state => state.hcthCongVanDen?.item?.listFile);
    const id = useSelector(state => state.hcthCongVanDen?.item?.id);
    const { colors } = useTheme();
    const [isExpand, setIsExpand] = useState(false);
    const renderContent = () => {

        if (!listFile)
            return <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 20 }} />
        else if (!listFile.length)
            return <Text>Chưa có tập tin công văn</Text>
        else {
            const items = listFile.map((item, key) => {
                const
                    originalName = item.ten,
                    linkFile = `${T.config.API_URL}api/hcth/cong-van-den/download/${id || 'new'}/${originalName}`,
                    style = {};
                if (key == 0)
                    style.borderTopWidth = 0;
                return <MenuItem key={key} style={style} title={item.ten} onTitleClick={() => navigation.push('ReadFile', { item, source: { uri: linkFile, cache: true } })} />
            });
            return items;
        };
    }

    const expand = <View style={{ marginTop: 10, paddingLeft: 10, paddingRight: 10 }}>
        {renderContent()}
    </View>;
    const button = <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => { setIsExpand(!isExpand) }} >
        <Text style={{ fontSize: 15, color: 'black' }}>{isExpand ? 'Thu gọn' : 'Mở rộng'}</Text>
        <Ionicons name={isExpand ? 'chevron-down-outline' : 'chevron-forward-outline'} size={20} />
    </TouchableOpacity>;


    return <Tile style={{}}>
        <MenuItem style={{ borderBottomWidth: 1 }} title='Danh sách tập tin công văn' isExpand={isExpand} button={button} expand={expand} />
    </Tile>
}


const History = () => {
    const history = useSelector(state => state.hcthCongVanDen?.item?.history);
    const user = useSelector(state => state.settings?.user);
    const userShcc = user.shcc;
    const { colors } = useTheme();
    const [isExpand, setIsExpand] = useState(false);
    const renderContent = () => {

        if (!history)
            return <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 20 }} />
        else if (!history.length)
            return <Text>Chưa có lịch sử</Text>
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

            return <Timeline data={data} isUsingFlatlist={false} showTime={false} separator={true} />
        };
    }

    const expand = <View style={{ marginTop: 10 }}>
        {renderContent()}
    </View>;
    const button = <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => { setIsExpand(!isExpand) }} >
        <Text style={{ fontSize: 15, color: 'black' }}>{isExpand ? 'Thu gọn' : 'Mở rộng'}</Text>
        <Ionicons name={isExpand ? 'chevron-down-outline' : 'chevron-forward-outline'} size={20} />
    </TouchableOpacity>;


    return <Tile style={{}}>
        <MenuItem style={{ borderBottomWidth: 1 }} title='Lịch sử công văn' isExpand={isExpand} button={button} expand={expand} />
    </Tile>
};

const CongVanDen = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const item = useSelector(state => state?.hcthCongVanDen?.item);
    const [context, setContext] = useState({});
    const [refreshing, setRefreshing] = useState();
    const { colors } = useTheme();
    const getData = (done) => {
        const congVanId = route.params.congVanDenId;
        dispatch(getCongVanDen(congVanId, context, done));
    };


    const onRefresh = () => {
        setRefreshing(true);
        getData(() => setRefreshing(false));
    };

    useEffect(() => {
        dispatch({ type: HcthCongVanDenGet, item: null });
        getData();
    }, []);


    const genneralInfo = () => {
        return <Tile style={{ marginTop: 10, backgroundColor: 'white' }}>
            <MenuItem title='Số công văn' value={item?.soCongVan || 'Chưa có'} />
            <MenuItem title='Số đến' value={item?.soDen || 'Chưa có'} />
            <MenuItem title='Ngày công văn' value={item?.ngayCongVan ? T.dateToText(item.ngayCongVan) : 'Chưa có'} />
            <MenuItem title='Ngày nhận' value={item?.ngayNhan ? T.dateToText(item.ngayNhan) : 'Chưa có'} />
            <MenuItem title='Ngày hết hạn' value={item?.ngayHetHan ? T.dateToText(item.ngayHetHan) : 'Chưa có'} />
            <MenuItem title='Trạng thái' value={Object.values(trangThai)[item.trangThai]?.text} />
            <MenuItem title='Trích yếu' bottomValue={item?.trichYeu} style={{ borderBottomWidth: 1 }} />
        </Tile>
    }

    if (!item)
        return <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 20 }} />

    const actions = [
        {
            text: "Accessibility",
            icon: <Ionicons name={'chevron-down-outline'} size={20} />,
            name: "bt_accessibility",
            position: 2
        },
        {
            text: "Language",
            icon: <Ionicons name={'chevron-forward-outline'} size={20} />,
            name: "bt_language",
            position: 1
        },
        {
            text: "Location",
            icon: <Ionicons name={'chevron-forward-outline'} size={20} />,
            name: "bt_room",
            position: 3
        },
        {
            text: "Video",
            icon: <Ionicons name={'chevron-forward-outline'} size={20} />,
            name: "bt_videocam",
            position: 4
        }
    ];


    return renderScrollView({
        content: <>
            {genneralInfo()}
            <ChiDao />
            <PhanHoi />
            <FileList navigation={navigation} />
            <History />
            <View style={{ marginBottom: 50 }} />
            <FloatingAction
                actions={actions}
                onPressItem={name => {
                    console.log(`selected button: ${name}`);
                }}
            />
        </>,
        style: {},
        refreshControl: <RefreshControl colors={["#9Bd35A", "#689F38"]} refreshing={refreshing} onRefresh={onRefresh} />,
    });
};

export default CongVanDen;
