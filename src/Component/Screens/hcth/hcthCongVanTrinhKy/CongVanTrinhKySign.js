import T from '@/Utils/common';
import { FormPasswordTextBox } from '@/Utils/component';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
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
import commonStyles from '@/Asset/Styles/styles';
const CongVanTrinhKySign = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const { files, config, item } = route.params;
    const [submitting, setSubmitting] = useState(false);
    const file = files[0];
    const user = useSelector(state => state?.settings?.user);
    const [passphrase, setPassphrase] = useState('');

    const { colors } = useTheme();

    const trySign = async (passphrase) => {
        try {
            setSubmitting(true);
            const key = await fs.readFile(fs.DocumentDirectoryPath + `/keystore.p12`, 'base64');
            let name, location;
            try {
                const p12Der = forge.util.decode64(key), p12Asn1 = forge.asn1.fromDer(p12Der), p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, passphrase), bags = p12.getBags({ bagType: forge.pki.oids.certBag }), cert = bags[forge.pki.oids.certBag][0];
                name = cert.cert.subject.getField({ shortName: 'CN' })?.value || '';
                location = cert.cert.subject.getField({ shortName: 'L' })?.value || '';
            } catch (error) {
                console.error(error);
                setSubmitting(false);
                return T.alert('Lỗi xác thực', 'Mật khẩu chữ ký không chính xác');
            }
            const signTypeItem = vanBanDi.signType[config.signType];
            const data = { x: config.xCoordinate, y: config.yCoordinate, id: file.id, name, location, reason: signTypeItem.text, page: config.pageNumber, signatureLevel: signTypeItem.level, signType: signTypeItem.id, format: 'base64' };

            dispatch(getChuKyDienTuVanBanDi(data, async (res) => {
                try {
                    const signPdf = new SignPDF(Buffer.from(res.data, 'base64'), Buffer.from(key, 'base64'));
                    const { pdf: pdfBuffer } = await signPdf.signPDF(passphrase);

                    var path = fs.DocumentDirectoryPath + '/res.pdf';
                    const uploadUrl = T.config.API_URL + 'user/upload';

                    await fs.writeFile(path, pdfBuffer.toString('base64'), 'base64');
                    const originFileName = file.file.ten;
                    const fileConfig = {
                        uri: `file://${path}`,
                        name: originFileName,
                        type: 'application/pdf',
                    };
                    const formData = new FormData();
                    formData.append('file', fileConfig);
                    formData.append('userData', 'hcthKyDienTu');
                    formData.append('data', JSON.stringify({ id: file.id, configId: config.id, signType: config.signType }));

                    const response = await T.post('/user/upload', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    if (response.error) {
                        throw response.error;
                    } else {
                        T.alert('Thông báo', 'Chữ kí hợp lệ. Tải lên thành công !!');
                        const remain = files.slice(1);
                        if (remain.length) {
                            navigation.navigate('PositionPicker', { files: remain, item });
                        }
                        else {
                            navigation.navigate('vanBanDiPage', {});
                        }
                    }

                } catch (err) {
                    console.error(err);
                    T.alert('Lỗi', 'Kí văn bản lỗi!');
                    setSubmitting(false);
                };
            }));

        } catch (error) {
            setSubmitting(false);
            console.error(error);
            T.alert('Lỗi', 'Kí văn bản lỗi!');
        }
    }


    return <View>
        {!submitting && <>
            <FormPasswordTextBox secureTextEntry={true} style={styles.replyInput} value={passphrase} onChangeText={text => setPassphrase(text)} placeholder='Nhập mật khẩu' />
            <View style={styles.buttonView}>
                <TouchableOpacity style={{ ...styles.sign, backgroundColor: colors.primary }} onPress={() => trySign(passphrase)}>
                    <Text style={{ ...styles.buttonText, color: colors.background }} >Ký công văn</Text>
                </TouchableOpacity>
            </View>
        </>
        }
        {submitting && <ActivityIndicator size="large" color={colors.primary} style={{ ...commonStyles.activityIndicator, marginTop: 20 }} />}
    </View>
}

export default CongVanTrinhKySign;