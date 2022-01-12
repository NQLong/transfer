import { getStaffEdit, userGetStaff } from '../tccbCanBo/redux';

import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtNghiViecGetAll = 'QtNghiViec:GetAll';
const QtNghiViecGetPage = 'QtNghiViec:GetPage';
const QtNghiViecGetGroupPage = 'QtNghiViec:GetGroupPage';
const QtNghiViecUpdate = 'QtNghiViec:Update';
const QtNghiViecGet = 'QtNghiViec:Get';

export default function QtNghiViecReducer(state = null, data) {
    switch (data.type) {
        case QtNghiViecGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtNghiViecGetGroupPage:
            return Object.assign({}, state, { page_gr: data.page });
        case QtNghiViecGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtNghiViecGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtNghiViecUpdate:
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
T.initPage('pageQtNghiViec');
export function getQtNghiViecPage(pageNumber, pageSize, loaiDoiTuong, pageCondition, done) {
    const page = T.updatePage('pageQtNghiViec', pageNumber, pageSize, pageCondition);
    if (!loaiDoiTuong) loaiDoiTuong = [];
    if (!Array.isArray(loaiDoiTuong)) loaiDoiTuong = [loaiDoiTuong];
    return dispatch => {
        const url = `/api/tccb/qua-trinh/nghi-viec/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, parameter: loaiDoiTuong}, data => {
            if (data.error) {
                T.notify('Lấy danh sách sách giáo trình bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtNghiViecGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách sách giáo trình bị lỗi!', 'danger'));
    };
}

T.initPage('groupPageQtNghiViec', true);
export function getQtNghiViecGroupPage(pageNumber, pageSize, loaiDoiTuong, pageCondition, done) {
    const page = T.updatePage('groupPageQtNghiViec', pageNumber, pageSize, pageCondition);
    if (!loaiDoiTuong) loaiDoiTuong = [];
    if (!Array.isArray(loaiDoiTuong)) loaiDoiTuong = [loaiDoiTuong];
    return dispatch => {
        const url = `/api/tccb/qua-trinh/nghi-viec/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, parameter: loaiDoiTuong}, data => {
            if (data.error) {
                T.notify('Lấy danh sách sách giáo trình theo cán bộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtNghiViecGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

T.initPage('groupPageMaQtNghiViec', true);
export function getQtNghiViecGroupPageMa(pageNumber, pageSize, loaiDoiTuong, pageCondition, done) {
    const page = T.updatePage('groupPageMaQtNghiViec', pageNumber, pageSize, pageCondition);
    if (!loaiDoiTuong) loaiDoiTuong = '-1';
    return dispatch => {
        const url = `/api/tccb/qua-trinh/nghi-viec/group_sgt/page/${loaiDoiTuong}/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sách giáo trình theo cán bộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtNghiViecGetPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}


export function updateQtNghiViecGroupPageMa(ma, changes, done) {
    return dispatch => {
        const url = '/api/staff/qua-trinh/nghi-viec';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật sách giáo trình bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật sách giáo trình thành công!', 'success');
                done && done(data.item);
                dispatch(getQtNghiViecGroupPageMa(undefined, undefined, '-1', data.shcc));
            }
        }, () => T.notify('Cập nhật sách giáo trình bị lỗi!', 'danger'));
    };
}


export function deleteQtNghiViecGroupPageMa(ma, shcc, done) {
    return dispatch => {
        const url = '/api/staff/qua-trinh/nghi-viec';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa thông tin nghỉ việc bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin nghỉ việc được xóa thành công!', 'info', false, 800);
                done && done(data.item);
                dispatch(getQtNghiViecGroupPageMa(undefined, undefined, '-1', shcc));
            }
        }, () => T.notify('Xóa thông tin nghỉ việc bị lỗi', 'danger'));
    };
}

export function createQtNghiViecStaff(data, done, isEdit = null) {
    return dispatch => {
        const url = '/api/staff/qua-trinh/nghi-viec';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin nghỉ việc bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin nghỉ việc thành công!', 'info');
                if (done) {
                    if (isEdit) {
                        done();
                        dispatch(getStaffEdit(data.shcc));
                    }
                    else {
                        done(data);
                        dispatch(getQtNghiViecPage());
                    }
                }
            }
        }, () => T.notify('Thêm thông tin nghỉ việc bị lỗi', 'danger'));
    };
}

export function updateQtNghiViecStaff(ma, changes, done, isEdit = null) {
    return dispatch => {
        const url = '/api/staff/qua-trinh/nghi-viec';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin nghỉ việc bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin nghỉ việc thành công!', 'info');
                isEdit ? (done && done()) : (done && done(data.item));
                isEdit ? dispatch(getStaffEdit(changes.shcc)) : dispatch(getQtNghiViecPage());
            }
        }, () => T.notify('Cập nhật thông tin nghỉ việc bị lỗi', 'danger'));
    };
}

export function deleteQtNghiViecStaff(ma, isEdit, shcc = null) {
    return dispatch => {
        const url = '/api/staff/qua-trinh/nghi-viec';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa thông tin nghỉ việc bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin nghỉ việc được xóa thành công!', 'info', false, 800);
                isEdit ? dispatch(getStaffEdit(shcc)) : dispatch(getQtNghiViecPage());
            }
        }, () => T.notify('Xóa thông tin nghỉ việc bị lỗi', 'danger'));
    };
}

export function createQtNghiViecStaffUser(data, done) {
    return dispatch => {
        const url = '/api/user/staff/qua-trinh/nghi-viec';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin nghỉ việc bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin nghỉ việc thành công!', 'info');
                if (done) done(res);
                dispatch(userGetStaff(data.email));
            }
        }, () => T.notify('Thêm thông tin nghỉ việc bị lỗi', 'danger'));
    };
}

export function updateQtNghiViecStaffUser(ma, changes, done) {
    return dispatch => {
        const url = '/api/user/staff/qua-trinh/nghi-viec';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin nghỉ việc bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin nghỉ việc thành công!', 'info');
                if (done) done();
                dispatch(userGetStaff(changes.email));
            }
        }, () => T.notify('Cập nhật thông tin nghỉ việc bị lỗi', 'danger'));
    };
}

export function deleteQtNghiViecStaffUser(ma, email, done) {
    return dispatch => {
        const url = '/api/user/staff/qua-trinh/nghi-viec';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa thông tin nghỉ việc bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin nghỉ việc được xóa thành công!', 'info', false, 800);
                done && done();
                dispatch(userGetStaff(email));
            }
        }, () => T.notify('Xóa thông tin nghỉ việc bị lỗi', 'danger'));
    };
}