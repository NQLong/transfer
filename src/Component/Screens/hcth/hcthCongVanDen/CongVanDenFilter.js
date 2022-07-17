import React, { useRef, useState, useEffect } from 'react';
import { SelectAdapter_DmDonVi } from '@/Store/settings';
import { FormSelect, renderScrollView } from '@/Utils/component';
import { TouchableOpacity, View } from 'react-native';
import { Card, Text, TextInput, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { HcthCongVanDenSearch, SelectAdapter_DmDonViGuiCongVan } from './redux';
import filterStyles from './filterStyles';
import commonStyles from '../../../../Asset/Styles/styles';

const
    start = new Date().getFullYear(),
    end = 1900,
    yearSelector = [...Array(start - end + 1).keys()].map(i => ({
        // itemKey: 'value',
        id: start - i,
        value: start - i,
        text: `${start - i}`
    }));

const trangThai = {
    // MOI: { id: 0, text: 'Nháp' },
    CHO_DUYET: { id: 1, text: 'Chờ duyệt' },
    TRA_LAI_BGH: { id: 2, text: 'Trả lại' },
    CHO_PHAN_PHOI: { id: 3, text: 'Chờ phân phối' },
    TRA_LAI_HCTH: { id: 4, text: 'Trả lại (HCTH)' },
    DA_PHAN_PHOI: { id: 5, text: 'Đã phân phối' },
};

const CongVanDenFilter = ({ navigation }) => {
    const { colors } = useTheme();
    const search = useSelector(state => state.hcthCongVanDen?.search) || {};
    const [searchTerm, setSearchTerm] = useState(search.searchTerm || '');
    const yearRef = useRef(null);
    const donViNhanRef = useRef(null);
    const trangThaiRef = useRef(null);
    const donViGuiRef = useRef(null);
    const dispatch = useDispatch();

    useEffect(() => {
        yearRef.current?.value(search?.congVanYear);
        donViNhanRef.current?.value(search?.donViNhanCongVan);
        trangThaiRef.current?.value(search?.status);
        donViGuiRef.current?.value(search?.donViGuiCongVan);
    }, [search]);

    const onSearch = () => {
        const
            [donViNhan] = donViNhanRef.current?.selectedItems(),
            [donViGui] = donViGuiRef.current?.selectedItems(),
            [trangThai] = trangThaiRef.current?.selectedItems(),
            congVanYear = yearRef.current?.value() || '';
        dispatch({
            type: HcthCongVanDenSearch,
            search: {
                searchTerm,
                congVanYear,
                donViNhanCongVan: donViNhan?.id || '',
                status: trangThai?.id,
                donViGuiCongVan: donViGui?.id,
                textValue: {
                    donViNhanCongVan: donViNhan?.text,
                    status: trangThai?.text,
                    searchTerm,
                    congVanYear,
                    donViGuiCongVan: donViGui?.text,
                }
            }
        })
        navigation.navigate('congVanDenPage', {});
    };


    return renderScrollView({
        nestedScrollEnabled: true,
        content: <Card style={filterStyles.container} elevation={4}>
            <TextInput outlineColor='#868FA0' style={filterStyles.textInput} mode='outlined' label='Tìm kiếm' theme={{ roundness: 20 }} value={searchTerm} onChangeText={(text) => setSearchTerm(text)} />
            <FormSelect ref={trangThaiRef} data={Object.values(trangThai)} label='Trạng thái công văn' style={commonStyles.mt10} />
            <FormSelect ref={yearRef} data={yearSelector} label='Năm' style={commonStyles.mt10} />
            <FormSelect ref={donViGuiRef} data={SelectAdapter_DmDonViGuiCongVan} label='Đơn vị gửi' style={commonStyles.mt10} />
            <FormSelect ref={donViNhanRef} data={SelectAdapter_DmDonVi} label='Đơn vị nhận' style={commonStyles.mt10} />
            <View style={filterStyles.searchView}>
                <TouchableOpacity style={{...filterStyles.searchTouchable, backgroundColor: colors.primary }} onPress={onSearch} disabled={false}>
                    <Text style={{ ...filterStyles.searchText, color: colors.background}} >Tìm kiếm</Text>
                </TouchableOpacity>
            </View>
        </Card >
    });
}


export default CongVanDenFilter