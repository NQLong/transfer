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
    const { source, key, fileIndex, id, listSignFile } = route.params;

    const file = listSignFile[fileIndex];

    const { config } = file;

    const [sourcePdf, setSourcePdf] = useState(source);

    const [page, setPage] = useState(1);

    const [coordinates, setCoordinates] = useState({ x: config.xCoordinate ?? 0 , y: config.yCoordinate ?? 0});

    const [pageSize, setPageSize] = useState({ width: 0, height: 0});

    const [numOfPages, setNumOfPages] = useState(0);

    const [isPreviewSign, setIsPreviewSign] = useState(false);

    const scrollRef = useRef();

    const pressHandler = () => {
        console.log(coordinates);
        console.log('final page height: ', pageSize, pageSize.height - coordinates.y);
        Alert.alert('KÝ', 'Bạn có chắc chắn muốn ký ở vị trí này không ?', [
            {text: 'XÁC NHẬN',
            // onPress: () => {
            //     navigation.setOptions({ title: 'Xem lại vị trí kí!' });
            onPress: () => navigation.replace('PreviewSignFile', { ...route.params, 
                source: sourcePdf, 
                id,
                page,
                x: coordinates.x * 1.6 - 35,
                y: coordinates.y * 1.6 - 215 - 40,
                scale: 0.5,
                fileIndex
            })},
                //navigation.push('CongVanTrinhKySign', { key, linkFile: source.uri, id});
            {text: 'KHÔNG', style: 'cancel'}
        ])
    };

    const fetchFile = async (url) => {
        return ReactNativeBlobUtil.fetch('GET', url);
    }

    const onGoToPrevPage = () => setPage(page - 1);

    const onGoToNextPage = () => setPage(page + 1);

    useEffect(() => {
        console.log('load');

        const loadPdf = async () => {

            console.log(source.uri);

            const res = await fetchFile(source.uri);

            const signatureFileUrl = T.config.API_URL + 'api/hcth/chu-ky/download';

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

                    setPageSize({ width, height });

                    const jpgDims = jpgImage.scale(0.25);

                    console.log('jpgDims :', jpgDims);

                    console.log(width, height);

                    let signPosX = coordinates.x * 1.6 - 35;
                    let signPosY = height - coordinates.y * 1.6 - 190;

                    console.log(signPosX, signPosY);

                    if (coordinates.x === 0 && coordinates.y === 0) {
                        signPosX = width/ 2;
                        signPosY = height/ 2;
                    }

                    firstPage.drawImage(jpgImage, {
                        x: signPosX,
                        y: signPosY,
                        width: jpgDims.width,
                        height: jpgDims.height,
                        borderColor: rgb(1, 0, 0)
                      })
                    
                    const pdfBytes = await pdfDoc.save();

                    const newArrBuffer = new Buffer.from(new Uint8Array(pdfBytes));

                    const pdfBase64 = newArrBuffer.toString('base64');

                    setSourcePdf({ uri: 'data:application/pdf;base64,' + pdfBase64 });

                    scrollRef.current.scrollTo({ x: width, y: height, animated: true });
                    
            }
            // })
        }
        loadPdf();
        
    }, [coordinates]);

    return <View style={styles.container} onTouchStart={(e) => {console.log('touchMove',e.nativeEvent)}}>
                <View style={styles.pdfBar}>
                        <View style={styles.prevTouch}>
                            { page > 1 && 
                            <TouchableOpacity onPress={onGoToPrevPage}>
                                <Ionicons name='chevron-back-outline' size={30} color='#000'/>
                            </TouchableOpacity>}
                        </View>
                    
                    <View styles={styles.paging}>
                        <Text>Trang {page}/{numOfPages}</Text>
                    </View>

                        <View style={styles.nextTouch}>
                            { page < numOfPages && 
                            <TouchableOpacity onPress={onGoToNextPage}>
                                <Ionicons name='chevron-forward-outline' size={30} color='#000'/>
                            </TouchableOpacity> }
                        </View>
                </View>

                <ScrollView ref={scrollRef}>
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

                        enablePaging={true} 
                        page={page}
                    />

                    {
                    key &&  <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.buttonSign} onPress={pressHandler}>
                        <Ionicons name='checkmark-outline' size={30} color='#FFF'/>
                    </TouchableOpacity>
                    </View>
                    }

                </ScrollView>
    </View>
}

export default SelectSignPosition;