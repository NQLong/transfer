import React, { useEffect, useRef, useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AdminModal, Comment, FormTextBox, renderScrollView, FormPasswordTextBox } from '@/Utils/component';
import { ActivityIndicator, RefreshControl, TouchableOpacity, View } from 'react-native';
import { Button, Card, List, Menu, Switch, Text, useTheme, TextInput } from 'react-native-paper';
import styles from '../../Key/styles';
import { getChuKyDienTuVanBanDi } from '../hcthCongVanTrinhKy/redux';
import T from '@/Utils/common';

import commonStyles from '../../../../Asset/Styles/styles';
import style from '../../notification/style';
import DocumentPicker, { types } from 'react-native-document-picker';
import axios from 'axios';
import fs from 'react-native-fs';
import forge from 'node-forge';
import signer from "node-signpdf";
import { Buffer } from 'buffer';
// import SignPDF from '@/Utils/signPdf/SignPdf';
import { PDFDocument } from 'pdf-lib';
import { useDispatch, useSelector } from 'react-redux';
import SignPDF from './SignPDF';

const CongVanTrinhKySign = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const { key, linkFile, file, x, y, scale, page, id } = route.params;
    const user = useSelector(state => state?.settings?.user);
    const [passphrase, setPassphrase] = useState('');

    const { colors } = useTheme();


    const getFile = async (linkFile) => {
        try {
            const file = await T.get(linkFile, { 
                responseType: 'arraybuffer',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/pdf'
                }
             });

            return file;
        } catch (error) {
            console.error(error)
        }
    }

    const trySign = async (passphrase) => {
        try {
            const data = {
                x,
                y,
                scale,
                id: file.id, 
                name: 'Hieu', 
                location: 'HCM', 
                reason: 'Chữ kí phát hành', 
                page,
                signatureLevel: 2
            };

            dispatch(getChuKyDienTuVanBanDi(data, async (res) => {
                console.log('passphrase :', passphrase);
                const signPdf = new SignPDF(
                    Buffer.from(res.data, 'base64'),
                    Buffer.from(key, 'base64')
                );
                
                const pdfBuffer = await signPdf.signPDF('12345678');

                var path = fs.DocumentDirectoryPath + '/test.pdf';
                console.log(path);
                const uploadUrl = T.config.API_URL + 'user/upload';
                
                fs.writeFile(path, pdfBuffer.toString('base64'), 'base64').then((success) => {
                    console.log('FILE WRITTEN!');
                    const fileName = linkFile.substring(linkFile.lastIndexOf('/') + 1, linkFile.length);
                    console.log(fileName);
                    var files = [
                        {
                            name: 'file',
                            filename: `${user.shcc}-signed.pdf`,
                            filepath: path,
                            filetype: 'application/pdf'
                        },
                    ];
                    var upload = (response) => {
                        var jobId = response.jobId;
                        console.log('UPLOAD HAS BEGUN! JobId: ' + jobId);
                    };
    
                    var uploadProgress = (response) => {
                        // if (new Date().getTime() - begin.getTime() > timeOut) throw new Error('Lỗi')
                        var percentage = Math.floor((response.totalBytesSent / response.totalBytesExpectedToSend) * 100);
                        console.log('UPLOAD IS ' + percentage + '% DONE!');
                    };
    
                    fs.uploadFiles({
                        toUrl: uploadUrl,
                        files: files,
                        method: 'POST',
                        headers: {
                            'Accept': 'application/pdf',
                        },
                        fields: {
                            'userData': `hcthKyDienTu:${file.ma}`,
                            'fileId': id
                        },
                        begin: upload,
                        progress: uploadProgress,
                    }).promise.then((response) => {
                        // navigation.pus
                        if (response.statusCode == 200) {
                            const resBody = JSON.parse(response.body);
                            console.log(resBody);
                            if (!resBody.error) {
                                T.alert('Thông báo', 'Chữ kí hợp lệ. Tải lên thành công !!');
                            } else {
                                T.alert('Lỗi', resBody.error);
                            }
                            console.log('FILES UPLOADED!'); // response.statusCode, response.headers, response.body
                        } else {
                            console.log('SERVER ERROR');
                        }
                    }).catch((err) => {
                        if (err.description === 'cancelled') {
    
                        }
                        console.log(err);
                    });
                })
                navigation.navigate('congVanTrinhKyPage');

            }));
            // const file = await getFile(linkFile);
            // const signPdf = new SignPDF(Buffer.from(file, 'base64'), Buffer.from(key, 'base64'));
            // const pdfBuffer = await signPdf.signPDF(passphrase);
            // var path = fs.DocumentDirectoryPath + '/test.pdf';
            // const uploadUrl = T.config.API_URL + 'user/upload';

            // const begin = new Date();
            // const timeOut = 500;
            // fs.writeFile(path, pdfBuffer.toString('base64'), 'base64').then((success) => {

            //     console.log('FILE WRITTEN!');
            //     const fileName = linkFile.substring(linkFile.lastIndexOf('/') + 1, linkFile.length);
            //     var files = [
            //         {
            //             name: 'file',
            //             filename: fileName,
            //             filepath: path,
            //             filetype: 'application/pdf'
            //         },
            //     ];
            //     var upload = (response) => {
            //         var jobId = response.jobId;
            //         console.log('UPLOAD HAS BEGUN! JobId: ' + jobId);
            //     };

            //     var uploadProgress = (response) => {
            //         // if (new Date().getTime() - begin.getTime() > timeOut) throw new Error('Lỗi')
            //         var percentage = Math.floor((response.totalBytesSent / response.totalBytesExpectedToSend) * 100);
            //         console.log('UPLOAD IS ' + percentage + '% DONE!');
            //     };

            //     fs.uploadFiles({
            //         toUrl: uploadUrl,
            //         files: files,
            //         method: 'POST',
            //         headers: {
            //             'Accept': 'application/json',
            //         },
            //         fields: {
            //             'userData': `hcthCongVanDiSignatureFile:${id}`,
            //         },
            //         begin: upload,
            //         progress: uploadProgress,
            //     }).promise.then((response) => {
            //         // navigation.pus
            //         if (response.statusCode == 200) {
            //             const resBody = JSON.parse(response.body);
            //             if (!resBody.error) {
            //                 T.alert('Thông báo', 'Chữ kí hợp lệ. Tải lên thành công !!');
            //             } else {
            //                 T.alert('Lỗi', resBody.error);
            //             }
            //             console.log('FILES UPLOADED!'); // response.statusCode, response.headers, response.body
            //         } else {
            //             console.log('SERVER ERROR');
            //         }
            //         console.log('good boy');
            //     }).catch((err) => {
            //         if (err.description === 'cancelled') {

            //         }
            //         console.log(err);
            //     });
            // })
            // navigation.navigate('congVanTrinhKyPage');

            
            
        }
        catch (error) {
            // console.log(response);
            console.error(error);
        }
    }


    return <View>
        <FormPasswordTextBox secureTextEntry={true} style={styles.replyInput} value={passphrase} onChangeText={text => setPassphrase(text)} placeholder='Nhập mật khẩu' />
        <View style={styles.buttonView}>
            <TouchableOpacity style={{ ...styles.sign, backgroundColor: colors.primary }} onPress={() => trySign(passphrase)}>
                <Text style={{ ...styles.buttonText, color: colors.background }} >Ký công văn</Text>
            </TouchableOpacity>
        </View>
    </View>
}

export default CongVanTrinhKySign;