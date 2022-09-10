import React, { Component, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import {
	AppRegistry,
	StyleSheet,
	Text,
	TouchableOpacity,
	Linking
} from 'react-native';

import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import T from '@/Utils/common';

const RNFS = require('react-native-fs');

const ScanScreen = ({ navigation }) => {

	const [step, setStep] = useState(1);
	const [p12Data, setP12Data] = useState('');
	const user = useSelector(state => state?.settings?.user);

	const scanner = useRef(null);

	const onSuccess = e => {
		if (step === 1) {
			T.alert('Tạo khoá', 'Quét thành công !!', [{ text: 'Ok', onPress: () => setP12Data(e.data) }]);

		} else {
			T.alert('Tạo khoá', 'Hoàn thành!!', [{
				text: 'Ok', onPress: () => {
					const path = RNFS.DocumentDirectoryPath + `/${user.shcc}.p12`;

					// write the file
					RNFS.writeFile(path, p12Data + e.data, 'base64')
						.then((success) => T.alert('Tạo khoá', 'Khoá đã được tạo thành công', [{ text: 'OK', onPress: () => navigation.goBack(null) }]))
						.catch((err) => { });
				}
			}]);
		}
	};

	const onContinue = () => {
		setStep(2);
		scanner.current.reactivate();
	}
	return (
		<QRCodeScanner
			reactivateTimeout={10}
			ref={scanner}
			onRead={onSuccess}
			// flashMode={RNCamera.Constants.FlashMode.torch}
			topContent={
				<Text style={styles.centerText}>
					{step === 1 ? 'Quét hình ảnh thứ nhất' : 'Quét hình ảnh thứ hai'}
				</Text>
			}
			bottomContent={
				<TouchableOpacity style={styles.buttonTouchable} onPress={onContinue}>
					<Text style={styles.buttonText}>{step === 1 && p12Data && 'Tiếp theo'}</Text>
				</TouchableOpacity>
			}
		/>
	)
}

const styles = StyleSheet.create({
	centerText: {
		flex: 1,
		fontSize: 18,
		padding: 10,
		color: '#777'
	},
	textBold: {
		fontWeight: '500',
		color: '#000'
	},
	buttonText: {
		fontSize: 21,
		color: 'rgb(0,122,255)'
	},
	buttonTouchable: {
		padding: 10
	}
});

export default ScanScreen;