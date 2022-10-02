import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Text, TouchableOpacity, View } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Pdf from 'react-native-pdf';
import Ionicons from 'react-native-vector-icons/Ionicons';
global.Buffer = global.Buffer || require('buffer').Buffer
import { Buffer } from 'buffer';
import T from '@/Utils/common';
import { PDFDocument, rgb } from 'pdf-lib';
import styles from './styles';
import { vanBanDi } from '@/Utils/contants';

const RNFS = require('react-native-fs');

const PositionPick = ({ navigation, route }) => {
    const { files, item, retry } = route.params;
    const [sourcePdf, setSourcePdf] = useState();
    const [rawPdf, setRawPdf] = useState();
    const [repick, setRepick] = useState(false);
    const [signTypeItem, setSignTypeItem] = useState({});
    const [imageBase64, setImageBase64] = useState({});
    const [pdfDoc, setPdfDoc] = useState(null);
    const [viewSize, setViewSize] = useState(Dimensions.get('window'));
    const [page, setPage] = useState(null);
    const [config, setConfig] = useState(files[0].config.find(configItem => configItem.signType == item.trangThai));

    const fetchFile = async (url) => {
        return await T.get(url);
    }

    const init = async () => {
        const file = files[0];
        const url = `/api/hcth/van-ban-di/file/${file.id}?format=base64`;
        const config = file.config.find(configItem => configItem.signType == item.trangThai);
        const signTypeItem = vanBanDi.signType[config.signType]
        setSignTypeItem(signTypeItem);
        let pdfData;
        let signatureImg;
        try {
            pdfData = await fetchFile(url);
            setRawPdf(pdfData.data);
            setPdfDoc(await PDFDocument.load(Buffer.from(pdfData.data, 'base64')));
            const signatureFileUrl = `api/hcth/chu-ky/download?format=base64&width=${signTypeItem.width}&height=${signTypeItem.height}`;
            signatureImg = await fetchFile(signatureFileUrl);
            setImageBase64(signatureImg.data);
        } catch (error) {
            console.error(error);
            return T.alert('Tải tệp văn bản', 'Tải xuống tệp tin văn bản lỗi');
        }

        if (!retry && config.pageNumber != null && config.yCoordinate != null && config.xCoordinate != null)
            // navigation.navaigate('PositionPreview', {})
            await insertPlaceholder(pdfData, signatureImg, signTypeItem, config.xCoordinate, config.yCoordinate, config.pageNumber)


    }

    const insertPlaceholder = async (pdfData, signatureImg, signTypeItem, x, y, pageNumber) => {
        const signatureBytes = Buffer.from(signatureImg.data, 'base64');
        const pdfBytes = Buffer.from(pdfData.data, 'base64');

        //pdflib read
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();
        const pngImage = await pdfDoc.embedPng(signatureBytes);
        const page = pages[pageNumber - 1];

        const { height: pageHeight } = page.getSize();
        page.drawImage(pngImage, {
            x: Math.round(x - 25 / 2),
            y: Math.round(pageHeight - 25 / 2 - y),
            height: 25, width: 25,
            borderColor: rgb(1, 0, 0)
        })
        setSourcePdf(Buffer.from(await pdfDoc.save()).toString('base64'));
        setConfig({ ...config, xCoordinate: x, yCoordinate: y, pageNumber })
    }

    useEffect(() => {
        init().catch(error => console.error(error));
    }, []);

    useLayoutEffect(() => {
        if (!repick) {
            navigation.setOptions({ headerRight: () => <TouchableOpacity onPress={() => setRepick(!repick) || T.alert('Chọn lại vị trí chữ ký', 'Vui lòng nhấn vào vị trí trên văn bản để chọn lại vị trí chữ ký')} style={{ marginRight: 10 }}><Text style={{ color: 'white' }}>Chọn lại</Text></TouchableOpacity> });
        }
        else {
            navigation.setOptions({ headerRight: () => null });
        }
    }, [repick]);

    return <View style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'auto', height: Dimensions.get('window').height, width: Dimensions.get('window').width }} onTouchStart={(e) => { }}>
        <View style={{ ...viewSize }}>
            {sourcePdf && <Pdf
                source={{ uri: sourcePdf ? "data:application/pdf;base64," + sourcePdf : '' }}
                onLoadComplete={(numberOfPages, filePath, size) => {
                    setPage(page || config.pageNumber);
                }}
                onPageChanged={(page, numberOfPages) => {
                    const pages = pdfDoc.getPages(),
                        docPage = pages[page - 1],
                        size = docPage.getSize(),
                        dimensionsWidth = Dimensions.get('window').width,
                        scale = dimensionsWidth / size.width,
                        height = size.height * scale;
                    if (height != viewSize.height)
                        setViewSize({ width: dimensionsWidth, height });
                }}
                onError={(error) => { console.error(error) }}
                onPressLink={(uri) => { }}
                onPageSingleTap={(page, x, y) => {
                    if (repick) {
                        setRepick(false);
                        setPage(page);
                        insertPlaceholder({ data: rawPdf }, { data: imageBase64 }, signTypeItem, x, y, page).then(() => setRepick(true)).catch(error => console.error(error));
                    }
                }}
                trustAllCerts={false}
                maxScale={100}
                style={{ flex: 1, margin: 0, padding: 0 }}
                enablePaging={true}
                page={page}
            />
            }
        </View>

        {/* {
            key && <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.buttonSign} onPress={pressHandler}>
            <Ionicons name='checkmark-outline' size={30} color='#FFF' />
            </TouchableOpacity>
            </View>
        } */}

        <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.buttonSign} onPress={() => {
                navigation.navigate('CongVanTrinhKySign', { files, config, item })
            }}>
                <Ionicons name='pencil-outline' size={30} color='#FFF' />
            </TouchableOpacity>
        </View>


    </View>
}

export default PositionPick;