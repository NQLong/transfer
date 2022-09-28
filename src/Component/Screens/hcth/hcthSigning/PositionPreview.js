import React, { useEffect, useState, useRef,  } from 'react';
import ReactNativeBlobUtil from 'react-native-blob-util'
global.Buffer = global.Buffer || require('buffer').Buffer
import { View, Dimensions, Alert, TouchableOpacity, Text, Button, ScrollView } from 'react-native';
import Pdf from 'react-native-pdf';
import Ionicons from 'react-native-vector-icons/Ionicons';

import T from '@/Utils/common';

import styles from './styles';

const PositionPreview = ({ navigation, route }) => {
    const { source, page, key, fileIndex, id, x, y, scale, listSignFile } = route.params;

    const file = listSignFile[fileIndex];

    const [sourcePdf, setSourcePdf] = useState(source);

    const pressHandler = () => { navigation.push('CongVanTrinhKySign', { key, linkFile: source.uri, fileIndex, id, x, y, scale, page, listSignFile }) };

    useEffect(() => {
        const linkFile = `${T.config.API_URL}api/hcth/van-ban-di/download/${file.vanBanDi}/${file.file.tenFile}`;
        navigation.setOptions({
            headerRight: () => <TouchableOpacity
                onPress={() => navigation.replace('SelectSignPos', { ...route.params, source: { uri: linkFile, cache: true } })}
                style={{ marginRight: 10 }}>
                <Text style={{ color: 'white' }}>Chọn lại</Text>
            </TouchableOpacity>
        });
    }, []);


    return <View style={styles.container} onTouchStart={(e) => { }}>
        <Pdf
            source={sourcePdf}
            scale={1}
            onLoadComplete={(numberOfPages, filePath) => {
                
            }}
            onPageChanged={(page, numberOfPages) => {}}
            onError={(error) => {
            }}
            onPressLink={(uri) => {
            }}
            trustAllCerts={false}
            maxScale={100}
            style={
                {
                    flex: 1,
                    width: '100%',
                    height: Dimensions.get('window').height,
                    backgroundColor: 'white'
                }
            }
            enablePaging={true}
            page={page}
        />

        <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.buttonSign} onPress={pressHandler}>
                <Ionicons name='pencil-outline' size={30} color='#FFF' />
            </TouchableOpacity>
        </View>
    </View>
}

export default PositionPreview;