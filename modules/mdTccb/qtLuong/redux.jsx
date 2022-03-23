import { userGetStaff } from '../tccbCanBo/redux';

import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtLuongGetAll = 'QtLuong:GetAll';
const QtLuongGetPage = 'QtLuong:GetPage';
const QtLuongGetUserPage = 'QtLuong:GetUserPage';
const QtLuongGetGroupPage = 'QtLuong:GetGroupPage';
const QtLuongGetGroupPageMa = 'QtLuong:GetGroupPageMa';
const QtLuongUpdate = 'QtLuong:Update';
const QtLuongGet = 'QtLuong:Get';

export default function QtLuongReducer(state = null, data) {
    switch (data.type) {
        case QtLuongGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtLuongGetGroupPage:
            return Object.assign({}, state, { pageGr: data.page });
        case QtLuongGetGroupPageMa:
            return Object.assign({}, state, { pageMa: data.page });
        case QtLuongGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtLuongGetUserPage:
            return Object.assign({}, state, { userPage: data.page });
        case QtLuongGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtLuongUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].ma == updatedItem.ma) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].ma == updatedItem.ma) {
                            updatedPage.list.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                return Object.assign({}, state, { items: updatedItems, page: updatedPage });
            } else {
                return null;
            }
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('userPageQtLuong');
export function getQtLuongUserPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('userPageQtLuong', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/user/qua-trinh/luong/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách lương bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtLuongGetUserPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách lương bị lỗi!', 'danger'));
    };
}

export function updateQtLuongUserPage(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/luong';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật lương bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật lương thành công!', 'success');
                done && done(data.item);
                dispatch(getQtLuongUserPage());
            }
        }, () => T.notify('Cập nhật lương bị lỗi!', 'danger'));
    };
}

export function createQtLuongUserPage(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/luong';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo lương bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo lương thành công!', 'success');
                    dispatch(getQtLuongUserPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo lương bị lỗi!', 'danger'));
    };
}
export function deleteQtLuongUserPage(id, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/luong';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa lương bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('lương đã xóa thành công!', 'success', false, 800);
                done && done(data.item);
                dispatch(getQtLuongUserPage());
            }
        }, () => T.notify('Xóa lương bị lỗi!', 'danger'));
    };
}

T.initPage('pageQtLuong');
export function getQtLuongPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtLuong', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/luong/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách lương bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtLuongGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách lương bị lỗi!', 'danger'));
    };
}

export function getQtLuongGroupPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtLuong', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/luong/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách lương theo cán bộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtLuongGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

T.initPage('groupPageMaQtLuong');
export function getQtLuongGroupPageMa(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('groupPageMaQtLuong', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/luong/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách lương bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtLuongGetGroupPageMa, page: data.page });
            }
        }, () => T.notify('Lấy danh sách lương bị lỗi!', 'danger'));
    };
}

export function updateQtLuongGroupPageMa(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/luong';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật lương bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật lương thành công!', 'success');
                done && done(data.item);
                dispatch(getQtLuongGroupPageMa());
            }
        }, () => T.notify('Cập nhật lương bị lỗi!', 'danger'));
    };
}


export function deleteQtLuongGroupPageMa(id, done) {
    return dispatch => {
        const url = '/api/qua-trinh/luong';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin lương bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin lương được xóa thành công!', 'info', false, 800);
                done && done(data.item);
                dispatch(getQtLuongGroupPageMa());
            }
        }, () => T.notify('Xóa thông tin lương bị lỗi', 'danger'));
    };
}

export function createQtLuongGroupPageMa(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/luong';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo lương bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo lương thành công!', 'success');
                    dispatch(getQtLuongGroupPageMa());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo lương bị lỗi!', 'danger'));
    };
}

export function createQtLuongStaff(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/luong';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin lương bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin lương thành công!', 'info');
                if (done) {
                    done(data);
                    dispatch(getQtLuongPage());
                }
            }
        }, () => T.notify('Thêm thông tin lương bị lỗi', 'danger'));
    };
}

export function updateQtLuongStaff(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/luong';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin lương bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin lương thành công!', 'info');
                done && done(data.item);
                dispatch(getQtLuongPage());
            }
        }, () => T.notify('Cập nhật thông tin lương bị lỗi', 'danger'));
    };
}

export function deleteQtLuongStaff(id, done) {
    return dispatch => {
        const url = '/api/qua-trinh/luong';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin lương bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin lương được xóa thành công!', 'info', false, 800);
                dispatch(getQtLuongPage());
                done && done(data.item);
            }
        }, () => T.notify('Xóa thông tin lương bị lỗi', 'danger'));
    };
}

export function createQtLuongStaffUser(data, done) {
    return dispatch => {
        const url = '/api/user/staff/qua-trinh/luong';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin lương bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin lương thành công!', 'info');
                if (done) done(res);
                dispatch(userGetStaff(data.email));
            }
        }, () => T.notify('Thêm thông tin lương bị lỗi', 'danger'));
    };
}

export function updateQtLuongStaffUser(id, changes, done) {
    return dispatch => {
        const url = '/api/user/staff/qua-trinh/luong';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin lương bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin lương thành công!', 'info');
                if (done) done();
                dispatch(userGetStaff(changes.email));
            }
        }, () => T.notify('Cập nhật thông tin lương bị lỗi', 'danger'));
    };
}

export function deleteQtLuongStaffUser(id, email, done) {
    return dispatch => {
        const url = '/api/user/staff/qua-trinh/luong';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin lương bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin lương được xóa thành công!', 'info', false, 800);
                done && done();
                dispatch(userGetStaff(email));
            }
        }, () => T.notify('Xóa thông tin lương bị lỗi', 'danger'));
    };
}