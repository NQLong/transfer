import T from '@/Utils/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const NotificationGetPage = 'Notification:GetPage';
const NotificationUnread = 'Notification:Unread';
const NotificationGetMore = 'Notification:GetMore';
const NotificationAddItem = 'Notification:AddItem';
const NotificationDeleteItem = 'Notification:DeleteItem';

export default function notificationReducer(state = null, data) {
    switch (data.type) {
        case NotificationGetPage:
            return Object.assign({}, state, { page: {...data.page, totalItem: data.isFilter ? state.page.totalItem : data.page.totalItem } });
        case NotificationUnread:
            return Object.assign({}, state, { unread: data.page });
        case NotificationGetMore:
            let newUnread = data.page;
            newUnread.list = [...state.page.list.concat(newUnread.list)];
            return Object.assign({}, state, { page:  newUnread});
        case NotificationAddItem: {
                const newItem = data.item;
                let currentPage = state && state.page ? { ...state.page } : { list: [] };
                let currentUnread = state && state.unread ? [...state.unread] : [];
                if (!currentPage.list || !Array.isArray(currentPage.list)) currentPage.list = [];
                currentPage.list.unshift(newItem);
                if (newItem.read == 0) {
                    currentUnread.unshift(newItem);
                }
    
                return Object.assign({}, state, { page: {...currentPage, totalItem: state.page.totalItem + 1}, unread: currentUnread });
        }
        case NotificationDeleteItem: {
            const id = data.id;
            let currentUnread = state && state.unread ? [...state.unread] : [];
            for (let i = 0; i < currentUnread.length; i++) {
                if (currentUnread[i].id == id) {
                    currentUnread.splice(i, 1);
                    break;
                }
            }
            return Object.assign({}, state, { page: {...state.page, totalItem: state.page.totalItem - 1}, unread: currentUnread });
        }
        default:
            return state;
    }
}

export function getNotificationInPage(pageNumber, pageSize, read, isFilter, done) {
    if (done == undefined && typeof read == 'function') {
        done = read;
        read = null;
    }
    // const page = T.updatePage('fwNotification', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/notification/page/${pageNumber}/${pageSize}?${T.objectToQueryString({ read })}`;
        T.get(url).then(data => {
            if (data.error) {
                T.alert('Lỗi', 'Lấy danh sách thông báo bị lỗi!');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data.page);
                dispatch({ type: NotificationGetPage, page: data.page, isFilter});
            }
        }).catch(error => {
            console.error(error);
            T.alert('Lỗi', 'Lấy danh sách thông báo bị lỗi!')
        });
    };
}

export function getMoreNotificationInPage(pageNumber, pageSize, read, done) {
    if (done == undefined && typeof read == 'function') {
        done = read;
        read = null;
    }
    return dispatch => {
        const url = `/api/notification/page/${pageNumber}/${pageSize}?${T.objectToQueryString({ read })}`;
        T.get(url, { read }).then(data => {
            if (data.error) {
                T.alert('Lỗi', 'Lấy danh sách thông báo bị lỗi!');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data.page);
                dispatch({ type: NotificationGetMore, page: data.page });
            }
        }).catch(error => {
            console.error(error);
            T.alert('Lỗi', 'Lấy danh sách thông báo bị lỗi!')
        });
    };
}

export function getUnreadNotification(pageNumber, pageSize, done) {
    return dispatch => {
        const url = `/api/notification/page/${pageNumber}/${pageSize}`;
        T.get(url, { read: 0 }).then(data => {
            if (data.error) {
                T.alert('Thông báo','Lấy danh sách thông báo bị lỗi!');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                dispatch({ type: NotificationUnread, page: data.page });
                done && done(data.page);
            }
        }).catch(error => {
            console.error(error);
            T.alert('Thông báo', 'Lấy danh sách thông báo bị lỗi!')
        });
    };
}

export function getMoreUnreadNotification(pageNumber, pageSize, done) {
    return dispatch => {
        const url = `/api/notification/page/${pageNumber}/${pageSize}`;
        T.get(url, { read: 0 }).then(data => {
            if (data.error) {
                T.alert('Thông báo','Lấy danh sách thông báo bị lỗi!');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                dispatch({ type: NotificationGetMoreUnread, page: data.page });
                done && done(data.page);
            }
        }).catch(error => {
            console.error(error);
            T.alert('Thông báo', 'Lấy danh sách thông báo bị lỗi!')
        });
    };
}

export function addNotification(item) {
    return { type: NotificationAddItem, item };
}

export function readNotification(id, action, done) {
    if (done == undefined && typeof action == 'function') {
        done = action;
        action = '';
    }
    return () => {
        const url = `/api/notification/item/${id}`;
        T.get(url, { action }).then(data => {
            if (data.error) {
                T.alert('Lỗi', 'Lấy thông tin thông báo bị lỗi!');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data.item);
            }
        }).catch( error => {
            console.log(error);
            T.alert('Lỗi', 'Lấy thông tin thông báo bị lỗi!');
        });
    };
}

export function deleteNotification(id, done) {
    return (dispatch) => {
        const url = '/api/notification';
        T.delete(url, { data: { id }}).then(data => {
            if (data.error) {
                T.alert('Lỗi', 'Xóa thông báo bị lỗi');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Thông báo','Xóa thông báo thành công!');
                dispatch({ type: NotificationDeleteItem, id });
                done && done();
            }
        }).catch(() => T.alert('Lỗi', 'Xóa thông báo bị lỗi'));
    };
}
