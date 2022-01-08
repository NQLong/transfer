import T from 'view/js/common';

import { getStaffEdit, userGetStaff } from '../tccbCanBo/redux';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtNuocNgoaiGetAll = 'QtNuocNgoai:GetAll';
const QtNuocNgoaiGetPage = 'QtNuocNgoai:GetPage';
const QtNuocNgoaiGetGroupPage = 'QtNuocNgoai:GetGroupPage';
const QtNuocNgoaiUpdate = 'QtNuocNgoai:Update';
const QtNuocNgoaiGet = 'QtNuocNgoai:Get';

export default function QtNuocNgoaiReducer(state = null, data) {
    switch (data.type) {
        case QtNuocNgoaiGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtNuocNgoaiGetGroupPage:
            return Object.assign({}, state, { page_gr: data.page });
        case QtNuocNgoaiGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtNuocNgoaiGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtNuocNgoaiUpdate:
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
T.initPage('pageQtNuocNgoai');
export function getQtNuocNgoaiPage(pageNumber, pageSize, loaiDoiTuong, pageCondition, done) {
    const page = T.updatePage('pageQtNuocNgoai', pageNumber, pageSize, pageCondition);
    if (!loaiDoiTuong) loaiDoiTuong = [];
    if (!Array.isArray(loaiDoiTuong)) loaiDoiTuong = [loaiDoiTuong];
    return dispatch => {
        const url = `/api/tccb/qua-trinh/nuoc-ngoai/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, parameter: loaiDoiTuong}, data => {
            if (data.error) {
                T.notify('Lấy danh sách đi nước ngoài bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtNuocNgoaiGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách đi nước ngoài bị lỗi!', 'danger'));
    };
}

T.initPage('groupPageQtNuocNgoai', true);
export function getQtNuocNgoaiGroupPage(pageNumber, pageSize, loaiDoiTuong, pageCondition, done) {
    const page = T.updatePage('groupPageQtNuocNgoai', pageNumber, pageSize, pageCondition);
    if (!loaiDoiTuong) loaiDoiTuong = [];
    if (!Array.isArray(loaiDoiTuong)) loaiDoiTuong = [loaiDoiTuong];
    return dispatch => {
        const url = `/api/tccb/qua-trinh/nuoc-ngoai/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, parameter: loaiDoiTuong}, data => {
            if (data.error) {
                T.notify('Lấy danh sách đi nước ngoài theo cán bộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtNuocNgoaiGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

T.initPage('groupPageMaQtNuocNgoai', true);
export function getQtNuocNgoaiGroupPageMa(pageNumber, pageSize, loaiDoiTuong, pageCondition, done) {
    const page = T.updatePage('groupPageMaQtNuocNgoai', pageNumber, pageSize, pageCondition);
    if (!loaiDoiTuong) loaiDoiTuong = [];
    return dispatch => {
        const url = `/api/tccb/qua-trinh/nuoc-ngoai/group_nn/page/${loaiDoiTuong}/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách đi nước ngoài theo cán bộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtNuocNgoaiGetPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getQtNuocNgoaiAll(done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/nuoc-ngoai/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách đi nước ngoài bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: QtNuocNgoaiGetAll, items: data.items ? data.items : {} });
            }
        }, () => T.notify('Lấy danh sách đi nước ngoài bị lỗi!', 'danger'));
    };
}

export function getQtNuocNgoai(id, done) {
    return () => {
        const url = `/api/tccb/qua-trinh/ky-luat/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy đi nước ngoài bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createQtNuocNgoaiStaff(data, done, isStaffEdit = null) {
    return dispatch => {
        const url = '/api/qua-trinh/nuoc-ngoai';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình đi nước ngoài bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình đi nước ngoài thành công!', 'info');
                isStaffEdit ? dispatch(getStaffEdit(data.shcc)) : dispatch(getQtNuocNgoaiPage());
                isStaffEdit ? (done && done()) : (done && done(data));
            }
        }, () => T.notify('Thêm thông tin quá trình đi nước ngoài bị lỗi', 'danger'));
    };
}

export function updateQtNuocNgoaiStaff(id, changes, done, isStaffEdit = null) {
    return dispatch => {
        const url = '/api/qua-trinh/nuoc-ngoai';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình đi nước ngoài bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình đi nước ngoài thành công!', 'info');
                isStaffEdit ? (done && done()) : (done && done(data.item));
                isStaffEdit ? dispatch(getStaffEdit(data.shcc)) : dispatch(getQtNuocNgoaiPage());
            }
        }, () => T.notify('Cập nhật thông tin quá trình đi nước ngoài bị lỗi', 'danger'));
    };
}

export function updateQtNuocNgoaiGroupPageMa(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nuoc-ngoai';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình đi nước ngoài bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình đi nước ngoài thành công!', 'info');
                done && done(data.item);
                dispatch(getQtNuocNgoaiGroupPageMa(undefined, undefined, '-1', data.shcc));
            }
        }, () => T.notify('Cập nhật thông tin quá trình đi nước ngoài bị lỗi', 'danger'));
    };
}

export function deleteQtNuocNgoaiStaff(id, isStaffEdit, shcc = null) {
    return dispatch => {
        const url = '/api/qua-trinh/nuoc-ngoai';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình đi nước ngoài bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình đi nước ngoài được xóa thành công!', 'info', false, 800);
                isStaffEdit ? dispatch(getStaffEdit(shcc)) : dispatch(getQtNuocNgoaiPage());
            }
        }, () => T.notify('Xóa thông tin quá trình đi nước ngoài bị lỗi', 'danger'));
    };
}

export function createQtNuocNgoaiStaffUser(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nuoc-ngoai';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình đi nước ngoài bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình đi nước ngoài thành công!', 'info');
                if (done) done(data);
                dispatch(userGetStaff(data.email));
            }
        }, () => T.notify('Thêm thông tin quá trình đi nước ngoài bị lỗi', 'danger'));
    };
}

export function updateQtNuocNgoaiStaffUser(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nuoc-ngoai';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình đi nước ngoài bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình đi nước ngoài thành công!', 'info');
                if (done) done();
                dispatch(userGetStaff(changes.email));
            }
        }, () => T.notify('Cập nhật thông tin quá trình đi nước ngoài bị lỗi', 'danger'));
    };
}

export function deleteQtNuocNgoaiStaffUser(id, email, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nuoc-ngoai';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình đi nước ngoài bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình đi nước ngoài được xóa thành công!', 'info', false, 800);
                done && done();
                dispatch(userGetStaff(email));
            }
        }, () => T.notify('Xóa thông tin quá trình đi nước ngoài bị lỗi', 'danger'));
    };
}