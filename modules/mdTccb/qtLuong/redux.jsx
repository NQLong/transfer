import { getStaffEdit, userGetStaff } from '../tccbCanBo/redux';

import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtLuongGetAll = 'QtLuong:GetAll';
const QtLuongGetPage = 'QtLuong:GetPage';
const QtLuongGetGroupPage = 'QtLuong:GetGroupPage';
const QtLuongUpdate = 'QtLuong:Update';
const QtLuongGet = 'QtLuong:Get';

export default function QtLuongReducer(state = null, data) {
    switch (data.type) {
        case QtLuongGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtLuongGetGroupPage:
            return Object.assign({}, state, { page_gr: data.page });
        case QtLuongGetPage:
            return Object.assign({}, state, { page: data.page });
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

T.initPage('groupPageQtLuong', true);
export function getQtLuongGroupPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('groupPageQtLuong', pageNumber, pageSize, pageCondition, filter);
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
                dispatch(getQtLuongPage());
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
                dispatch(getQtLuongPage());
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
                    dispatch(getQtLuongPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo lương bị lỗi!', 'danger'));
    };
}

export function createQtLuongStaff(data, done, isEdit = null) {
    return dispatch => {
        const url = '/api/qua-trinh/luong';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin lương bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin lương thành công!', 'info');
                if (done) {
                    if (isEdit) {
                        done();
                        dispatch(getStaffEdit(data.shcc));
                    }
                    else {
                        done(data);
                        dispatch(getQtLuongPage());
                    }
                }
            }
        }, () => T.notify('Thêm thông tin lương bị lỗi', 'danger'));
    };
}

export function updateQtLuongStaff(id, changes, done, isEdit = null) {
    return dispatch => {
        const url = '/api/qua-trinh/luong';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin lương bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin lương thành công!', 'info');
                isEdit ? (done && done()) : (done && done(data.item));
                isEdit ? dispatch(getStaffEdit(changes.shcc)) : dispatch(getQtLuongPage());
            }
        }, () => T.notify('Cập nhật thông tin lương bị lỗi', 'danger'));
    };
}

export function deleteQtLuongStaff(id, isEdit, shcc = null) {
    return dispatch => {
        const url = '/api/qua-trinh/luong';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin lương bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin lương được xóa thành công!', 'info', false, 800);
                isEdit ? dispatch(getStaffEdit(shcc)) : dispatch(getQtLuongPage());
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