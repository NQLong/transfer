import React, { useState, useRef, useEffect } from 'react';
import { View, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { Text, Card, useTheme, Avatar, Paragraph, Title, Button, Chip, Menu, IconButton } from 'react-native-paper';

import { renderScrollView, AdminModal } from '@/Utils/component';
import { useSelector, useDispatch} from 'react-redux';
import { getMoreNotificationInPage, readNotification , getNotificationInPage, deleteNotification } from './redux';

import T from '@/Utils/common';

const initPageNumber = 1;
const initPageSize = 10;

const listAlternativeIcon = {
    "fa-book": "book",
    "fa-universal-access": "human",
    "fa-tasks": "clipboard-list-outline",
    "fa-unlock": "lock-open-variant",
    "fa-lock": "lock",
    "fa-user-times": "account-remove",
    "fa-user-plus": "account-plus"
};

class ConfirmDeleteModal extends AdminModal {
    onShow = (item) => {
        this.setState({ item })
    }

    delete = () => {
        this.props.onDeleteNotification(this.state.item.id, this.hide)
    }

    render = () => {
        return this.renderModal({
            title: 'Xoá',
            content: <>
               <Text>Bạn có chắc chắn muốn xoá thông báo này không ? </Text>
            </>,
            button: [<Button key={1} color='blue' onPress={this.delete}>Xác nhận</Button>]
        });
    }
}

const Notification = (props) => {

    const user = useSelector(state => state?.settings?.user);
    
    const notification = useSelector(state => state?.notification);

    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [all, setAll] = useState(true);
    const [unread, setUnread] = useState(true);
    const [read, setRead] = useState(true);

    const confirmModal = useRef(null);
    const scrollView = useRef(null);

    const dispatch = useDispatch();
    const { colors } = useTheme();

    const { navigation } = props;

    useEffect(() => {
        scrollView.current?.scrollTo({
            y: 0,
            animated: true,
        });
        setAll(true);
        setRead(true);
        setUnread(true);
        onRefresh();
    }, [user]);

    useEffect(() => {
        onRefresh(true);
    }, [all]);

    useEffect(() => {
        setAll(unread && read);
        onRefresh(true);
    }, [unread, read]);

    const onRefresh = (isFilter = false) => {
        setRefreshing(true);
        getData(initPageNumber, initPageSize, isFilter, () => {
            setRefreshing(false);
            setIsLoading(false);
        });
    }

    const allNotification = notification?.page?.list;

    const getData = (pageNumber, pageSize, isFilter, done) => {
        let readCondition = undefined;
        if (!unread || !read) {
            readCondition = unread ? '0' : '1';
            if (!unread && !read) {
                readCondition = '2';
            }
        };
        dispatch(getNotificationInPage(pageNumber, pageSize, readCondition, isFilter, done));
    };

    const onLoadMore = () => {
        const { pageNumber, pageSize, pageTotal } = notification?.page || {};
        if (!pageNumber || !pageSize || pageNumber == pageTotal) return;
        setIsLoading(true);
        let readCondition = undefined;
        if (!unread || !read) {
            readCondition = unread ? '0' : '1';
            if (!unread && !read) {
                readCondition = '2';
            }
        };
        // scrollView.current?.scrollToEnd({animated: true});
        return dispatch(getMoreNotificationInPage(pageNumber + 1, pageSize, readCondition, () => setIsLoading(false)));
    };

    const readNotify = (id, action) => {
        dispatch(readNotification(id, action, () => getData(initPageNumber, initPageSize)));
    }
    
    const renderNotificationItem = (item, index) => {
        const targetLink = item.targetLink;
        const congVanId = targetLink?.substring(targetLink.lastIndexOf('/') + 1, targetLink.length) || '';
        return (
            <Card elevation={4} key={index} style={{ ...styles.cardItem, backgroundColor: item.read == 1 ? 'rgba(0, 0, 0, 0.05)' : 'white' }} onPress={() => { item.read == 0 && readNotify(item.id) ; navigation.navigate('CongVanDen', { congVanDenId : congVanId}) }}>
                <Card.Content>
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center"
                        }}
                    >
                        <View style={{ flex: 0.2 }}>
                            <Avatar.Icon size={42} {...props} icon={listAlternativeIcon[item.icon] || 'book'} style={{ backgroundColor: item.iconColor ? item.iconColor : 'black'}} color="white"/>
                        </View>
                        <View style={{ flex: 0.8 }}> 
                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginRight: 0}}>
                                <Title style={{ fontSize: 16, fontWeight: 'bold'}}>{item.title.length > 25 ? `${item.title.slice(0, 25)}...` : item.title}</Title>
                                <IconButton
                                    icon="delete"
                                    iconColor="red"
                                    size={20}
                                    onPress={() => confirmModal.current?.show(item)}
                                />
                            </View>
                            <Paragraph numberOfLines={3} style={{ marginBottom: 10}}>{item.subTitle}</Paragraph>
                            <Text style={{ fontSize: 12, color: '#696969' }}>{T.dateToText(item.sendTime, 'dd/mm/yyyy HH:MM:ss')}</Text>
                        </View>
                    </View>
                </Card.Content>
            </Card>
        )
    }

    const renderNotificationList = () => {
        if (!allNotification)
            return refreshing ? null : <ActivityIndicator size="large" color={colors.primary} />;
        else if (allNotification.length === 0)
            return <Text style={{ margin: 12 }}>Chưa có thông báo nào</Text>
        else
            return allNotification.map((item, index) => renderNotificationItem(item, index));
    }

    const onSelectAll = () => {
        setAll(!all); 
        setUnread(!all);
        setRead(!all);
    }

    const onSelect = (isUnread) => {
        if (isUnread) { 
            setUnread(!unread);
        } else {
            setRead(!read);
        }       
    }

    const onDeleteNotification = (data, done) => dispatch(deleteNotification(data, () => getData(initPageNumber, initPageSize, true, done)));

    const searchNotification = () => {
        return <View style={{ flex: 1, flexDirection: 'row', padding: 10}} >
        <Chip onPress={() => onSelectAll()} mode="flat" style={{ marginRight: 10 }} selected={all}> Tất cả</Chip>
        <Chip onPress={() => onSelect(true)} mode="flat" style={{ marginRight: 10 }} selected={unread}>Chưa đọc</Chip>
        <Chip onPress={() => onSelect(false)} mode="flat" selected={read}>Đã đọc</Chip>
      </View>
    }

    return renderScrollView({
        ...props,
        content: <>
            {searchNotification()}
            {renderNotificationList()}
            {isLoading && <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 20, marginTop: 20 }} />}
            <ConfirmDeleteModal ref={confirmModal} onDeleteNotification={onDeleteNotification} />
        </>,
        style: {},
        refreshControl: <RefreshControl colors={["#9Bd35A", "#689F38"]} refreshing={refreshing} onRefresh={onRefresh} />,
        ref: scrollView,
        onScroll: ({ nativeEvent }) => {
            if (T.isCloseToBottom(nativeEvent)) {
                onLoadMore();
            }
        }
    });
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        alignItems: 'center',
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    cardItem: {
        borderRadius: 10,
        margin: 10,
    },
    cardTitle: {
        fontSize: 14,
        color: 'black',
        textTransform: 'uppercase'
    },
    cardContent: {
        display: 'flex',
        justifyContent: 'space-between'
    },
    statusLabel: {
        fontSize: 12,
        paddingLeft: 15,
        paddingRight: 15
    },
    rightSide: {
        fontSize: 14,
        marginRight: 10
    },
    dateLabel: {
        marginTop: 0,
        fontSize: 12,
    },
    checkbox: {
        alignSelf: "center",
    },
    label: {
        margin: 8,
    },
    box: {
        flex: 1,
        width: 50,
        height: 50,
    }
});
  
export default Notification;