import React, { useRef, useState } from 'react';
import { Dimensions, StyleSheet, View, TouchableOpacity } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { QRreader, QRscanner } from "react-native-qr-decode-image-camera";
import Ionicons from 'react-native-vector-icons/Ionicons';
import forge from 'node-forge';

import T from '@/Utils/common';
import { AdminModal, FormTextBox } from '@/Utils/component';
import { Button } from 'react-native-paper';

const RNFS = require('react-native-fs');

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

class PasswordModal extends AdminModal {
	onShow = (data) => {
		this.setState({ data });
	}

	verify = () => {
		this.props.verify(this.state.passphrase, this.state.data);
	}

	render = () => {
		return this.renderModal({
			title: 'Xác thực chữ ký',
			content: <FormTextBox placeholder='Mật khẩu' type='password' value={this.state.passphrase} onChangeText={value => this.setState({ passphrase: value })} />,
			icon: <Ionicons name='push' size={30} color='#FFF' />,
			button: <Button onPress={this.verify}>Xác thực</Button>
		})
	}
}

const ScanScreen = ({ navigation }) => {

	const [step, setStep] = useState(1);
	const [p12Data, setP12Data] = useState('');
	const [flash, setFlash] = useState(false);
	const [isRepeatScan, setIsRepeatScan] = useState(false);
	const modal = useRef();

	const onFirstSuccess = (e) => {
		T.alert('Quét thành công', 'Bạn đã thành công quét mã QR thứ nhất! Vui lòng tiếp tục với mã QR thứ 2', [{
			text: 'Ok', onPress: () => {
				setP12Data(e.data);
				setStep(2);
				setIsRepeatScan(true);
			}
		}]);
	};

	const onSecondSuccess = (e) => {
		T.alert('Quét QR chữ ký thứ hai thàng công', 'Vui lòng xác thực chữ ký để  hoàn tất việc cài đặt!', [{
			text: 'OK', onPress: () => {
				modal.current.show(p12Data + e.data);
			}
		}])
	}

	const onSuccess = e => {
		setIsRepeatScan(false);
		if (step === 1) {
			onFirstSuccess(e);
		} else {
			onSecondSuccess(e);
		}
	};

	const verify = async (passphrase, key) => {
		let name, location;
		try {
			const p12Der = forge.util.decode64(key), p12Asn1 = forge.asn1.fromDer(p12Der), p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, passphrase), bags = p12.getBags({ bagType: forge.pki.oids.certBag }), cert = bags[forge.pki.oids.certBag][0];
			name = cert.cert.subject.getField({ shortName: 'CN' })?.value || '';
			location = cert.cert.subject.getField({ shortName: 'L' })?.value || '';
			console.info({ name, location });
			modal.current.hide();
			const path = RNFS.DocumentDirectoryPath + '/keystore.p12';
			await RNFS.writeFile(path, key, 'base64');
			T.alert('Thành công', 'Chữ ký xác thực thành công', [{ text: 'OK', onPress: () => navigation.goBack(null) }]);
		} catch (error) {
			console.error(error);
			T.alert('Thật bại', 'Xác thực chữ ký khôg thành công', [{ text: 'OK', onPress: () => navigation.goBack(null) }]);
		}
	}


	const onPickFile = async () => {
		try {
			const keyFile = await DocumentPicker.pick({
				presentationStyle: 'fullScreen',
				allowMultiSelection: false,
			});
			const file = keyFile[0].uri;
			const data = await QRreader(file);
			onSuccess({ data });
		} catch (error) {
			T.alert('Đọc khoá thất bại!', 'Cài đặt chữ ký thất bại vui lòng thử lại sau!');
		}
	}


	const bottomView = () => {
		return (
			<View
				style={{ flex: 1, justifyContent: 'space-between', flexDirection: "row", backgroundColor: "#0000004D" }}
			>
				<TouchableOpacity
					style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
					onPress={onPickFile}
				>
					<Ionicons name='push' size={30} color='#FFF' />
				</TouchableOpacity>
				<TouchableOpacity
					style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
					onPress={() => { setFlash(!flash) }}
				>
					<Ionicons name='flashlight' size={30} color={flash ? '#0F0' : '#FFF'} />
				</TouchableOpacity>
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<QRscanner
				onRead={onSuccess}
				renderBottomView={bottomView}
				flashMode={flash}
				zoom={0}
				rectWidth={Math.min(width, height) - 30}
				rectHeight={Math.min(width, height) - 30}
				isRepeatScan={isRepeatScan}
				hintText={step == 1 ? 'Quét mã QR thứ nhất' : 'Quét mã QR thứ 2'}
				finderY={Math.round(Math.max(width, height) / 6)}
			/>
			<PasswordModal ref={modal} verify={verify} />
		</View>
	);
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
	},
	uploadTouchable: {
		padding: 70,
	},
	cameraBackground: {
		flex: 1,
		flexDirection: 'column'
	},
	container: {
		flex: 1,
		height,
		marginTop: -250
	},
	markerStyle: {
		borderColor: "#ffffff",
		// top: -40
	}

});

export default ScanScreen;