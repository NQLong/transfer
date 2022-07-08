import React from 'react';
global.Buffer = global.Buffer || require('buffer').Buffer
import { Button } from 'react-native-paper';
import DocumentPicker, { types } from 'react-native-document-picker';
import T from '@/Utils/common';
import axios from 'axios';
import fs from 'react-native-fs';
import forge from 'node-forge';
import signer from "node-signpdf";
import { Buffer } from 'buffer';
import SignPDF from '@/Utils/SignPdf';

const CongVanTrinhKy = () => {
    console.log(signer);
    const onPickKey = async () => {
        const keyFile = await DocumentPicker.pick({
            // types: 'application/x-pkcs12',
            presentationStyle: 'fullScreen',
            allowMultiSelection: false,
        });
        console.log(keyFile);
        // if (keyFile?.length && keyFile[0].type !== 'application/x-pkcs12')
        //     T.alert('Lỗi', 'Định dạng khóa không hợp lệ');
        // else
        return fs.readFile(keyFile[0].uri, 'base64');
    }


    const getFile = async () => {
        try {
            return await T.get('api/hcth/cong-van-den/download/1741/report_3.pdf')
            // return await axios({
            //     url: url, //your url
            //     method: 'GET',
            //     // responseType: 'blob', // important
            // }).then((response) => {
            //     console.log({data:response.data});
            //     return Buffer.from(response.data, 'binary');
            // });
        } catch (error) {
            console.error(error)
        }
    }

    const trySign = async () => {
        try {
            const key = await onPickKey();
            const file = await onPickKey();
            const signPdf = new SignPDF(Buffer.from(file, 'base64'), Buffer.from(key, 'base64'));
            const pdfBuffer = await signPdf.signPDF();
            var path = fs.DocumentDirectoryPath + '/test.pdf';
            const uploadUrl = T.config.API_URL + 'user/upload';

            fs.writeFile(path, pdfBuffer.toString('base64'), 'base64')
                .then((success) => {
                    console.log('FILE WRITTEN!');
                    var files = [
                        {
                            name: 'test',
                            filename: 'test.pdf',
                            filepath: path,
                            filetype: 'application/pdf'
                        },
                    ];
                    var upload = (response) => {
                        var jobId = response.jobId;
                        console.log('UPLOAD HAS BEGUN! JobId: ' + jobId);
                    };

                    var uploadProgress = (response) => {
                        var percentage = Math.floor((response.totalBytesSent / response.totalBytesExpectedToSend) * 100);
                        console.log('UPLOAD IS ' + percentage + '% DONE!');
                    };

                    fs.uploadFiles({
                        toUrl: uploadUrl,
                        files: files,
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                        },
                        fields: {
                            'hello': 'world',
                        },
                        begin: upload,
                        progress: uploadProgress
                    }).promise.then((response) => {
                        if (response.statusCode == 200) {
                            console.log('FILES UPLOADED!'); // response.statusCode, response.headers, response.body
                        } else {
                            console.log('SERVER ERROR');
                        }
                    })
                        .catch((err) => {
                            if (err.description === "cancelled") {
                                // cancelled by user
                            }
                            console.log(err);
                        });


                })
        }
        catch (error) {
            // console.log(response);
            console.error(error);
        }
    }
    const url = T.config.API_URL + 'api/hcth/cong-van-cac-phong/download/1741/report_3.pdf';
    return <>
        <Button onPress={onPickKey}>Chon khoa</Button>
        <Button onPress={trySign}>Test sign</Button>
    </>
}


export default CongVanTrinhKy;