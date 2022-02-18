import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const NotificationGetPage = 'Notification:GetPage';
const NotificationUnread = 'Notification:Unread';
const NotificationAddItem = 'Notification:AddItem';
const NotificationDeleteItem = 'Notification:DeleteItem';

export default function notificationReducer(state = null, data) {
    switch (data.type) {
        case NotificationGetPage:
            return Object.assign({}, state, { page: data.page });

        case NotificationUnread:
            return Object.assign({}, state, { unread: data.page.list || [] });

        case NotificationAddItem: {
            const newItem = data.item;
            let currentPage = state && state.page ? { ...state.page } : { list: [] };
            let currentUnread = state && state.unread ? [...state.unread] : [];
            if (!currentPage.list || !Array.isArray(currentPage.list)) currentPage.list = [];
            currentPage.list.unshift(newItem);
            if (newItem.read == 0) {
                currentUnread.unshift(newItem);
            }

            return Object.assign({}, state, { page: currentPage, unread: currentUnread });
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
            return Object.assign({}, state, { unread: currentUnread });
        }

        default:
            return state;
    }
}

T.initPage('fwNotification');
T.initPage('fwUnreadNotification');
export function getNotificationInPage(pageNumber, pageSize, read, done) {
    if (done == undefined && typeof read == 'function') {
        done = read;
        read = null;
    }
    const page = T.updatePage('fwNotification', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/notification/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { read }, data => {
            if (data.error) {
                T.notify('Lấy danh sách thông báo bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data.page);
                dispatch({ type: NotificationGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách thông báo bị lỗi!', 'danger'));
    };
}

export function getUnreadNotification(pageNumber, pageSize, done) {
    const page = T.updatePage('fwUnreadNotification', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/notification/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { read: 0 }, data => {
            if (data.error) {
                T.notify('Lấy danh sách thông báo bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data.page);
                dispatch({ type: NotificationUnread, page: data.page });
            }
        }, () => T.notify('Lấy danh sách thông báo bị lỗi!', 'danger'));
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
    return (dispatch) => {
        const url = `/api/notification/item/${id}`;
        T.get(url, { action }, data => {
            if (data.error) {
                T.notify('Lấy thông tin thông báo bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (document.location.pathname == '/user/notification') {
                    dispatch(getNotificationInPage());
                }
                done && done(data.item);
            }
        }, () => T.notify('Lấy thông tin thông báo bị lỗi!', 'danger'));
    };
}

export function deleteNotification(id, done) {
    return (dispatch) => {
        const url = '/api/notification';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông báo bị lỗi', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Xóa thông báo thành công!', 'success', false, 800);
                dispatch({ type: NotificationDeleteItem, id });
                dispatch(getNotificationInPage());
                done && done();
            }
        }, () => T.notify('Xóa thông báo bị lỗi', 'danger'));
    };
}