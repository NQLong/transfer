import React, { useEffect, useState } from 'react';
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

const RNFS = require('react-native-fs');

const ReadFile = ({ navigation, route }) => {
    const { source, key, file, id } = route.params;

    const [sourcePdf, setSourcePdf] = useState(source);

    const [page, setPage] = useState(1);

    const [coordinates, setCoordinates] = useState({ x: 0, y: 0});

    const [numOfPages, setNumOfPages] = useState(0);

    const pressHandler = () => {
        Alert.alert('KÝ', 'Bạn có chắc chắn muốn ký công văn này không ?', [
            {text: 'XÁC NHẬN', onPress: () => navigation.push('CongVanTrinhKySign', { key, linkFile: source.uri, id})},
            {text: 'KHÔNG', onPress: () => navigation.goBack()}
        ])
    };

    console.log(key);

    const fetchFile = async (url) => {
        return ReactNativeBlobUtil.fetch('GET', url);
    }

    useEffect(() => {
        console.log('load');

        const loadPdf = async () => {

            console.log(source.uri);

            const res = await fetchFile(source.uri);

            const signatureFileUrl = T.config.API_URL + 'api/hcth/chu-ky/download';

            console.log(signatureFileUrl);

            const signatureImg = await fetchFile(signatureFileUrl);

            const signatureBytes = Buffer.from(signatureImg.base64(), 'base64');

            // ReactNativeBlobUtil.fetch('GET', source.uri)
            // .then(async (res) => {
            let status = res.info().status;

            if (status == 200) {
                    // the conversion is done in native code
                    let base64Str = res.base64();
                    // the following conversions are done in js, it's SYNC

                    const fileBuffer = Buffer.from(base64Str, 'base64');

                    const pdfDoc = await PDFDocument.load(fileBuffer);

                    const pages = pdfDoc.getPages();

                    const jpgImage = await pdfDoc.embedPng(signatureBytes)

                    const firstPage = pages[page - 1];

                    const { width, height } = firstPage.getSize();

                    const jpgDims = jpgImage.scale(0.25)

                    console.log(width, height);

                    // firstPage.drawRectangle({
                    //     x: coordinates.x * 1.6 - 25,
                    //     y: height - coordinates.y * 1.6 - 25,
                    //     width: 50,
                    //     height: 50,
                    //     color: rgb(1, 0, 0),
                    //     borderColor: rgb(1, 0, 0),
                    //     borderWidth: 1.5,
                    //   })
                    
                    firstPage.drawImage(jpgImage, {
                        x: coordinates.x * 1.6 - 25,
                        y: height - coordinates.y * 1.6 - 25,
                        width: jpgDims.width,
                        height: jpgDims.height,
                        borderColor: rgb(1, 0, 0)
                      })
                    
                    const pdfBytes = await pdfDoc.save();

                    const newArrBuffer = new Buffer.from(new Uint8Array(pdfBytes));

                    const pdfBase64 = newArrBuffer.toString('base64');

                    console.log(pdfBase64.indexOf('data:application/pdf;base64,'));

                    setSourcePdf({ uri: 'data:application/pdf;base64,' + pdfBase64 });
            }
            // })
        }
        loadPdf();
        
    }, [coordinates]);

    return <View style={styles.container} onTouchStart={(e) => {console.log('touchMove',e.nativeEvent)}}>
        <ScrollView ref={(ref) => this.myScroll = ref}>
            <Pdf
                source={sourcePdf}
                scale={1}
                onLoadComplete={(numberOfPages, filePath) => {
                    console.log(`Number of pages: ${numberOfPages}`);
                    setNumOfPages(numberOfPages);
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
                onPageSingleTap={(page, x, y) => {
                    console.log(page, x, y);
                    setPage(page);
                    setCoordinates({ x, y});
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
            />

            {
            key && <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.buttonSign} onPress={pressHandler}>
                <Ionicons name='checkmark-outline' size={30} color='#FFF'/>
            </TouchableOpacity>
            </View>
            }

        </ScrollView>
    </View>
}

export default ReadFile;