import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View, TextInput, FlatList } from 'react-native';
import { Button, Card, Dialog, List, Portal, TextInput as RNPInput, Text, Chip } from 'react-native-paper';
import T from './common';
import DropDownPicker from 'react-native-dropdown-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

export const renderScrollView = ({ nestedScrollEnabled = false, content = null, style = {}, refreshControl, onScroll = null, ref, navigation, route, headerRightButton = null, scrollEnabled = true }) => {
    if (headerRightButton) {
        navigation.setOptions({
            headerRight: headerRightButton
        })

    }
    return <ScrollView nestedScrollEnabled={nestedScrollEnabled} style={{ flex: 1, ...style, }} refreshControl={refreshControl} bounces={true} onScroll={onScroll} ref={ref} scrollEnabled={scrollEnabled}>
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
    labelContainer: {
        backgroundColor: "white", // Same color as background
        alignSelf: "flex-start", // Have View be same width as Text inside
        paddingHorizontal: 3, // Amount of spacing between border and first/last letter
        marginStart: 10, // How far right do you want the label to start
        zIndex: 1, // Label must overlap border
        // elevation: 1, // Needed for android
        shadowColor: "white", // Same as background color because elevation: 1 creates a shadow that we don't want
        position: "absolute", // Needed to be able to precisely overlap label with border
        top: -10, // Vertical position of label. Eyeball it to see where label intersects border.
    },
    inputContainer: {
        borderWidth: 1, // Create border
        borderRadius: 8, // Not needed. Just make it look nicer.
        padding: 8, // Also used to make it look nicer
        zIndex: 0, // Ensure border has z-index of 0
        flex: 1,
        flexWrap: "wrap",
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
                    <Dialog.Actions style={{ marginBottom: 5 }}>
                        <Button onPress={this.hide}>Đóng</Button>
                        {button}
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        )
    }

    render = () => null;
}


// export const FormSelect = ({}) => {
//     const [open, setOpen] = useState(false);
//     const [value, setValue] = useState([]);
//     const [items, setItems] = useState([]);

//     return (
//         <View style={{
//             backgroundColor: '#171717',
//             flex: 1,
//             alignItems: 'center',
//             justifyContent: 'center',
//             paddingHorizontal: 15
//         }}>
//             <DropDownPicker
//                 open={open}
//                 value={value}
//                 items={items}
//                 setOpen={setOpen}
//                 setValue={setValue}
//                 setItems={setItems}

//                 theme="DARK"
//                 multiple={true}
//                 mode="BADGE"
//                 badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
//             />
//         </View>
//     );
// }


export class FormSelect extends React.Component {
    state = {
        data: [], isPicking: false, search: '', arrayData: false, value: [], selectedItems: []
    }

    componentDidMount() {
        const dataSource = this.props.data;
        if (Number.isInteger(dataSource?.length)) {
            this.setState({ data: dataSource, arrayData: true });
        } else {
            this.getApiData();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.value.toString() !== prevState.value?.toString()) {
            if (!this.state.arrayData)
                this.getSelectedItems();
        }
    }

    getSelectedItems = () => {
        const dataSource = this.props.data;
        const getDisplayData = (id) => new Promise((resolve, reject) => {
            dataSource.fetchOne(id, (data) => resolve(data));
        });
        const promises = this.state.value.map(id => getDisplayData(id));
        return Promise.all(promises).then(items => this.setState({ selectedItems: items })).catch(error => { T.alert('Lỗi', 'Không lấy được dữ liệu'); console.error(error) })
    }

    getApiData = () => {
        const dataSource = this.props.data;
        T.get(dataSource.url, { params: dataSource.data({ term: this.state.search }) })
            .then(response => dataSource.processResults(response))
            .then(({ results }) => this.setState({ data: results })).catch(error => { T.alert('Lỗi', 'Không lấy được dữ liệu'); console.error(error) });
    }

    renderDisplayItem = () => {
        let items = this.state.selectedItems;
        if (this.state.arrayData) {
            items = this.state.data.filter(item => this.state.value.includes(item.id))
        }
        return items.map(item => <Chip mode='outlined' style={{ flex: 1, marginRight: 5 }} key={item.id} onClose={() => { this.onRemoveItem(item) }}>{item.text}</Chip>);
    }

    renderItem = ({ item }) => {
        const { arrayData, search, value } = this.state;
        if (value.includes(item.id) || (arrayData && search && !item.text?.match(search)))
            return null;
        return <TouchableOpacity onPress={() => { this.onSelect(item) }}><List.Item left={() => null} title={item.text} /></TouchableOpacity>
    }

    value = (data) => {
        if (data)
            this.setState({ value: data?.length ? data : [data] });
        else if (this.props.multiple)
            return this.state.value;
        else
            return this.state.value.length ? this.state.value[0] : null;
    }

    selectedItems = () => {
        let items = this.state.selectedItems;
        if (this.state.arrayData) {
            items = this.state.data.filter(item => this.state.value.includes(item.id))
        }
        return items;
    }

    onSelect = (item) => {
        const { multiple } = this.props;
        if (!multiple)
            this.setState({ value: [item.id] }, this.hide);
        else
            this.setState({ value: [...this.state.value, item.id] }, this.hide);
    }

    hide = () => {
        this.setState({ isPicking: false });
    }

    onChangeSearch = () => {
        if (!this.state.arrayData) {
            this.getApiData();
        }
    }

    onRemoveItem = (item) => {
        if (this.props.multiple) {
            this.setState({ value: this.state.value.filter(sitem => sitem.id != item.id) })
        }
        else this.setState({ value: [] });
    }

    render() {
        const { usePortal = true, addButtonStyle = {}, addText, style, label, searchable = true } = this.props;
        let displayUnit = () => {
            if (this.state.value.length)
                return <View style={{ flex: 1, minHeight: 50, }}>
                    <View style={styles.labelContainer}>
                        <Text style={{ color: '#868FA0', fontSize: 12, fontFamily: 'Work sans' }}>{label}</Text>
                    </View>
                    <View style={{ ...styles.inputContainer, paddingTop: 10, flexDirection: 'row', overflow: 'scroll', justifyItem: 'space-between', alignItems: 'center', borderRadius: 20, borderColor: '#868FA0' }}>
                        <ScrollView horizontal style={{ marginRight: 10, padding: 5 }}>
                            {this.renderDisplayItem()}
                        </ScrollView>
                        {addButton}
                    </View>
                </View>;
            else return <View style={{ ...styles.inputContainer, minHeight: 50, borderRadius: 20, borderColor: '#868FA0', padding: 17, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#868FA0', fontSize: 17, fontFamily: 'Work sans' }}>{label}</Text>
                {addButton}
            </View>
        }

        const addButton = <TouchableOpacity onPress={() => this.setState({ isPicking: true })}>
            <Ionicons name='add-circle-outline' size={30} color='#0058c0' />
        </TouchableOpacity>


        const picker = <Dialog visible={this.state.isPicking} onDismiss={() => this.setState({ isPicking: false })}>
            <Dialog.Title>{label}</Dialog.Title>
            <Dialog.Content>
                {searchable ? <RNPInput theme={{ roundness: 20 }} mode='outlined' placeholder='Tìm kiếm' value={this.state.search} onChangeText={text => this.setState({ search: text }, this.onChangeSearch)} /> : null}
            </Dialog.Content>
            <Dialog.ScrollArea style={{ maxHeight: '70%' }}>
                <FlatList
                    data={this.state.data}
                    renderItem={this.renderItem}
                    keyExtractor={item => item.id}
                />
            </Dialog.ScrollArea>
            <Dialog.Actions>
                {null}
            </Dialog.Actions>
        </Dialog>

        if (usePortal)
            return <>
                <View style={{ paddingTop: 10, ...style }}>
                    {displayUnit()}
                </View>
                <Portal>
                    {picker}
                </Portal>
            </>;

        return <>
            {displayUnit()}
            {picker}
        </>;
    }
}

