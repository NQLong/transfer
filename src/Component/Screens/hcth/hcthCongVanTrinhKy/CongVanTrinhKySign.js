import T from '@/Utils/common';
import { FormPasswordTextBox } from '@/Utils/component';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import styles from '../../Key/styles';
import { getChuKyDienTuVanBanDi } from '../hcthCongVanTrinhKy/redux';

import { Buffer } from 'buffer';
import fs from 'react-native-fs';
import forge from 'node-forge';
// import SignPDF from '@/Utils/signPdf/SignPdf';
import { useDispatch, useSelector } from 'react-redux';
import SignPDF from './SignPDF';
import { vanBanDi } from '@/Utils/contants';
// const RNFS = require('react-native-fs');

const CongVanTrinhKySign = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const { files, config } = route.params;

    const file = files[0];
    const user = useSelector(state => state?.settings?.user);
    const [passphrase, setPassphrase] = useState('');

    const { colors } = useTheme();

    const trySign = async (passphrase) => {
        try {
            const key = await fs.readFile(fs.DocumentDirectoryPath + `/keystore.p12`, 'base64');
            let name, location;
            try {
                const p12Der = forge.util.decode64(key),
                    p12Asn1 = forge.asn1.fromDer(p12Der),
                    p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, passphrase),
                    bags = p12.getBags({ bagType: forge.pki.oids.certBag }),
                    cert = bags[forge.pki.oids.certBag][0];
                name = cert.cert.subject.getField({ shortName: 'CN' })?.value || '';
                location = cert.cert.subject.getField({ shortName: 'L' })?.value || '';
            } catch (error) {
                return T.alert('Lỗi xác thực', 'Mật khẩu chữ ký không chính xác');
            }
            const signTypeItem = vanBanDi.signType[config.signType];
            const data = { x: config.xCoordinate, y: config.yCoordinate, id: file.id, name, location, reason: signTypeItem.text, page: config.pageNumber, signatureLevel: signTypeItem.level, signType: signTypeItem.id, format: 'base64' };

            dispatch(getChuKyDienTuVanBanDi(data, async (res) => {
                console.log({res});
                const signPdf = new SignPDF(
                    Buffer.from(res.data, 'base64'),
                    Buffer.from(key, 'base64'),
                );

                const { pdf: pdfBuffer } = await signPdf.signPDF(passphrase);

                var path = fs.DocumentDirectoryPath + '/res.pdf';
                const uploadUrl = T.config.API_URL + 'user/upload';

                fs.writeFile(path, pdfBuffer.toString('base64'), 'base64').then(() => {
                    const originFileName = file.file.ten;
                    var files = [
                        {
                            name: 'file',
                            filename: originFileName,
                            filepath: path,
                            filetype: 'application/pdf'
                        },
                    ];
                    var upload = (response) => {
                    };

                    var uploadProgress = (response) => {
                        console.log(response);
                        // if (new Date().getTime() - begin.getTime() > timeOut) throw new Error('Lỗi')
                    };

                    fs.uploadFiles({
                        toUrl: uploadUrl, files: files, method: 'POST',
                        headers: { Accept: 'application/pdf', },
                        fields: {
                            userData: `hcthKyDienTu`,
                            'data': JSON.stringify({}),
                        },
                        begin: upload,
                        progress: uploadProgress,
                    }).promise.then((response) => {
                        // navigation.pus
                        if (response.statusCode == 200) {
                            const resBody = JSON.parse(response.body);
                            if (!resBody.error) {
                                T.alert('Thông báo', 'Chữ kí hợp lệ. Tải lên thành công !!');
                            } else {
                                T.alert('Lỗi', resBody.error);
                            }
                        } else {
                            T.alert('Lỗi');
                        }
                    }).catch((err) => {
                        if (err.description === 'cancelled') {

                        }
                    });
                });

                if (fileIndex < listSignFile.length - 1) {
                    const congVanId = route?.params?.vanBanDiId;
                    const keyDir = RNFS.DocumentDirectoryPath + `/${user.shcc}.p12`;
                    const key = RNFS.readFile(keyDir, 'base64');
                    const signFile = listSignFile[fileIndex + 1];
                    const linkFile = `${T.config.API_URL}api/hcth/van-ban-di/download/${id}/${signFile.file.tenFile}`;

                    navigation.navigate('SelectSignPos', { id: congVanId, key, fileIndex: fileIndex + 1, listSignFile, source: { uri: linkFile, cache: true } });
                } else navigation.navigate('vanBanDiPage');

            }));
        }
        catch (error) {
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