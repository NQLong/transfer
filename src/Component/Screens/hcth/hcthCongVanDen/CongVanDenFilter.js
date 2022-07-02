import React, { useRef, useState } from 'react';
import { renderScrollView } from '@/Utils/component';
import { Card, TextInput, useTheme, Text } from 'react-native-paper';
import { View, TouchableOpacity } from 'react-native';
import { button } from '@/Asset/Styles.js/styles';
import { FormSelect } from '@/Utils/component';
import { ScrollView } from 'react-native-gesture-handler';
const
    start = new Date().getFullYear(),
    end = 1900,
    yearSelector = [...Array(start - end + 1).keys()].map(i => ({
        // itemKey: 'value',
        id: start - i,
        value: start - i,
        label: `${start - i}`
    }));

const CongVanDenFilter = ({ navigation }) => {
    const { colors } = useTheme();
    const [search, setSearch] = useState('');
    const yearRef = useRef(null);
    // return <ScrollView nestedScrollEnabled={true} style={{flex: 1}}>
    // </ScrollView>

    const onSearch = () => {
        navigation.navigate('congVanDenPage', { pageCondition: search, congVanYear: yearRef.current?.value() });
    };


    return renderScrollView({
        nestedScrollEnabled: true,
        content: <Card style={{ margin: 5, padding: 5 }} elevation={4}>
            <TextInput outlineColor='#868FA0' style={{ outlineColor: 'red' }} mode='outlined' label='Tìm kiếm' theme={{ roundness: 20 }} value={search} onChangeText={(text) => setSearch(text)} />
            <FormSelect ref={yearRef} style={{ borderRadius: 20, marginTop: 20, borderColor: '#868FA0' }} items={yearSelector} placeholder='Năm' />
            <View style={{ alignItems: 'center', marginTop: 20, flex: 1, marginBottom: 20 }}>
                <TouchableOpacity style={{ height: 50, width: '70%', borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary }} onPress={onSearch} disabled={false}>
                    <Text style={{ fontFamily: 'Work Sans', color: colors.background, fontSize: 19, fontWeight: 'bold' }} >Tìm kiếm</Text>
                </TouchableOpacity>
            </View>
        </Card >
    });
}


export default CongVanDenFilter