import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtHoTroHocPhiGetAll = 'QtHoTroHocPhi:GetAll';
const QtHoTroHocPhiGetPage = 'QtHoTroHocPhi:GetPage';
const QtHoTroHocPhiGetUserPage = 'QtHoTroHocPhi:GetUserPage';
const QtHoTroHocPhiGetGroupPage = 'QtHoTroHocPhi:GetGroupPage';
const QtHoTroHocPhiGetGroupPageMa = 'QtHoTroHocPhi:GetGroupPageMa';
const QtHoTroHocPhiUpdate = 'QtHoTroHocPhi:Update';
const QtHoTroHocPhiGet = 'QtHoTroHocPhi:Get';

export default function QtHoTroHocPhiReducer(state = null, data) {
    switch (data.type) {
        case QtHoTroHocPhiGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtHoTroHocPhiGetGroupPage:
            return Object.assign({}, state, { page_gr: data.page });
        case QtHoTroHocPhiGetGroupPageMa:
            return Object.assign({}, state, { page_ma: data.page });
        case QtHoTroHocPhiGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtHoTroHocPhiGetUserPage:
            return Object.assign({}, state, { user_page: data.page });
        case QtHoTroHocPhiGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtHoTroHocPhiUpdate:
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
T.initPage('userPageQtHoTroHocPhi');
export function getQtHoTroHocPhiUserPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('userPageQtHoTroHocPhi', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/user/qua-trinh/ho-tro-hoc-phi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hỗ trợ học phí bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtHoTroHocPhiGetUserPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách hỗ trợ học phí bị lỗi!', 'danger'));
    };
}

export function updateQtHoTroHocPhiUserPage(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/ho-tro-hoc-phi';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật hỗ trợ học phí bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật hỗ trợ học phí thành công!', 'success');
                done && done(data.item);
                dispatch(getQtHoTroHocPhiUserPage());
            }
        }, () => T.notify('Cập nhật hỗ trợ học phí bị lỗi!', 'danger'));
    };
}

export function createQtHoTroHocPhiUserPage(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/ho-tro-hoc-phi';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo hỗ trợ học phí bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo hỗ trợ học phí thành công!', 'success');
                    dispatch(getQtHoTroHocPhiUserPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo hỗ trợ học phí bị lỗi!', 'danger'));
    };
}
export function deleteQtHoTroHocPhiUserPage(id, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/ho-tro-hoc-phi';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa hỗ trợ học phí bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa thành công!', 'success', false, 800);
                done && done(data.item);
                dispatch(getQtHoTroHocPhiUserPage());
            }
        }, () => T.notify('Xóa hỗ trợ học phí bị lỗi!', 'danger'));
    };
}

T.initPage('pageQtHoTroHocPhi');
export function getQtHoTroHocPhiPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtHoTroHocPhi', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/ho-tro-hoc-phi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hỗ trợ học phí bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtHoTroHocPhiGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách hỗ trợ học phí bị lỗi!', 'danger'));
    };
}

export function createQtHoTroHocPhi(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/ho-tro-hoc-phi';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình hỗ trợ học phí bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                if (done) {
                    T.notify('Thêm thông tin quá trình hỗ trợ học phí thành công!', 'info');
                    dispatch(getQtHoTroHocPhiPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Thêm thông tin quá trình hỗ trợ học phí bị lỗi', 'danger'));
    };
}

export function updateQtHoTroHocPhi(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/ho-tro-hoc-phi';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình hỗ trợ học phí bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình hỗ trợ học phí thành công!', 'info');
                done && done(data.item);
                dispatch(getQtHoTroHocPhiPage());
            }
        }, () => T.notify('Cập nhật thông tin quá trình hỗ trợ học phí bị lỗi', 'danger'));
    };
}

export function deleteQtHoTroHocPhi(id, done) {
    return dispatch => {
        const url = '/api/qua-trinh/ho-tro-hoc-phi';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình hỗ trợ học phí bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình hỗ trợ học phí được xóa thành công!', 'info', false, 800);
                dispatch(getQtHoTroHocPhiPage());
                done && done(data.item);
            }
        }, () => T.notify('Xóa thông tin quá trình hỗ trợ học phí bị lỗi', 'danger'));
    };
}

export function getQtHoTroHocPhiGroupPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtHoTroHocPhi', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/ho-tro-hoc-phi/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hỗ trợ học phí bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtHoTroHocPhiGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

T.initPage('groupPageMaQtHoTroHocPhi');
export function getQtHoTroHocPhiGroupPageMa(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('groupPageMaQtHoTroHocPhi', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/ho-tro-hoc-phi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hỗ trợ học phí bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtHoTroHocPhiGetGroupPageMa, page: data.page });
            }
        }, () => T.notify('Lấy danh sách hỗ trợ học phí bị lỗi!', 'danger'));
    };
}

export function updateQtHoTroHocPhiGroupPageMa(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/ho-tro-hoc-phi';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình hỗ trợ học phí bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình hỗ trợ học phí thành công!', 'info');
                done && done(data.item);
                dispatch(getQtHoTroHocPhiGroupPageMa());
            }
        }, () => T.notify('Cập nhật thông tin quá trình hỗ trợ học phí bị lỗi', 'danger'));
    };
}

export function deleteQtHoTroHocPhiGroupPageMa(id, done) {
    return dispatch => {
        const url = '/api/qua-trinh/ho-tro-hoc-phi';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình hỗ trợ học phí bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình hỗ trợ học phí được xóa thành công!', 'info', false, 800);
                done && done(data.item);
                dispatch(getQtHoTroHocPhiGroupPageMa());
            }
        }, () => T.notify('Xóa thông tin quá trình hỗ trợ học phí bị lỗi', 'danger'));
    };
}

export function createQtHoTroHocPhiGroupPageMa(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/ho-tro-hoc-phi';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo hỗ trợ học phí bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo hỗ trợ học phí thành công!', 'success');
                    dispatch(getQtHoTroHocPhiGroupPageMa());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo hỗ trợ học phí bị lỗi!', 'danger'));
    };
}