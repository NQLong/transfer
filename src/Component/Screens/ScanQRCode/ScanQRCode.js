import React, { Component, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import DocumentPicker, { types } from 'react-native-document-picker';
import { QRreader } from "react-native-qr-decode-image-camera";
import {
  AppRegistry,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Linking,
  Fragment,
  View
} from 'react-native';

import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import T from '@/Utils/common';

const RNFS = require('react-native-fs');

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

const ScanScreen = ({ navigation }) => {

  const [step, setStep ] = useState(1);
  const [p12Data, setP12Data] = useState('');
  const user = useSelector(state => state?.settings?.user);

  const scanner = useRef(null);

  const onSuccess = e => {
        if (step === 1) {
          T.alert('Tạo khoá', 'Quét thành công !!', () => {
              setP12Data(e.data);
          });
          
        } else {
          T.alert('Tạo khoá', 'Hoàn thành!!', () => {
            const path = RNFS.DocumentDirectoryPath + `/${user.shcc}.p12`;
      
              // write the file
            RNFS.writeFile(path, p12Data + e.data, 'base64')
                .then((success) => {
                  console.log('FILE WRITTEN!');
                  T.alert('Tạo khoá', 'Khoá đã được tạo thành công', () =>  navigation.goBack(null));
                })
                .catch((err) => {
                  console.log(err.message);
                });
          }); 
        }
  };

  const onContinue = () => {
      setStep(2);
      scanner.current.reactivate();
  }

  const onPickFile = async () => {
    const keyFile = await DocumentPicker.pick({
        presentationStyle: 'fullScreen',
        allowMultiSelection: false,
    });
    return keyFile[0].uri
  }

  const onShowUploadFile = async () => {
        const qrCodeFileUrl = await onPickFile();

        QRreader(qrCodeFileUrl)
            .then(data => {
              if (step === 1) {
                T.alert('Tạo khoá', 'Quét thành công !!', () => {
                    setP12Data(data);
                });
                
              } else {
                T.alert('Tạo khoá', 'Hoàn thành!!', () => {
                  const path = RNFS.DocumentDirectoryPath + `/${user.shcc}.p12`;
            
                    // write the file
                  RNFS.writeFile(path, p12Data + data, 'base64')
                      .then((success) => {
                        T.alert('Tạo khoá', 'Khoá đã được tạo thành công', () =>  navigation.goBack(null));
                      })
                      .catch((err) => {
                        console.log(err.message);
                      });
                }); 
              }
        });
  }

  return (
      <QRCodeScanner
          showMarker={true} 
          reactivateTimeout={10}
          ref={scanner}
          onRead={onSuccess}
          markerStyle={styles.markerStyle}

          topContent={
            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center'}}>
              <Text style={styles.centerText}>
                { step === 1 ? 'Quét hình ảnh thứ nhất' : 'Quét hình ảnh thứ hai'}
              </Text>
              <TouchableOpacity style={styles.uploadTouchable} onPress={() => onShowUploadFile()}>
                <Text style={styles.buttonText}>Tải lên</Text>
              </TouchableOpacity>
            </View>
          }
          bottomContent={
            <TouchableOpacity style={styles.buttonTouchable} onPress={() => onContinue()}>
              <Text style={styles.buttonText}>{ step === 1 && p12Data && 'Tiếp theo'}</Text>
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
    },
    uploadTouchable: {
      marginBottom: 70
    },  
    cameraBackground: {
      flex: 1,
      flexDirection: 'column'
    },
    container: {
        flex: 1,
        height: deviceHeight,
        marginTop: -250
    },
    markerStyle: {
        borderColor: "#ffffff",
        top: -40
    }
    
  });
  
  export default ScanScreen;