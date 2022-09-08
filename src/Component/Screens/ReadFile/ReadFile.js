import React, { useEffect, useState } from 'react';
import ReactNativeBlobUtil from 'react-native-blob-util'
global.Buffer = global.Buffer || require('buffer').Buffer
import { View, Dimensions, Alert, TouchableOpacity, Text, Button, ScrollView } from 'react-native';
import Pdf from 'react-native-pdf';
import Ionicons from 'react-native-vector-icons/Ionicons';
import fs from 'react-native-fs';

import { Buffer } from 'buffer';

import T from '@/Utils/common';

import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';

import toBuffer from 'blob-to-buffer';
import styles from './styles';

const RNFS = require('react-native-fs');

const ReadFile = ({ navigation, route }) => {
    const { source } = route.params;

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
                    style={styles.pdf}/>
            </View>
}

export default ReadFile;