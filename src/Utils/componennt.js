import React from 'react';
import { ScrollView } from 'react-native'



export const renderScrollView = ({ content = null, style = {} }) => {
    console.log(content);
    return <ScrollView style={{ ...style, }}>
        {content}
    </ScrollView>
}

