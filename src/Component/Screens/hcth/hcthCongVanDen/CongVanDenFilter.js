import React, { useState } from 'react';
import { renderScrollView } from '@/Utils/component';
import { Card, TextInput, useTheme, Text } from 'react-native-paper';
import { View, TouchableOpacity } from 'react-native';
import { button } from '@/Asset/Styles.js/styles';
const CongVanDenFilter = () => {
    const { colors } = useTheme();
    const [search, setSearch] = useState('');

    return renderScrollView({
        content: <Card style={{ margin: 5, padding: 5 }} elevation={4}>
            {/* <TextInput type='outlined' label='Tìm kiếm' value={search} onChangeText={(text) => setSearch(text)} />
            <View style={{ alignItems: 'center', marginTop: 20, flex: 1, marginBottom: 20 }}>
                <TouchableOpacity style={{...button}} onPress={() => { }} disabled={false}>
                    <Text style={{ fontFamily: 'Work Sans', color: colors.background, fontSize: 19, fontWeight: 'bold' }} >Tìm kiếm</Text>
                </TouchableOpacity>
            </View> */}
        </Card >
    })
}


export default CongVanDenFilter