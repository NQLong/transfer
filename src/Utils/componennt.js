import React from 'react';
import { ScrollView, View, Text, StyleSheet, FlatList } from 'react-native'



export const renderScrollView = ({ content = null, style = {} }) => {
    return <ScrollView style={{ ...style, }}>
        {content}
    </ScrollView>
}


export const Separator = ({ color = '#E1E4E7', width = '100%', height = 1, style = {} }) => {
    return <View style={{ backgroundColor: color, width: width, height: height, ...style }} />
}

export const MenuItem = ({ bottomValue = null, title = '', value = null, button, expand, style, valueStyle = {},
    bottomValueStyle = {}, titleStyle }) => {
    return <View style={{ paddingBottom: 10, paddingTop: 10, ...style }}>
        <View style={{ display: 'flex', justifyItem: 'center', flexDirection: 'row', paddingRight: 10, paddingLeft: 10 }}>
            <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, paddingRight: 10 }}>
                <Text style={{ fontSize: 20, color: 'black', ...titleStyle }}>{title}</Text>
                {bottomValue && <Text style={{ fontSize: 15, color: 'black', ...bottomValueStyle }}>{bottomValue}</Text>}
            </View>
            {value && <Text style={{ fontSize: 15, alignSelf: 'center', color: 'black', ...valueStyle }}>{value}</Text>}
            {button && button}
        </View>
        {expand && <View>{expand}</View>}
    </View>
}

export const Menu = (props) => {
    const { style = {} } = props;
    const items = props.children || [];
    const children = [];
    items.map((item, key) => { children.push(item); key != items.length - 1 ? children.push(<Separator color={'#868FA0'} />) : null })
    return <View style={{ borderBottomWidth: 1, borderTopWidth: 1, flex: 1, borderColor: '#868FA0', ...style }}>
        {children}
    </View>
}

const styles = StyleSheet.create({
    menuTitle: {
        fontFamily: 'Work Sans', color: 'black', fontSize: 30, fontWeight: 'bold'
    }
})
