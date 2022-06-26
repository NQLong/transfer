import React from 'react';
import { ScrollView, View } from 'react-native'



export const renderScrollView = ({ content = null, style = {} }) => {
    return <ScrollView style={{ ...style, }}>
        {content}
    </ScrollView>
}


export const Seperator = ({ color = '#E1E4E7', width = '100%', height = 1, style = {} }) => {
    return <View style={{ backgroundColor: color, width: width, height: height, ...style }} />
}

