import T from 'view/js/common';

import { userGetStaff } from '../../mdTccb/tccbCanBo/redux';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtSangKienGetAll = 'QtSangKien:GetAll';
const QtSangKienGetPage = 'QtSangKien:GetPage';
const QtSangKienGetUserPage = 'QtSangKien:GetUserPage';
const QtSangKienGetGroupPage = 'QtSangKien:GetGroupPage';
const QtSangKienGetGroupPageMa = 'QtSangKien:GetGroupPageMa';
const QtSangKienUpdate = 'QtSangKien:Update';
const QtSangKienGet = 'QtSangKien:Get';

export default function QtSangKienReducer(state = null, data) {
    switch (data.type) {
        case QtSangKienGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtSangKienGetGroupPage:
            return Object.assign({}, state, { page_gr: data.page });
        case QtSangKienGetGroupPageMa:
            return Object.assign({}, state, { page_ma: data.page });
        case QtSangKienGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtSangKienGetUserPage:
            return Object.assign({}, state, { user_page: data.page });
        case QtSangKienGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtSangKienUpdate:
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
T.initPage('userPageQtSangKien');
export function getQtSangKienUserPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('userPageQtSangKien', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/user/qua-trinh/sang-kien/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sáng kiến bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtSangKienGetUserPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách sáng kiến bị lỗi!', 'danger'));
    };
}

export function updateQtSangKienUserPage(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/sang-kien';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật sáng kiến bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật sáng kiến thành công!', 'success');
                done && done(data.item);
                dispatch(getQtSangKienUserPage());
            }
        }, () => T.notify('Cập nhật sáng kiến bị lỗi!', 'danger'));
    };
}

export function createQtSangKienUserPage(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/sang-kien';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo sáng kiến bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo sáng kiến thành công!', 'success');
                    dispatch(getQtSangKienUserPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo sáng kiến bị lỗi!', 'danger'));
    };
}

export function deleteQtSangKienUserPage(id, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/sang-kien';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa sáng kiến bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa thành công!', 'success', false, 800);
                done && done(data.item);
                dispatch(getQtSangKienUserPage());
            }
        }, () => T.notify('Xóa sáng kiến bị lỗi!', 'danger'));
    };
}

T.initPage('pageQtSangKien');
export function getQtSangKienPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtSangKien', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/sang-kien/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sáng kiến bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtSangKienGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách sáng kiến bị lỗi!', 'danger'));
    };
}

export function getQtSangKienGroupPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtSangKien', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/sang-kien/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sáng kiến bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtSangKienGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

T.initPage('groupPageMaQtSangKien');
export function getQtSangKienGroupPageMa(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('groupPageMaQtSangKien', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/sang-kien/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sáng kiến bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtSangKienGetGroupPageMa, page: data.page });
            }
        }, () => T.notify('Lấy danh sách sáng kiến bị lỗi!', 'danger'));
    };
}

export function updateQtSangKienGroupPageMa(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/sang-kien';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình sáng kiến bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình sáng kiến thành công!', 'info');
                done && done(data.item);
                dispatch(getQtSangKienGroupPageMa());
            }
        }, () => T.notify('Cập nhật thông tin quá trình sáng kiến bị lỗi', 'danger'));
    };
}

export function deleteQtSangKienGroupPageMa(id, done) {
    return dispatch => {
        const url = '/api/qua-trinh/sang-kien';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình sáng kiến bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình sáng kiến được xóa thành công!', 'info', false, 800);
                done && done(data.item);
                dispatch(getQtSangKienGroupPageMa());
            }
        }, () => T.notify('Xóa thông tin quá trình sáng kiến bị lỗi', 'danger'));
    };
}

export function createQtSangKienGroupPageMa(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/sang-kien';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo sáng kiến bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo sáng kiến thành công!', 'success');
                    dispatch(getQtSangKienGroupPageMa());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo sáng kiến bị lỗi!', 'danger'));
    };
}

export function getQtSangKienAll(done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/sang-kien/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách sáng kiến bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: QtSangKienGetAll, items: data.items ? data.items : {} });
            }
        }, () => T.notify('Lấy danh sách sáng kiến bị lỗi!', 'danger'));
    };
}

export function getQtSangKien(id, done) {
    return () => {
        const url = `/api/tccb/qua-trinh/sang-kien/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy sáng kiến bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createQtSangKienStaff(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/sang-kien';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình sáng kiến bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình sáng kiến thành công!', 'info');
                dispatch(getQtSangKienPage());
                done && done(data);
            }
        }, () => T.notify('Thêm thông tin quá trình sáng kiến bị lỗi', 'danger'));
    };
}

export function updateQtSangKienStaff(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/sang-kien';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình sáng kiến bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình sáng kiến thành công!', 'info');
                done && done(data.item);
                dispatch(getQtSangKienPage());
            }
        }, () => T.notify('Cập nhật thông tin quá trình sáng kiến bị lỗi', 'danger'));
    };
}

export function deleteQtSangKienStaff(id, done) {
    return dispatch => {
        const url = '/api/qua-trinh/sang-kien';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình sáng kiến bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình sáng kiến được xóa thành công!', 'info', false, 800);
                dispatch(getQtSangKienPage());
                done && done(data.item);
            }
        }, () => T.notify('Xóa thông tin quá trình sáng kiến bị lỗi', 'danger'));
    };
}

export function createQtSangKienStaffUser(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/sang-kien';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình sáng kiến bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình sáng kiến thành công!', 'info');
                if (done) done(data);
                dispatch(userGetStaff(data.email));
            }
        }, () => T.notify('Thêm thông tin quá trình sáng kiến bị lỗi', 'danger'));
    };
}

export function updateQtSangKienStaffUser(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/sang-kien';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình sáng kiến bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình sáng kiến thành công!', 'info');
                if (done) done();
                dispatch(userGetStaff(changes.email));
            }
        }, () => T.notify('Cập nhật thông tin quá trình sáng kiến bị lỗi', 'danger'));
    };
}

export function deleteQtSangKienStaffUser(id, email, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/sang-kien';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình sáng kiến bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình sáng kiến được xóa thành công!', 'info', false, 800);
                done && done();
                dispatch(userGetStaff(email));
            }
        }, () => T.notify('Xóa thông tin quá trình sáng kiến bị lỗi', 'danger'));
    };
}