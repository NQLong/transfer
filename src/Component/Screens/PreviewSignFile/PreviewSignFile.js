import React, { useEffect, useState, useRef } from 'react';
import ReactNativeBlobUtil from 'react-native-blob-util'
global.Buffer = global.Buffer || require('buffer').Buffer
import { View, Dimensions, Alert, TouchableOpacity, Text, Button, ScrollView } from 'react-native';
import Pdf from 'react-native-pdf';
import Ionicons from 'react-native-vector-icons/Ionicons';
import fs from 'react-native-fs';

import { Buffer } from 'buffer';

import T from '@/Utils/common';

import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';

import toBuffer from 'blob-to-buffer';
import styles from './styles';
import { Title } from 'react-native-paper';

const RNFS = require('react-native-fs');

const SelectSignPosition = ({ navigation, route }) => {
    const { source, page, key, file, id, x, y, scale} = route.params;

    console.log(x, y);

    console.log('file id:', id);

    const [sourcePdf, setSourcePdf] = useState(source);

    const pressHandler = () => {
        navigation.push('CongVanTrinhKySign', { 
            key, 
            linkFile: source.uri, 
            file,
            id,
            x,
            y,
            scale,
            page
        });
    };

    useEffect(() => {
        console.log('load');
        const linkFile = `${T.config.API_URL}api/hcth/van-ban-di/download/${file.id}/${file.tenFile}`;
        console.log(linkFile);
        navigation.setOptions({
            headerRight: () => <TouchableOpacity
            onPress={() => navigation.replace('SelectSignPos', { ...route.params, source: { uri: linkFile, cache: true } })}
                style={{marginRight: 10}}>
                <Text style={{color: 'white'}}>Chọn lại</Text>
            </TouchableOpacity>
        });
    }, []);


    return <View style={styles.container} onTouchStart={(e) => {console.log('touchMove',e.nativeEvent)}}>
                    <Pdf
                        source={sourcePdf}
                        scale={1}
                        onLoadComplete={(numberOfPages, filePath) => {
                            console.log(`Number of pages: ${numberOfPages}`);
                        }}
                        onPageChanged={(page, numberOfPages) => {
                            console.log(`Current page: ${page}`);
                        }}
                        onError={(error) => {
                            console.log(error);
                        }}
                        onPressLink={(uri) => {
                            console.log(`Link pressed: ${uri}`);
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
                            <Ionicons name='pencil-outline' size={30} color='#FFF'/>
                        </TouchableOpacity>
                    </View>
    </View>
}

export default SelectSignPosition;