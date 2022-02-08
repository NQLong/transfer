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
const QtHuongDanLuanVanGetUserPage = 'QtHuongDanLuanVan:GetUserPage';
const QtHuongDanLuanVanGetGroupPage = 'QtHuongDanLuanVan:GetGroupPage';
const QtHuongDanLuanVanUpdate = 'QtHuongDanLuanVan:Update';
const QtHuongDanLuanVanGet = 'QtHuongDanLuanVan:Get';

export default function QtHuongDanLuanVanReducer(state = null, data) {
    switch (data.type) {
        case QtHuongDanLuanVanGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtHuongDanLuanVanGetGroupPage:
            return Object.assign({}, state, { page_gr: data.page });
        case QtHuongDanLuanVanGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtHuongDanLuanVanGetUserPage:
            return Object.assign({}, state, { user_page: data.page });
        case QtHuongDanLuanVanGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtHuongDanLuanVanUpdate:
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
T.initPage('pageQtHuongDanLuanVan');
export function getQtHuongDanLuanVanPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtHuongDanLuanVan', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/qua-trinh/hdlv/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hướng dẫn luận văn bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtHuongDanLuanVanGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách hướng dẫn luận văn bị lỗi!', 'danger'));
    };
}

T.initPage('groupPageQtHuongDanLuanVan', true);
export function getQtHuongDanLuanVanGroupPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('groupPageQtHuongDanLuanVan', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/qua-trinh/hdlv/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter}, data => {
            if (data.error) {
                T.notify('Lấy danh sách hướng dẫn luận văn bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtHuongDanLuanVanGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

T.initPage('userPageQtHuongDanLuanVan');
export function getQtHuongDanLuanVanUserPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('userPageQtHuongDanLuanVan', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/user/qua-trinh/hdlv/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hướng dẫn luận văn bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtHuongDanLuanVanGetUserPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách hướng dẫn luận văn bị lỗi!', 'danger'));
    };
}

export function updateQtHuongDanLuanVanUserPage(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/hdlv';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật hướng dẫn luận văn bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật hướng dẫn luận văn thành công!', 'success');
                done && done(data.item);
                dispatch(getQtHuongDanLuanVanUserPage());
            }
        }, () => T.notify('Cập nhật hướng dẫn luận văn bị lỗi!', 'danger'));
    };
}

export function createQtHuongDanLuanVanUserPage(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/hdlv';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo hướng dẫn luận văn bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo hướng dẫn luận văn thành công!', 'success');
                    dispatch(getQtHuongDanLuanVanUserPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo hướng dẫn luận văn bị lỗi!', 'danger'));
    };
}
export function deleteQtHuongDanLuanVanUserPage(id, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/hdlv';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa hướng dẫn luận văn bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('hướng dẫn luận văn đã xóa thành công!', 'success', false, 800);
                done && done(data.item);
                dispatch(getQtHuongDanLuanVanUserPage());
            }
        }, () => T.notify('Xóa hướng dẫn luận văn bị lỗi!', 'danger'));
    };
}

export function createQtHuongDanLuanVanStaff(data, done, isEdit = null) {
    return dispatch => {
        const url = '/api/qua-trinh/hdlv';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo hướng dẫn luận văn bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo hướng dẫn luận văn thành công!', 'success');
                    if (isEdit) {
                        done();
                        dispatch(getStaffEdit(data.shcc));
                    }
                    else {
                        done(data);
                        dispatch(getQtHuongDanLuanVanPage());
                    }
                }
            }
        }, () => T.notify('Tạo hướng dẫn luận văn bị lỗi!', 'danger'));
    };
}

export function deleteQtHuongDanLuanVanStaff(id, shcc, idEdit = null) {
    return dispatch => {
        const url = '/api/qua-trinh/hdlv';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa hướng dẫn luận văn bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('hướng dẫn luận văn đã xóa thành công!', 'success', false, 800);
                idEdit ? dispatch(getStaffEdit(shcc)) : dispatch(getQtHuongDanLuanVanPage());
            }
        }, () => T.notify('Xóa hướng dẫn luận văn bị lỗi!', 'danger'));
    };
}

export function updateQtHuongDanLuanVanStaff(id, changes, done, isEdit = null) {
    return dispatch => {
        const url = '/api/qua-trinh/hdlv';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật hướng dẫn luận văn bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật hướng dẫn luận văn thành công!', 'success');
                isEdit ? (done && done()) : (done && done(data.item));
                isEdit ? dispatch(getStaffEdit(changes.shcc)) : dispatch(getQtHuongDanLuanVanPage());
            }
        }, () => T.notify('Cập nhật hướng dẫn luận văn bị lỗi!', 'danger'));
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
                dispatch(getQtHuongDanLuanVanPage());
            }
        }, () => T.notify('Cập nhật hướng dẫn luận văn bị lỗi!', 'danger'));
    };
}

export function createQtHuongDanLuanVanGroupPageMa(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/hdlv';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo hướng dẫn luận văn bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo hướng dẫn luận văn thành công!', 'success');
                    dispatch(getQtHuongDanLuanVanPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo hướng dẫn luận văn bị lỗi!', 'danger'));
    };
}
export function deleteQtHuongDanLuanVanGroupPageMa(id, done) {
    return dispatch => {
        const url = '/api/qua-trinh/hdlv';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa hướng dẫn luận văn bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('hướng dẫn luận văn đã xóa thành công!', 'success', false, 800);
                done && done(data.item);
                dispatch(getQtHuongDanLuanVanPage());
            }
        }, () => T.notify('Xóa hướng dẫn luận văn bị lỗi!', 'danger'));
    };
}