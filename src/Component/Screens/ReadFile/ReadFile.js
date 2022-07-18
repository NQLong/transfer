import React from 'react';
import { View, Dimensions, Alert, TouchableOpacity, Text } from 'react-native';
import Pdf from 'react-native-pdf';
import Ionicons from 'react-native-vector-icons/Ionicons';

import styles from './styles';

const ReadFile = ({ navigation, route }) => {
    const { source, key, file } = route.params;

    const pressHandler = () => {
        Alert.alert('KÝ', 'Bạn có chắc chắn muốn ký công văn này không ?', [
            {text: 'XÁC NHẬN', onPress: () => navigation.push('CongVanTrinhKySign', { key, linkFile: source.uri })},
            {text: 'KHÔNG', onPress: () => navigation.goBack()}
        ])
    }

    return <View style={styles.container}>
        <Pdf
            source={source}
            onLoadComplete={(numberOfPages, filePath) => {
                console.log(`Number of pages: ${numberOfPages}`);
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
        />
        {key && <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.buttonSign} onPress={pressHandler}>
                <Ionicons name='checkmark-outline' size={30} color='#FFF'/>
            </TouchableOpacity>
        </View>}
    </View>
}

export default ReadFile;