import { getStaffEdit, userGetStaff } from '../tccbCanBo/redux';

import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtNghienCuuKhoaHocGetAll = 'QtNghienCuuKhoaHoc:GetAll';
const QtNghienCuuKhoaHocGetPage = 'QtNghienCuuKhoaHoc:GetPage';
const QtNghienCuuKhoaHocGetGroupPage = 'QtNghienCuuKhoaHoc:GetGroupPage';
const QtNghienCuuKhoaHocUpdate = 'QtNghienCuuKhoaHoc:Update';
const QtNghienCuuKhoaHocGet = 'QtNghienCuuKhoaHoc:Get';

export default function QtNghienCuuKhoaHocReducer(state = null, data) {
    switch (data.type) {
        case QtNghienCuuKhoaHocGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtNghienCuuKhoaHocGetGroupPage:
            return Object.assign({}, state, { page_gr: data.page });
        case QtNghienCuuKhoaHocGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtNghienCuuKhoaHocGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtNghienCuuKhoaHocUpdate:
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
T.initPage('pageQtNghienCuuKhoaHoc');
export function getQtNghienCuuKhoaHocPage(pageNumber, pageSize, loaiDoiTuong, pageCondition, done) {
    const page = T.updatePage('pageQtNghienCuuKhoaHoc', pageNumber, pageSize, pageCondition);
    if (!loaiDoiTuong) loaiDoiTuong = [];
    if (!Array.isArray(loaiDoiTuong)) loaiDoiTuong = [loaiDoiTuong];
    return dispatch => {
        const url = `/api/tccb/qua-trinh/nghien-cuu-khoa-hoc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, parameter: loaiDoiTuong}, data => {
            if (data.error) {
                T.notify('Lấy danh sách nghiên cứu khoa học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtNghienCuuKhoaHocGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách nghiên cứu khoa học bị lỗi!', 'danger'));
    };
}

T.initPage('groupPageQtNghienCuuKhoaHoc', true);
export function getQtNghienCuuKhoaHocGroupPage(pageNumber, pageSize, loaiDoiTuong, pageCondition, done) {
    const page = T.updatePage('groupPageQtNghienCuuKhoaHoc', pageNumber, pageSize, pageCondition);
    if (!loaiDoiTuong) loaiDoiTuong = [];
    if (!Array.isArray(loaiDoiTuong)) loaiDoiTuong = [loaiDoiTuong];
    return dispatch => {
        const url = `/api/tccb/qua-trinh/nghien-cuu-khoa-hoc/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, parameter: loaiDoiTuong}, data => {
            if (data.error) {
                T.notify('Lấy danh sách nghiên cứu khoa học theo cán bộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtNghienCuuKhoaHocGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

T.initPage('groupPageMaQtNghienCuuKhoaHoc', true);
export function getQtNghienCuuKhoaHocGroupPageMa(pageNumber, pageSize, loaiDoiTuong, pageCondition, done) {
    const page = T.updatePage('groupPageMaQtNghienCuuKhoaHoc', pageNumber, pageSize, pageCondition);
    if (!loaiDoiTuong) loaiDoiTuong = '-1';
    return dispatch => {
        const url = `/api/tccb/qua-trinh/nghien-cuu-khoa-hoc/group_nckh/page/${loaiDoiTuong}/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nghiên cứu khoa học theo cán bộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtNghienCuuKhoaHocGetPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}


export function updateQtNghienCuuKhoaHocGroupPageMa(id, changes, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/nghien-cuu-khoa-hoc';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật nghiên cứu khoa học bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật nghiên cứu khoa học thành công!', 'success');
                done && done(data.item);
                dispatch(getQtNghienCuuKhoaHocGroupPageMa(undefined, undefined, '-1', data.shcc));
            }
        }, () => T.notify('Cập nhật nghiên cứu khoa học bị lỗi!', 'danger'));
    };
}

export function createQtNckhStaff(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nckh';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin nghiên cứu khoa học bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin nghiên cứu khoa học thành công!', 'info');
                dispatch(getStaffEdit(data.shcc));
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin nghiên cứu khoa học bị lỗi', 'danger'));
    };
}

export function updateQtNckhStaff(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nckh';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin nghiên cứu khoa học bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin nghiên cứu khoa học thành công!', 'info');
                dispatch(getStaffEdit(changes.shcc));
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin nghiên cứu khoa học bị lỗi', 'danger'));
    };
}

export function deleteQtNckhStaff(id, shcc, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nckh';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin nghiên cứu khoa học bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin nghiên cứu khoa học được xóa thành công!', 'info', false, 800);
                if (done) done();
                dispatch(getStaffEdit(shcc));
            }
        }, () => T.notify('Xóa thông tin nghiên cứu khoa học bị lỗi', 'danger'));
    };
}

export function createQtNckhStaffUser(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nckh';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin nghiên cứu khoa học bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin nghiên cứu khoa học thành công!', 'info');
                if (done) done(res);
                dispatch(userGetStaff(data.email));

            }
        }, () => T.notify('Thêm thông tin nghiên cứu khoa học bị lỗi', 'danger'));
    };
}

export function updateQtNckhStaffUser(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nckh';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin nghiên cứu khoa học bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin nghiên cứu khoa học thành công!', 'info');
                dispatch(userGetStaff(changes.email));
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin nghiên cứu khoa học bị lỗi', 'danger'));
    };
}

export function deleteQtNckhStaffUser(id, email, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nckh';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin nghiên cứu khoa học bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin nghiên cứu khoa học được xóa thành công!', 'info', false, 800);
                done && done();
                dispatch(userGetStaff(email));
            }
        }, () => T.notify('Xóa thông tin nghiên cứu khoa học bị lỗi', 'danger'));
    };
}