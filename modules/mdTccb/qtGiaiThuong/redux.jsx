import { getStaffEdit } from '../tccbCanBo/redux';

import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtGiaiThuongGetAll = 'QtGiaiThuong:GetAll';
const QtGiaiThuongGetPage = 'QtGiaiThuong:GetPage';
const QtGiaiThuongGetGroupPage = 'QtGiaiThuong:GetGroupPage';
const QtGiaiThuongUpdate = 'QtGiaiThuong:Update';
const QtGiaiThuongGet = 'QtGiaiThuong:Get';

export default function QtGiaiThuongReducer(state = null, data) {
    switch (data.type) {
        case QtGiaiThuongGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtGiaiThuongGetGroupPage:
            return Object.assign({}, state, { page_gr: data.page });
        case QtGiaiThuongGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtGiaiThuongGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtGiaiThuongUpdate:
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
T.initPage('pageQtGiaiThuong');
export function getQtGiaiThuongPage(pageNumber, pageSize, loaiDoiTuong, pageCondition, done) {
    const page = T.updatePage('pageQtGiaiThuong', pageNumber, pageSize, pageCondition);
    if (!loaiDoiTuong) loaiDoiTuong = [];
    if (!Array.isArray(loaiDoiTuong)) loaiDoiTuong = [loaiDoiTuong];
    return dispatch => {
        const url = `/api/tccb/qua-trinh/giai-thuong/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, parameter: loaiDoiTuong}, data => {
            if (data.error) {
                T.notify('Lấy danh sách bài viết khoa học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtGiaiThuongGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách bài viết khoa học bị lỗi!', 'danger'));
    };
}

T.initPage('groupPageQtGiaiThuong', true);
export function getQtGiaiThuongGroupPage(pageNumber, pageSize, loaiDoiTuong, pageCondition, done) {
    const page = T.updatePage('groupPageQtGiaiThuong', pageNumber, pageSize, pageCondition);
    if (!loaiDoiTuong) loaiDoiTuong = [];
    if (!Array.isArray(loaiDoiTuong)) loaiDoiTuong = [loaiDoiTuong];
    return dispatch => {
        const url = `/api/tccb/qua-trinh/giai-thuong/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, parameter: loaiDoiTuong}, data => {
            if (data.error) {
                T.notify('Lấy danh sách bài viết khoa học theo cán bộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtGiaiThuongGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

T.initPage('groupPageMaQtGiaiThuong', true);
export function getQtGiaiThuongGroupPageMa(pageNumber, pageSize, loaiDoiTuong, pageCondition, done) {
    const page = T.updatePage('groupPageMaQtGiaiThuong', pageNumber, pageSize, pageCondition);
    if (!loaiDoiTuong) loaiDoiTuong = '-1';
    return dispatch => {
        const url = `/api/tccb/qua-trinh/giai-thuong/group_gt/page/${loaiDoiTuong}/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách bài viết khoa học theo cán bộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtGiaiThuongGetPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}


export function updateQtGiaiThuongGroupPageMa(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/giai-thuong';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật bài viết khoa học bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật bài viết khoa học thành công!', 'success');
                done && done(data.item);
                dispatch(getQtGiaiThuongGroupPageMa(undefined, undefined, '-1', data.shcc));
            }
        }, () => T.notify('Cập nhật bài viết khoa học bị lỗi!', 'danger'));
    };
}

export function createQtGiaiThuongStaff(data, done, isEdit = null) {
    return dispatch => {
        const url = '/api/qua-trinh/giai-thuong';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình giải thưởng bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình giải thưởng thành công!', 'info');
                if (done) {
                    if (isEdit) {
                        done();
                        dispatch(getStaffEdit(data.shcc));
                    }
                    else {
                        done(data);
                        dispatch(getQtGiaiThuongPage());
                    }
                }    
            }
        }, () => T.notify('Thêm thông tin quá trình giải thưởng bị lỗi', 'danger'));
    };
}

export function updateQtGiaiThuongStaff(id, changes, done, isEdit = null) {
    return dispatch => {
        const url = '/api/qua-trinh/giai-thuong';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình giải thưởng bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình giải thưởng thành công!', 'info');
                isEdit ? (done && done()) : (done && done(data.item));
                isEdit ? dispatch(getStaffEdit(changes.shcc)) : dispatch(getQtGiaiThuongPage());   
            }
        }, () => T.notify('Cập nhật thông tin quá trình giải thưởng bị lỗi', 'danger'));
    };
}

export function deleteQtGiaiThuongStaff(id, done, isEdit = null) {
    return dispatch => {
        const url = '/api/qua-trinh/giai-thuong';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình giải thưởng bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình giải thưởng được xóa thành công!', 'info', false, 800);
                isEdit ? (done && done()) : (done && done(data.item));
                dispatch(getQtGiaiThuongPage());     
            }
        }, () => T.notify('Xóa thông tin quá trình giải thưởng bị lỗi', 'danger'));
    };
}

export function createQtGiaiThuongStaffUser(data, done) {
    return () => {
        const url = '/api/user/qua-trinh/giai-thuong';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình giải thưởng bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình giải thưởng thành công!', 'info');
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin quá trình giải thưởng bị lỗi', 'danger'));
    };
}

export function updateQtGiaiThuongStaffUser(id, changes, done) {
    return () => {
        const url = '/api/user/qua-trinh/giai-thuong';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình giải thưởng bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình giải thưởng thành công!', 'info');
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin quá trình giải thưởng bị lỗi', 'danger'));
    };
}

export function deleteQtGiaiThuongStaffUser(id, done) {
    return () => {
        const url = '/api/user/qua-trinh/giai-thuong';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình giải thưởng bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình giải thưởng được xóa thành công!', 'info', false, 800);
                done && done();
            }
        }, () => T.notify('Xóa thông tin quá trình giải thưởng bị lỗi', 'danger'));
    };
}