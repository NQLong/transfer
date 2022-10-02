import React, { } from 'react';
global.Buffer = global.Buffer || require('buffer').Buffer
import { View, Dimensions } from 'react-native';
import Pdf from 'react-native-pdf';

// import styles from './styles';

const ReadOnlyFile = ({ navigation, route }) => {
    const { source } = route.params;
    return <View style={{ flex: 1, justifyContent: 'flex-start' }}>
        <Pdf
            source={source}
            trustAllCerts={false}
            style={{
                flex: 1,
                width: Dimensions.get('window').width,
                height: Dimensions.get('window').height,
            }} />

    </View>
}

export default ReadOnlyFile;