import T from 'view/js/common';
import { getStaffEdit, userGetStaff } from '../tccbCanBo/redux';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtKeoDaiCongTacGetAll = 'QtKeoDaiCongTac:GetAll';
const QtKeoDaiCongTacGetPage = 'QtKeoDaiCongTac:GetPage';
const QtKeoDaiCongTacGetGroupPage = 'QtKeoDaiCongTac:GetGroupPage';
const QtKeoDaiCongTacUpdate = 'QtKeoDaiCongTac:Update';
const QtKeoDaiCongTacGet = 'QtKeoDaiCongTac:Get';

export default function QtKeoDaiCongTacReducer(state = null, data) {
    switch (data.type) {
        case QtKeoDaiCongTacGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtKeoDaiCongTacGetGroupPage:
            return Object.assign({}, state, { page_gr: data.page });
        case QtKeoDaiCongTacGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtKeoDaiCongTacGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtKeoDaiCongTacUpdate:
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
T.initPage('pageQtKeoDaiCongTac');
export function getQtKeoDaiCongTacUserPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtKeoDaiCongTac', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/user/qua-trinh/keo-dai-cong-tac/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách kéo dài công tác bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtKeoDaiCongTacGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách kéo dài công tác bị lỗi!', 'danger'));
    };
}

export function updateQtKeoDaiCongTacUserPage(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/keo-dai-cong-tac';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật kéo dài công tác bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật kéo dài công tác thành công!', 'success');
                done && done(data.item);
                dispatch(getQtKeoDaiCongTacUserPage());
            }
        }, () => T.notify('Cập nhật kéo dài công tác bị lỗi!', 'danger'));
    };
}

export function createQtKeoDaiCongTacUserPage(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/keo-dai-cong-tac';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo kéo dài công tác bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo kéo dài công tác thành công!', 'success');
                    dispatch(getQtKeoDaiCongTacUserPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo kéo dài công tác bị lỗi!', 'danger'));
    };
}
export function deleteQtKeoDaiCongTacUserPage(id, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/keo-dai-cong-tac';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa kéo dài công tác bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('kéo dài công tác đã xóa thành công!', 'success', false, 800);
                done && done(data.item);
                dispatch(getQtKeoDaiCongTacUserPage());
            }
        }, () => T.notify('Xóa kéo dài công tác bị lỗi!', 'danger'));
    };
}

T.initPage('pageQtKeoDaiCongTac');
export function getQtKeoDaiCongTacPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtKeoDaiCongTac', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/keo-dai-cong-tac/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách kéo dài công tác bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtKeoDaiCongTacGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách kéo dài công tác bị lỗi!', 'danger'));
    };
}

T.initPage('groupPageQtKeoDaiCongTac', true);
export function getQtKeoDaiCongTacGroupPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('groupPageQtKeoDaiCongTac', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/keo-dai-cong-tac/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter}, data => {
            if (data.error) {
                T.notify('Lấy danh sách kéo dài công tác bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtKeoDaiCongTacGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function updateQtKeoDaiCongTacGroupPageMa(id, changes, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/keo-dai-cong-tac';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật kéo dài công tác bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật kéo dài công tác thành công!', 'success');
                done && done(data.item);
                dispatch(getQtKeoDaiCongTacPage());
            }
        }, () => T.notify('Cập nhật kéo dài công tác bị lỗi!', 'danger'));
    };
}

export function createQtKeoDaiCongTacGroupPageMa(data, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/keo-dai-cong-tac';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo kéo dài công tác bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo kéo dài công tác thành công!', 'success');
                    dispatch(getQtKeoDaiCongTacPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo kéo dài công tác bị lỗi!', 'danger'));
    };
}
export function deleteQtKeoDaiCongTacGroupPageMa(id, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/keo-dai-cong-tac';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa kéo dài công tác bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('kéo dài công tác đã xóa thành công!', 'success', false, 800);
                done && done(data.item);
                dispatch(getQtKeoDaiCongTacPage());
            }
        }, () => T.notify('Xóa kéo dài công tác bị lỗi!', 'danger'));
    };
}
export function createQtKeoDaiCongTacStaff(data, done, isEdit = null) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/keo-dai-cong-tac';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin kéo dài công tác bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin kéo dài công tác thành công!', 'info');
                if (done) {
                    if (isEdit) {
                        done();
                        dispatch(getStaffEdit(data.shcc));
                    }
                    else {
                        done(data);
                        dispatch(getQtKeoDaiCongTacPage());
                    }
                }
            }
        }, () => T.notify('Thêm thông tin kéo dài công tác bị lỗi', 'danger'));
    };
}

export function updateQtKeoDaiCongTacStaff(id, changes, done, isEdit = null) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/keo-dai-cong-tac';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin kéo dài công tác bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin kéo dài công tác thành công!', 'info');
                isEdit ? (done && done()) : (done && done(data.item));
                isEdit ? dispatch(getStaffEdit(changes.shcc)) : dispatch(getQtKeoDaiCongTacPage());
            }
        }, () => T.notify('Cập nhật thông tin kéo dài công tác bị lỗi', 'danger'));
    };
}

export function deleteQtKeoDaiCongTacStaff(id, isEdit, shcc = null) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/keo-dai-cong-tac';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin kéo dài công tác bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin kéo dài công tác được xóa thành công!', 'info');
                isEdit ? dispatch(getStaffEdit(shcc)) : dispatch(getQtKeoDaiCongTacPage());
            }
        }, () => T.notify('Xóa thông tin kéo dài công tác bị lỗi', 'danger'));
    };
}

export function createQtKeoDaiCongTacStaffUser(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/keo-dai-cong-tac';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin kéo dài công tác bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin kéo dài công tác thành công!', 'info');
                if (done) done(res);
                dispatch(userGetStaff(data.email));
            }
        }, () => T.notify('Thêm thông tin kéo dài công tác bị lỗi', 'danger'));
    };
}

export function updateQtKeoDaiCongTacStaffUser(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/keo-dai-cong-tac';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin kéo dài công tác bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin kéo dài công tác thành công!', 'info');
                if (done) done();
                dispatch(userGetStaff(changes.email));
            }
        }, () => T.notify('Cập nhật thông tin kéo dài công tác bị lỗi', 'danger'));
    };
}

export function deleteQtKeoDaiCongTacStaffUser(id, email, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/keo-dai-cong-tac';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin kéo dài công tác bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin kéo dài công tác được xóa thành công!', 'info', false, 800);
                done && done();
                dispatch(userGetStaff(email));
            }
        }, () => T.notify('Xóa thông tin kéo dài công tác bị lỗi', 'danger'));
    };
}