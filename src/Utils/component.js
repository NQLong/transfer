import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { Button, Card, Dialog, Portal } from 'react-native-paper';
import T from './common';


export const renderScrollView = ({ content = null, style = {}, refreshControl, onScroll = null, ref, navigation, route, headerRightButton = () => null, scrollEnabled = true }) => {
    // if (headerRightButton) {
    // navigation.setOptions({
    //     headerRight: headerRightButton
    // })

    // }
    return <ScrollView style={{ ...style, }} refreshControl={refreshControl} bounces={true} onScroll={onScroll} ref={ref} scrollEnabled={scrollEnabled}>
        {content}
    </ScrollView >
}


export const Separator = ({ color = '#E1E4E7', width = '100%', height = 1, style = {} }) => {
    return <View style={{ backgroundColor: color, width: width, height: height, ...style }} />
}

export const MenuItem = ({ bottomValue = null, title = '', value = null, button, expand, style, valueStyle = {},
    bottomValueStyle = {}, titleStyle, isExpand, onTitleClick = null }) => {
    return <View style={{ paddingBottom: 10, paddingTop: 10, borderColor: '#868FA0', borderTopWidth: 1, ...style }}>
        <View style={{ display: 'flex', justifyItem: 'center', flexDirection: 'row', paddingRight: 10, paddingLeft: 10 }}>
            <TouchableOpacity onPress={() => onTitleClick && onTitleClick()} disabled={!onTitleClick} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, paddingRight: 10 }}>
                <Text style={{ fontSize: 20, color: 'black', ...titleStyle }}>{title}</Text>
                {bottomValue && <Text style={{ fontSize: 15, color: 'black', ...bottomValueStyle }}>{bottomValue}</Text>}
            </TouchableOpacity>
            {value ? <Text style={{ fontSize: 15, alignSelf: 'center', color: 'black', ...valueStyle }}>{value}</Text> : null}
            {button ? button : null}
        </View>
        {isExpand && expand ? <View>{expand}</View> : null}
    </View>
}

export const Tile = (props) => {
    const { style = {} } = props;
    return <View style={{ backgroundColor: 'white', marginTop: 10, ...style }}>
        {props.children}
    </View>
}

export const Comment = ({ image, name, timestamp, content, style = {} }) => {
    return <View style={{ flexDirection: 'row', ...style }}>
        <View><Image source={{ uri: image }} style={{ width: 40, height: 40, borderRadius: 50, shadowRadius: 5, borderColor: '#868FA0', borderWidth: 1 }} /></View>
        <Card elevation={3} style={{ marginLeft: 15, padding: 5, borderWidth: 1, borderRadius: 10, borderTopLeftRadius: 0, borderColor: '#868FA0', flex: 1, }}>
            <View style={{ flexDirection: 'column', borderBottomWidth: 1, borderColor: '#868FA0' }}>
                <Text style={{ fontFamily: 'Work Sans', color: 'black', fontSize: 15, fontWeight: 'bold' }}>{name}</Text>
                <Text style={{ fontFamily: 'Work Sans', color: 'black', fontSize: 10 }}>{T.dateToText(new Date(timestamp), 'HH:MM, dd/mm/yyyy')}</Text>
            </View>
            <Text style={{ fontFamily: 'Work Sans', color: 'black', fontSize: 15, marginTop: 5 }}>{content}</Text>
        </Card>
    </View>
}

export const FormTextBox = ({ placeholder, onChangeText, value, icon, style }) => {
    return (<View style={{ ...styles.formInput, ...style }}>
        {icon ? icon : null}
        <TextInput placeholder={placeholder} placeholderTextColor='#999999' style={styles.textInput} autoCapitalize='none' value={value} onChangeText={onChangeText} />
    </View>);
};

const styles = StyleSheet.create({
    menuTitle: {
        fontFamily: 'Work Sans', color: 'black', fontSize: 30, fontWeight: 'bold'
    },
    formInput: {
        flexDirection: 'row',
        marginTop: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#CCC',
        padding: 10,
        paddingBottom: Platform.OS === 'ios' ? 10 : 0,
        borderRadius: 5
    },
    textInput: {
        flex: 1,
        marginTop: Platform.OS === 'ios' ? 0 : -12,
        paddingLeft: 10,
        color: '#333333',
        fontSize: 20
    },
});


export class AdminModal extends React.Component {
    state = { visible: false }

    hide = () => {
        this.setState({ visible: false });
    }

    show = () => {
        this.setState({ visible: true });
    }

    renderModal = ({ title, content, button }) => {
        return (
            <Portal>
                <Dialog visible={this.state.visible} onDismiss={this.hide}>
                    <Dialog.Title>{title}</Dialog.Title>
                    <Dialog.Content>
                        {content}
                    </Dialog.Content>
                    <Dialog.Actions style={{marginBottom: 5}}>
                        <Button onPress={this.hide}>Đóng</Button>
                        {button}
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        )
    }

    render = () => null;
}

