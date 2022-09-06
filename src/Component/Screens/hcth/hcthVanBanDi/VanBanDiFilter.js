import React, { useRef, useState, useEffect } from 'react';
import { SelectAdapter_DmDonVi } from '@/Store/settings';
import { FormSelect, renderScrollView } from '@/Utils/component';
import { TouchableOpacity, View } from 'react-native';
import { Card, Text, TextInput, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import filterStyles from './filterStyles';
import commonStyles from '../../../../Asset/Styles/styles';
import { HcthVanBanDiSearch } from './redux';


const trangThaiCongVanDi = {
    NHAP: { id: 1, text: 'Nháp', color: '#17a2b8' },
    XEM_XET: { id: 6, text: 'Xem xét', color: '#007bff' },
    CHO_KIEM_TRA: { id: 2, text: 'Chờ kiểm tra', color: '#007bff' },
    CHO_DUYET: { id: 3, text: 'Chờ duyệt', color: '#007bff' },
    TRA_LAI: { id: 4, text: 'Trả lại', color: '#dc3545' },
    DA_XEM_XET: { id: 5, text: 'Đã xem xét', color: '#28a745' },
    DA_DUYET: { id: 7, text: 'Đã duyệt', color: '#28a745' },
    CHO_PHAN_PHOI: { id: 8, text: 'Chờ phân phối', color: '#007bff' },
    CHO_KY: { id: 9, text: 'Chờ ký', color: '#007bff' },
    DA_PHAN_PHOI: { id: 10, text: 'Đã phân phối', color: '#28a745' },
    TRA_LAI_PHONG: { id: 11, text: 'Trả lại (Đơn vị)', color: '#dc3545' },
    TRA_LAI_HCTH: { id: 12, text: 'Trả lại (HCTH)', color: '#dc3545' },
};

const VanBanDiFilter = ({ navigation }) => {
    const { colors } = useTheme();
    const search = useSelector(state => state?.hcthVanBanDi?.search) || {};
    const [searchTerm, setSearchTerm] = useState(search.searchTerm || '');
    const trangThaiRef = useRef(null);
    const dispatch = useDispatch();


    useEffect(() => {
        trangThaiRef.current?.value(search?.status);
    }, [search]);

    const onSearch = () => {
        const [trangThaiCongVanDi] = trangThaiRef.current?.selectedItems();
        dispatch({
            type: HcthVanBanDiSearch,
            search: {
                searchTerm,
                status: trangThaiCongVanDi?.id,
                textValue: {
                    status: trangThaiCongVanDi?.text,
                    searchTerm,
                }
            }
        });
        navigation.navigate('vanBanDiPage', {});
    };

    return renderScrollView({
        nestedScrollEnabled: true,
        content: <Card style={filterStyles.container} elevation={4}>
            <TextInput outlineColor='#868FA0' style={filterStyles.textInput} mode='outlined' label='Tìm kiếm' theme={{ roundness: 20 }} value={searchTerm} onChangeText={(text) => setSearchTerm(text)} />

            <FormSelect ref={trangThaiRef} data={Object.values(trangThaiCongVanDi)} label='Trạng thái' style={commonStyles.mt10} />
            <View style={filterStyles.searchView}>
                <TouchableOpacity style={{ ...filterStyles.searchTouchable, backgroundColor: colors.primary }} onPress={onSearch} disabled={false}>
                    <Text style={{ ...filterStyles.searchText, color: colors.background }}>Tìm kiếm</Text>
                </TouchableOpacity>
            </View>
        </Card>
    });

};

export default VanBanDiFilter