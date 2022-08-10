import React from 'react';
import { View, Dimensions } from 'react-native';
import Pdf from 'react-native-pdf';

import styles from './styles';

const ReadFile = ({ navigation, route }) => {
    const { source } = route.params;
    console.log(source)
    return <View style={styles.container}>
        <Pdf
            source={source}
            onLoadComplete={(numberOfPages,filePath) => {
                console.log(`Number of pages: ${numberOfPages}`);
            }}
            onPageChanged={(page,numberOfPages) => {
                console.log(`Current page: ${page}`);
            }}
            onError={(error) => {
                console.log(error);
            }}
            onPressLink={(uri) => {
                console.log(`Link pressed: ${uri}`);
            }}
            trustAllCerts={false}

            style={
                {
                    flex: 1,
                    width: Dimensions.get('window').width,
                    height: Dimensions.get('window').height,
                }
            }
        />
    </View>
}

export default ReadFile;