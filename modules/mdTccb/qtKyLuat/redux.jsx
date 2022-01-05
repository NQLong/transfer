import T from 'view/js/common';
import { getStaffEdit } from '../tccbCanBo/redux';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtKyLuatGetAll = 'QtKyLuat:GetAll';
const QtKyLuatGetPage = 'QtKyLuat:GetPage';
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
T.initPage('pageQtKyLuat');
export function getQtKyLuatPage(pageNumber, pageSize, loaiDoiTuong, pageCondition, done) {
    const page = T.updatePage('pageQtKyLuat', pageNumber, pageSize, pageCondition);
    if (!loaiDoiTuong) loaiDoiTuong = [];
    if (!Array.isArray(loaiDoiTuong)) loaiDoiTuong = [loaiDoiTuong];
    return dispatch => {
        const url = `/api/tccb/qua-trinh/ky-luat/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, parameter: loaiDoiTuong}, data => {
            if (data.error) {
                T.notify('Lấy danh sách kỷ luật bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtKyLuatGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách kỷ luật bị lỗi!', 'danger'));
    };
}

T.initPage('groupPageQtKyLuat', true);
export function getQtKyLuatGroupPage(pageNumber, pageSize, loaiDoiTuong, pageCondition, done) {
    const page = T.updatePage('groupPageQtKyLuat', pageNumber, pageSize, pageCondition);
    if (!loaiDoiTuong) loaiDoiTuong = [];
    if (!Array.isArray(loaiDoiTuong)) loaiDoiTuong = [loaiDoiTuong];
    return dispatch => {
        const url = `/api/tccb/qua-trinh/ky-luat/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, parameter: loaiDoiTuong}, data => {
            if (data.error) {
                T.notify('Lấy danh sách kỷ luật theo cán bộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtKyLuatGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

T.initPage('groupPageMaQtKyLuat', true);
export function getQtKyLuatGroupPageMa(pageNumber, pageSize, loaiDoiTuong, pageCondition, done) {
    const page = T.updatePage('groupPageMaQtKyLuat', pageNumber, pageSize, pageCondition);
    if (!loaiDoiTuong) loaiDoiTuong = '-1';
    return dispatch => {
        const url = `/api/tccb/qua-trinh/ky-luat/group_kl/page/${loaiDoiTuong}/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách kỷ luật theo cán bộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtKyLuatGetPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getQtKyLuatAll(done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/ky-luat/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách kỷ luật bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: QtKyLuatGetAll, items: data.items ? data.items : {} });
            }
        }, () => T.notify('Lấy danh sách kỷ luật bị lỗi!', 'danger'));
    };
}

export function getQtKyLuat(id, done) {
    return () => {
        const url = `/api/tccb/qua-trinh/ky-luat/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy kỷ luật bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getQtKyLuatEdit(id, done) {
    return dispatch => {
        const url = `/api/tccb/qua-trinh/ky-luat/edit/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin kỷ luật bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data);
                dispatch({ type: QtKyLuatGet, item: data.item });
            }
        }, () => T.notify('Lấy thông tin kỷ luật bị lỗi', 'danger'));
    };
}

export function createQtKyLuat(isStaffEdit, items, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/ky-luat';
        T.post(url, { items }, data => {
            if (data.error) {
                T.notify('Tạo kỷ luật bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                if (done) {
                    T.notify('Tạo kỷ luật thành công!', 'success');
                    isStaffEdit ? dispatch(getStaffEdit(data.item.shcc)) : dispatch(getQtKyLuatPage());
                    isStaffEdit ? (done && done()) : done(data);
                }
            }
        }, () => T.notify('Tạo kỷ luật bị lỗi!', 'danger'));
    };
}

export function deleteQtKyLuat(isStaffEdit, id, shcc = null, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/ky-luat';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa kỷ luật bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('kỷ luật đã xóa thành công!', 'success', false, 800);
                isStaffEdit ? dispatch(getStaffEdit(shcc)) : dispatch(getQtKyLuatPage());
            }
            done && done();
        }, () => T.notify('Xóa kỷ luật bị lỗi!', 'danger'));
    };
}

export function updateQtKyLuat(isStaffEdit, id, changes, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/ky-luat';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật kỷ luật bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật kỷ luật thành công!', 'success');
                isStaffEdit ? (done && done()) : (done && done(data.item));
                isStaffEdit ? dispatch(getStaffEdit(data.item.shcc)) :  dispatch(getQtKyLuatPage());
            }
        }, () => T.notify('Cập nhật kỷ luật bị lỗi!', 'danger'));
    };
}

export function updateQtKyLuatGroup(id, changes, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/ky-luat';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật kỷ luật bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật kỷ luật thành công!', 'success');
                done && done(data.item);
                dispatch(getQtKyLuatPage());
            }
        }, () => T.notify('Cập nhật kỷ luật bị lỗi!', 'danger'));
    };
}

//USER ACTIONS:

export function createQtKyLuatStaff(data, done) {
    return () => {
        const url = '/api/qua-trinh/ky-luat';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình kỷ luật bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình kỷ luật thành công!', 'info');
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin quá trình kỷ luật bị lỗi', 'danger'));
    };
}

export function updateQtKyLuatStaff(id, changes, done) {
    return () => {
        const url = '/api/qua-trinh/ky-luat';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình kỷ luật bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình kỷ luật thành công!', 'info');
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin quá trình kỷ luật bị lỗi', 'danger'));
    };
}

export function deleteQtKyLuatStaff(id, done) {
    return () => {
        const url = '/api/qua-trinh/ky-luat';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình kỷ luật bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình kỷ luật được xóa thành công!', 'info', false, 800);
                if (done) done();
            }
        }, () => T.notify('Xóa thông tin quá trình kỷ luật bị lỗi', 'danger'));
    };
}

export function createQtKyLuatStaffUser(data, done) {
    return () => {
        const url = '/api/user/qua-trinh/ky-luat';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình kỷ luật bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình kỷ luật thành công!', 'info');
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin quá trình kỷ luật bị lỗi', 'danger'));
    };
}

export function updateQtKyLuatStaffUser(id, changes, done) {
    return () => {
        const url = '/api/user/qua-trinh/ky-luat';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình kỷ luật bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình kỷ luật thành công!', 'info');
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin quá trình kỷ luật bị lỗi', 'danger'));
    };
}

export function deleteQtKyLuatStaffUser(id, done) {
    return () => {
        const url = '/api/user/qua-trinh/ky-luat';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình kỷ luật bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình kỷ luật được xóa thành công!', 'info', false, 800);
                done && done();
            }
        }, () => T.notify('Xóa thông tin quá trình kỷ luật bị lỗi', 'danger'));
    };
}