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
    const [config, setConfig] = useState({});


    const pressHandler = () => {
        T.alert('KÝ', 'Bạn có chắc chắn muốn ký ở vị trí này không ?', [
            {
                text: 'XÁC NHẬN',
                // onPress: () => {
                //     navigation.setOptions({ title: 'Xem lại vị trí kí!' });
                onPress: () => navigation.replace('PreviewSignFile', {
                    ...route.params,
                    source: sourcePdf,
                    id, page,
                    x: scale < 0 ? coordinates.x / Math.abs(scale) - 70 : coordinates.x * Math.abs(scale) - 70,
                    y: scale < 0 ? coordinates.y / Math.abs(scale) - 37.5 : coordinates.y * Math.abs(scale) - 37.5,
                    scale: 0.5,
                    fileIndex
                })
            },
            //navigation.push('CongVanTrinhKySign', { key, linkFile: source.uri, id});
            { text: 'KHÔNG', style: 'cancel' }
        ])
    };

    const fetchFile = async (url) => {
        return await T.get(url);
    }

    const init = async () => {
        const file = files[0];
        const url = `/api/hcth/van-ban-di/file/${file.id}?format=base64`;
        const config = file.config.find(configItem => configItem.signType == item.trangThai);
        setConfig(config)
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

        // if (pageNumber != null) {
        const { height: pageHeight } = page.getSize();
        page.drawImage(pngImage, {
            x: Math.round(x - 25 / 2),
            y: Math.round(pageHeight - 25 / 2 - y),
            height: 25, width: 25,
            borderColor: rgb(1, 0, 0)
        })
        setSourcePdf(Buffer.from(await pdfDoc.save()).toString('base64'));
        setConfig({...config, xCoordinate: x, yCoordinate:y, pageNumber: page})
        // }
    }

    // const loadPdf = async () => {

    //     const res = await fetchFile(source.uri);



    //     let status = res.info().status;
    //     if (status == 200) {
    //         // the conversion is done in native code
    //         let base64Str = res.base64();
    //         // the following conversions are done in js, it's SYNC
    //         const fileBuffer = Buffer.from(base64Str, 'base64');
    //         const pdfDoc = await PDFDocument.load(fileBuffer);
    //         const pages = pdfDoc.getPages();
    //         const jpgImage = await pdfDoc.embedPng(signatureBytes)
    //         const firstPage = pages[page - 1];
    //         const { width, height } = firstPage.getSize();
    //         setPageSize({ width, height });
    //         const jpgDims = jpgImage.scale(0.25);
    //         let signPosX = scale < 0 ? coordinates.x / Math.abs(scale) - 75 : coordinates.x * Math.abs(scale) - 37.5;
    //         let signPosY = scale < 0 ? pageSize.height - coordinates.y / Math.abs(scale) - 37.5 :
    //             pageSize.height - coordinates.y * Math.abs(scale) - 37.5;
    //         if (coordinates.x === 0 && coordinates.y === 0) {
    //             signPosX = width / 2;
    //             signPosY = height / 2;
    //         }

    //         firstPage.drawImage(jpgImage, {
    //             x: signPosX,
    //             y: signPosY,
    //             width: jpgDims.width,
    //             height: jpgDims.height,
    //             borderColor: rgb(1, 0, 0)
    //         })

    //         const pdfBytes = await pdfDoc.save();

    //         const newArrBuffer = new Buffer.from(new Uint8Array(pdfBytes));

    //         const pdfBase64 = newArrBuffer.toString('base64');

    //         setSourcePdf({ uri: 'data:application/pdf;base64,' + pdfBase64 });

    //     }
    //     // })
    // }

    const onGoToPrevPage = () => setPage(page - 1);
    const onGoToNextPage = () => setPage(page + 1);

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
    console.log({ viewSize })
    return <View style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'auto', backgroundColor: 'red', height: Dimensions.get('window').height, width: Dimensions.get('window').width }} onTouchStart={(e) => { }}>
        <View style={{ backgroundColor: 'green', ...viewSize }}>
            <Pdf
                source={{ uri: sourcePdf ? "data:application/pdf;base64," + sourcePdf : '' }}
                onLoadComplete={(numberOfPages, filePath, size) => {
                    setPage(page || config.pageNumber);
                }}
                onPageChanged={(page, numberOfPages) => {
                    const pages = pdfDoc.getPages();
                    const docPage = pages[page - 1];
                    const size = docPage.getSize();
                    const dimensionsWidth = Dimensions.get('window').width;
                    const scale = dimensionsWidth / size.width;
                    const height = size.height * scale;
                    console.log({ dimensionsWidth, size, height });
                    if (height != viewSize.height)
                        setViewSize({ width: dimensionsWidth, height });
                    // console.log(size);
                }}
                onError={(error) => { }}
                onPressLink={(uri) => { }}
                onPageSingleTap={(page, x, y) => {
                    if (repick) {
                        console.log({ page, x, y })
                        setRepick(false);
                        setPage(page);
                        insertPlaceholder({ data: rawPdf }, { data: imageBase64 }, signTypeItem, x, y, page).then(() => setRepick(true)).catch(error => console.error(error));
                    }
                }}
                trustAllCerts={false}
                maxScale={100}
                // fitPolicy={0}
                style={
                    {
                        flex: 1,
                        backgroundColor: 'blue',
                        margin: 0, padding: 0
                    }
                }
                enablePaging={true}
                page={page}
            />
        </View>

        {/* {
            key && <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.buttonSign} onPress={pressHandler}>
            <Ionicons name='checkmark-outline' size={30} color='#FFF' />
            </TouchableOpacity>
            </View>
        } */}


    </View>
}

export default PositionPick;