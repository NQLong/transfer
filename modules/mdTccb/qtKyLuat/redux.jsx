import T from 'view/js/common';
import { getStaffEdit, userGetStaff } from '../tccbCanBo/redux';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtKyLuatGetAll = 'QtKyLuat:GetAll';
const QtKyLuatGetPage = 'QtKyLuat:GetPage';
const QtKyLuatGetUserPage = 'QtKyLuat:GetUserPage';
const QtKyLuatGetGroupPage = 'QtKyLuat:GetGroupPage';
const QtKyLuatUpdate = 'QtKyLuat:Update';
const QtKyLuatGet = 'QtKyLuat:Get';

export default function QtKyLuatReducer(state = null, data) {
    switch (data.type) {
        case QtKyLuatGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtKyLuatGetGroupPage:
            return Object.assign({}, state, { page_gr: data.page });
        case QtKyLuatGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtKyLuatGetUserPage:
            return Object.assign({}, state, { user_page: data.page });
        case QtKyLuatGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtKyLuatUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].id == updatedItem.id) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].id == updatedItem.id) {
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
T.initPage('userPageQtKyLuat');
export function getQtKyLuatUserPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('userPageQtKyLuat', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/user/qua-trinh/ky-luat/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách kỷ luật bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtKyLuatGetUserPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách kỷ luật bị lỗi!', 'danger'));
    };
}

export function updateQtKyLuatUserPage(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/ky-luat';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật kỷ luật bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật kỷ luật thành công!', 'success');
                done && done(data.item);
                dispatch(getQtKyLuatUserPage());
            }
        }, () => T.notify('Cập nhật kỷ luật bị lỗi!', 'danger'));
    };
}

export function createQtKyLuatUserPage(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/ky-luat';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo kỷ luật bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo kỷ luật thành công!', 'success');
                    dispatch(getQtKyLuatUserPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo kỷ luật bị lỗi!', 'danger'));
    };
}
export function deleteQtKyLuatUserPage(id, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/ky-luat';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa kỷ luật bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('kỷ luật đã xóa thành công!', 'success', false, 800);
                done && done(data.item);
                dispatch(getQtKyLuatUserPage());
            }
        }, () => T.notify('Xóa kỷ luật bị lỗi!', 'danger'));
    };
}

T.initPage('pageQtKyLuat');
export function getQtKyLuatPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtKyLuat', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/ky-luat/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách quá trình kỷ luật bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtKyLuatGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách quá trình kỷ luật bị lỗi!', 'danger'));
    };
}

T.initPage('groupPageQtKyLuat', true);
export function getQtKyLuatGroupPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('groupPageQtKyLuat', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/ky-luat/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter}, data => {
            if (data.error) {
                T.notify('Lấy danh sách quá trình kỷ luật bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtKyLuatGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createQtKyLuatStaff(data, done, isEdit = null) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/ky-luat';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo quá trình kỷ luật bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo quá trình kỷ luật thành công!', 'success');
                    if (isEdit) {
                        done();
                        dispatch(getStaffEdit(data.shcc));
                    }
                    else {
                        done(data);
                        dispatch(getQtKyLuatPage());
                    }
                }
            }
        }, () => T.notify('Tạo quá trình kỷ luật bị lỗi!', 'danger'));
    };
}

export function deleteQtKyLuatStaff(id, shcc, idEdit = null) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/ky-luat';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa quá trình kỷ luật bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('quá trình kỷ luật đã xóa thành công!', 'success', false, 800);
                idEdit ? dispatch(getStaffEdit(shcc)) : dispatch(getQtKyLuatPage());
            }
        }, () => T.notify('Xóa quá trình kỷ luật bị lỗi!', 'danger'));
    };
}

export function updateQtKyLuatStaff(id, changes, done, isEdit = null) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/ky-luat';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật quá trình kỷ luật bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật quá trình kỷ luật thành công!', 'success');
                isEdit ? (done && done()) : (done && done(data.item));
                isEdit ? dispatch(getStaffEdit(changes.shcc)) : dispatch(getQtKyLuatPage());
            }
        }, () => T.notify('Cập nhật quá trình kỷ luật bị lỗi!', 'danger'));
    };
}

export function updateQtKyLuatGroupPageMa(id, changes, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/ky-luat';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật quá trình kỷ luật bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật quá trình kỷ luật thành công!', 'success');
                done && done(data.item);
                dispatch(getQtKyLuatPage());
            }
        }, () => T.notify('Cập nhật quá trình kỷ luật bị lỗi!', 'danger'));
    };
}

export function createQtKyLuatGroupPageMa(data, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/ky-luat';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo quá trình kỷ luật bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo quá trình kỷ luật thành công!', 'success');
                    dispatch(getQtKyLuatPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo quá trình kỷ luật bị lỗi!', 'danger'));
    };
}
export function deleteQtKyLuatGroupPageMa(id, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/ky-luat';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa quá trình kỷ luật bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('quá trình kỷ luật đã xóa thành công!', 'success', false, 800);
                done && done(data.item);
                dispatch(getQtKyLuatPage());
            }
        }, () => T.notify('Xóa quá trình kỷ luật bị lỗi!', 'danger'));
    };
}

export function createQtKyLuatStaffUser(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/ky-luat';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình quá trình kỷ luật bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình quá trình kỷ luật thành công!', 'info');
                if (done) done(res);
                dispatch(userGetStaff(data.email));
            }
        }, () => T.notify('Thêm thông tin quá trình quá trình kỷ luật bị lỗi', 'danger'));
    };
}

export function updateQtKyLuatStaffUser(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/ky-luat';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình quá trình kỷ luật bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình quá trình kỷ luật thành công!', 'info');
                if (done) done();
                dispatch(userGetStaff(changes.email));
            }
        }, () => T.notify('Cập nhật thông tin quá trình quá trình kỷ luật bị lỗi', 'danger'));
    };
}

export function deleteQtKyLuatStaffUser(id, email, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/ky-luat';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình quá trình kỷ luật bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình quá trình kỷ luật được xóa thành công!', 'info', false, 800);
                done && done();
                dispatch(userGetStaff(email));
            }
        }, () => T.notify('Xóa thông tin quá trình quá trình kỷ luật bị lỗi', 'danger'));
    };
}