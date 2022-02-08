import T from 'view/js/common';
import { getStaffEdit, userGetStaff } from '../tccbCanBo/redux';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtBaoHiemXaHoiGetAll = 'QtBaoHiemXaHoi:GetAll';
const QtBaoHiemXaHoiGetPage = 'QtBaoHiemXaHoi:GetPage';
const QtBaoHiemXaHoiGetUserPage = 'QtBaoHiemXaHoi:GetUserPage';
const QtBaoHiemXaHoiGetGroupPage = 'QtBaoHiemXaHoi:GetGroupPage';
const QtBaoHiemXaHoiUpdate = 'QtBaoHiemXaHoi:Update';
const QtBaoHiemXaHoiGet = 'QtBaoHiemXaHoi:Get';

export default function QtBaoHiemXaHoiReducer(state = null, data) {
    switch (data.type) {
        case QtBaoHiemXaHoiGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtBaoHiemXaHoiGetGroupPage:
            return Object.assign({}, state, { page_gr: data.page });
        case QtBaoHiemXaHoiGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtBaoHiemXaHoiGetUserPage:
            return Object.assign({}, state, { user_page: data.page });
        case QtBaoHiemXaHoiGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtBaoHiemXaHoiUpdate:
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
T.initPage('userPageQtBaoHiemXaHoi');
export function getQtBaoHiemXaHoiUserPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('userPageQtBaoHiemXaHoi', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/user/qua-trinh/bao-hiem-xa-hoi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách bảo hiểm xã hội bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtBaoHiemXaHoiGetUserPage, user_page: data.page });
            }
        }, () => T.notify('Lấy danh sách bảo hiểm xã hội bị lỗi!', 'danger'));
    };
}

export function updateQtBaoHiemXaHoiUserPage(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/bao-hiem-xa-hoi';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật bảo hiểm xã hội bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật bảo hiểm xã hội thành công!', 'success');
                done && done(data.item);
                dispatch(getQtBaoHiemXaHoiUserPage());
            }
        }, () => T.notify('Cập nhật bảo hiểm xã hội bị lỗi!', 'danger'));
    };
}

export function createQtBaoHiemXaHoiUserPage(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/bao-hiem-xa-hoi';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo bảo hiểm xã hội bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo bảo hiểm xã hội thành công!', 'success');
                    dispatch(getQtBaoHiemXaHoiUserPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo bảo hiểm xã hội bị lỗi!', 'danger'));
    };
}
export function deleteQtBaoHiemXaHoiUserPage(id, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/bao-hiem-xa-hoi';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa bảo hiểm xã hội bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('bảo hiểm xã hội đã xóa thành công!', 'success', false, 800);
                done && done(data.item);
                dispatch(getQtBaoHiemXaHoiUserPage());
            }
        }, () => T.notify('Xóa bảo hiểm xã hội bị lỗi!', 'danger'));
    };
}

T.initPage('pageQtBaoHiemXaHoi');
export function getQtBaoHiemXaHoiPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtBaoHiemXaHoi', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/bao-hiem-xa-hoi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách bảo hiểm xã hội bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtBaoHiemXaHoiGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách bảo hiểm xã hội bị lỗi!', 'danger'));
    };
}

T.initPage('groupPageQtBaoHiemXaHoi', true);
export function getQtBaoHiemXaHoiGroupPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('groupPageQtBaoHiemXaHoi', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/bao-hiem-xa-hoi/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter}, data => {
            if (data.error) {
                T.notify('Lấy danh sách bảo hiểm xã hội bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtBaoHiemXaHoiGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function updateQtBaoHiemXaHoiGroupPageMa(id, changes, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/bao-hiem-xa-hoi';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật bảo hiểm xã hội bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật bảo hiểm xã hội thành công!', 'success');
                done && done(data.item);
                dispatch(getQtBaoHiemXaHoiPage());
            }
        }, () => T.notify('Cập nhật bảo hiểm xã hội bị lỗi!', 'danger'));
    };
}

export function createQtBaoHiemXaHoiGroupPageMa(data, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/bao-hiem-xa-hoi';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo bảo hiểm xã hội bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo bảo hiểm xã hội thành công!', 'success');
                    dispatch(getQtBaoHiemXaHoiPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo bảo hiểm xã hội bị lỗi!', 'danger'));
    };
}
export function deleteQtBaoHiemXaHoiGroupPageMa(id, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/bao-hiem-xa-hoi';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa bảo hiểm xã hội bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('bảo hiểm xã hội đã xóa thành công!', 'success', false, 800);
                done && done(data.item);
                dispatch(getQtBaoHiemXaHoiPage());
            }
        }, () => T.notify('Xóa bảo hiểm xã hội bị lỗi!', 'danger'));
    };
}
export function createQtBaoHiemXaHoiStaff(data, done, isEdit = null) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/bao-hiem-xa-hoi';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin bảo hiểm xã hội bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin bảo hiểm xã hội thành công!', 'info');
                if (done) {
                    if (isEdit) {
                        done();
                        dispatch(getStaffEdit(data.shcc));
                    }
                    else {
                        done(data);
                        dispatch(getQtBaoHiemXaHoiPage());
                    }
                }
            }
        }, () => T.notify('Thêm thông tin bảo hiểm xã hội bị lỗi', 'danger'));
    };
}

export function updateQtBaoHiemXaHoiStaff(id, changes, done, isEdit = null) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/bao-hiem-xa-hoi';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin bảo hiểm xã hội bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin bảo hiểm xã hội thành công!', 'info');
                isEdit ? (done && done()) : (done && done(data.item));
                isEdit ? dispatch(getStaffEdit(changes.shcc)) : dispatch(getQtBaoHiemXaHoiPage());
            }
        }, () => T.notify('Cập nhật thông tin bảo hiểm xã hội bị lỗi', 'danger'));
    };
}

export function deleteQtBaoHiemXaHoiStaff(id, isEdit, shcc = null) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/bao-hiem-xa-hoi';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin bảo hiểm xã hội bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin bảo hiểm xã hội được xóa thành công!', 'info', false, 800);
                isEdit ? dispatch(getStaffEdit(shcc)) : dispatch(getQtBaoHiemXaHoiPage());
            }
        }, () => T.notify('Xóa thông tin bảo hiểm xã hội bị lỗi', 'danger'));
    };
}

export function createQtBaoHiemXaHoiStaffUser(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/bao-hiem-xa-hoi';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin bảo hiểm xã hội bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin bảo hiểm xã hội thành công!', 'info');
                if (done) done(res);
                dispatch(userGetStaff(data.email));
            }
        }, () => T.notify('Thêm thông tin bảo hiểm xã hội bị lỗi', 'danger'));
    };
}

export function updateQtBaoHiemXaHoiStaffUser(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/bao-hiem-xa-hoi';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin bảo hiểm xã hội bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin bảo hiểm xã hội thành công!', 'info');
                if (done) done();
                dispatch(userGetStaff(changes.email));
            }
        }, () => T.notify('Cập nhật thông tin bảo hiểm xã hội bị lỗi', 'danger'));
    };
}

export function deleteQtBaoHiemXaHoiStaffUser(id, email, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/bao-hiem-xa-hoi';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin bảo hiểm xã hội bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin bảo hiểm xã hội được xóa thành công!', 'info', false, 800);
                done && done();
                dispatch(userGetStaff(email));
            }
        }, () => T.notify('Xóa thông tin bảo hiểm xã hội bị lỗi', 'danger'));
    };
}