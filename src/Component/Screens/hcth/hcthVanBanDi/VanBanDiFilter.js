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