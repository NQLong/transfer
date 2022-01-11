import T from 'view/js/common';
import { getStaffEdit, userGetStaff } from '../tccbCanBo/redux';

export function createQtHuongDanLVStaff(data, done, isEdit = null) {
    return dispatch => {
        const url = '/api/qua-trinh/hdlv';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình hướng dẫn luận văn thành công!', 'info');
                isEdit ? (done && done()) : (done && done(res));
                isEdit && dispatch(getStaffEdit(data.shcc));
            }
        }, () => T.notify('Thêm thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger'));
    };
}

export function updateQtHuongDanLVStaff(id, changes, done, isEdit = null) {
    return dispatch => {
        const url = '/api/qua-trinh/hdlv';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình hướng dẫn luận văn thành công!', 'info');
                isEdit ? (done && done()) : (done && done(data.item));
                isEdit && dispatch(getStaffEdit(changes.shcc));
            }
        }, () => T.notify('Cập nhật thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger'));
    };
}

export function deleteQtHuongDanLVStaff(id, isEdit, shcc = null) {
    return dispatch => {
        const url = '/api/qua-trinh/hdlv';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình hướng dẫn luận văn được xóa thành công!', 'info', false, 800);
                isEdit && dispatch(getStaffEdit(shcc));
            }
        }, () => T.notify('Xóa thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger'));
    };
}

export function createQtHuongDanLVStaffUser(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/hdlv';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình hướng dẫn luận văn thành công!', 'info');
                if (done) done(res);
                dispatch(userGetStaff(data.email));
            }
        }, () => T.notify('Thêm thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger'));
    };
}

export function updateQtHuongDanLVStaffUser(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/hdlv';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình hướng dẫn luận văn thành công!', 'info');
                if (done) done();
                dispatch(userGetStaff(changes.email));
            }
        }, () => T.notify('Cập nhật thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger'));
    };
}

export function deleteQtHuongDanLVStaffUser(id, email, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/hdlv';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình hướng dẫn luận văn được xóa thành công!', 'info', false, 800);
                done && done();
                dispatch(userGetStaff(email));
            }
        }, () => T.notify('Xóa thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger'));
    };
}

// Reducer ------------------------------------------------------------------------------------------------------------
const QtHuongDanLuanVanGetAll = 'QtHuongDanLuanVan:GetAll';
const QtHuongDanLuanVanGetPage = 'QtHuongDanLuanVan:GetPage';
const QtHuongDanLuanVanUpdate = 'QtHuongDanLuanVan:Update';
const QtHuongDanLuanVanGet = 'QtHuongDanLuanVan:Get';
const QtHuongDanLuanVanGetGroupPage = 'QtHuongDanLuanVan:GetGroupPage';

export default function QtHuongDanLuanVanReducer(state = null, data) {
    switch (data.type) {
        case QtHuongDanLuanVanGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtHuongDanLuanVanGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtHuongDanLuanVanGetGroupPage:
            return Object.assign({}, state, { page_gr: data.page });
        case QtHuongDanLuanVanGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtHuongDanLuanVanUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].stt == updatedItem.stt) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].stt == updatedItem.stt) {
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
T.initPage('pageQtHuongDanLuanVan');
export function getQtHuongDanLuanVanPage(pageNumber, pageSize, loaiDoiTuong, pageCondition, done) {
    const page = T.updatePage('pageQtHuongDanLuanVan', pageNumber, pageSize, pageCondition);
    if (!loaiDoiTuong) loaiDoiTuong = [];
    if (!Array.isArray(loaiDoiTuong)) loaiDoiTuong = [loaiDoiTuong];
    return dispatch => {
        const url = `/api/qua-trinh/hdlv/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, parameter: loaiDoiTuong}, data => {
            if (data.error) {
                T.notify('Lấy danh sách hướng dẫn luận văn bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtHuongDanLuanVanGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách hướng dẫn luận văn bị lỗi!', 'danger'));
    };
}

T.initPage('groupPageQtHuongDanLuanVan', true);
export function getQtHuongDanLuanVanGroupPage(pageNumber, pageSize, loaiDoiTuong, pageCondition, done) {
    const page = T.updatePage('groupPageQtHuongDanLuanVan', pageNumber, pageSize, pageCondition);
    if (!loaiDoiTuong) loaiDoiTuong = [];
    if (!Array.isArray(loaiDoiTuong)) loaiDoiTuong = [loaiDoiTuong];
    return dispatch => {
        const url = `/api/qua-trinh/hdlv/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, parameter: loaiDoiTuong}, data => {
            if (data.error) {
                T.notify('Lấy danh sách hướng dẫn luận văn theo cán bộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtHuongDanLuanVanGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

T.initPage('groupPageMaQtHuongDanLuanVan', true);
export function getQtHuongDanLuanVanGroupPageMa(pageNumber, pageSize, loaiDoiTuong, pageCondition, done) {
    const page = T.updatePage('groupPageMaQtHuongDanLuanVan', pageNumber, pageSize, pageCondition);
    if (!loaiDoiTuong) loaiDoiTuong = '-1';
    return dispatch => {
        const url = `/api/qua-trinh/hdlv/group/page/${loaiDoiTuong}/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hướng dẫn luận văn theo cán bộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtHuongDanLuanVanGetPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}


export function updateQtHuongDanLuanVanGroupPageMa(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/hdlv';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật hướng dẫn luận văn bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật hướng dẫn luận văn thành công!', 'success');
                done && done(data.item);
                dispatch(getQtHuongDanLuanVanGroupPageMa(undefined, undefined, '-1', data.shcc));
            }
        }, () => T.notify('Cập nhật hướng dẫn luận văn bị lỗi!', 'danger'));
    };
}

export function deleteQtHuongDanLuanVanGroupPageMa(id, shcc, done) {
    return dispatch => {
        const url = '/api/qua-trinh/hdlv';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình hướng dẫn luận văn được xóa thành công!', 'info', false, 800);
                done && done(data.item);
                dispatch(getQtHuongDanLuanVanGroupPageMa(undefined, undefined, '-1', shcc));
            }
        }, () => T.notify('Xóa thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger'));
    };
}
export function getQtHuongDanLuanVanAll(done) {
    return dispatch => {
        const url = '/api/qua-trinh/hdlv/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách quá trình hướng dẫn luận văn bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: QtHuongDanLuanVanGetAll, items: data.items ? data.items : {} });
            }
        }, () => T.notify('Lấy danh sách quá trình hướng dẫn luận văn bị lỗi!', 'danger'));
    };
}

export function getQtHuongDanLuanVan(id, done) {
    return () => {
        const url = `/api/qua-trinh/hdlv/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy quá trình hướng dẫn luận văn bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createQtHuongDanLuanVan(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/hdlv';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình hướng dẫn luận văn thành công!', 'info');
                done(data);
                dispatch(getQtHuongDanLuanVanPage());        
            }
        }, () => T.notify('Thêm thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger'));
    };
}

export function updateQtHuongDanLuanVan(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/hdlv';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình hướng dẫn luận văn thành công!', 'info');
                done(data.item);
                dispatch(getQtHuongDanLuanVanPage());          
            }
        }, () => T.notify('Cập nhật thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger'));
    };
}

export function deleteQtHuongDanLuanVan(id, done) {
    return dispatch => {
        const url = '/api/qua-trinh/hdlv';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình hướng dẫn luận văn được xóa thành công!', 'info', false, 800);
                done(data.item);
                dispatch(getQtHuongDanLuanVanPage());      
            }
        }, () => T.notify('Xóa thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger'));
    };
}

export function createQtHuongDanLuanVanStaffUser(data, done) {
    return () => {
        const url = '/api/user/qua-trinh/hdlv';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình hướng dẫn luận văn thành công!', 'info');
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger'));
    };
}

export function updateQtHuongDanLuanVanStaffUser(id, changes, done) {
    return () => {
        const url = '/api/user/qua-trinh/hdlv';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình hướng dẫn luận văn thành công!', 'info');
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger'));
    };
}

export function deleteQtHuongDanLuanVanStaffUser(id, done) {
    return () => {
        const url = '/api/user/qua-trinh/hdlv';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình hướng dẫn luận văn được xóa thành công!', 'info', false, 800);
                done && done();
            }
        }, () => T.notify('Xóa thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger'));
    };
}