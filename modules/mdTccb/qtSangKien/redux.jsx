import T from 'view/js/common';

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
            return Object.assign({}, state, { pageGr: data.page });
        case QtSangKienGetGroupPageMa:
            return Object.assign({}, state, { pageMa: data.page });
        case QtSangKienGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtSangKienGetUserPage:
            return Object.assign({}, state, { userPage: data.page });
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

// End Actions---------------------------------------------------------------------------------------------------------

// TCCB Actions--------------------------------------------------------------------------------------------------------
// Admin Page
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
                dispatch({ type: QtSangKienGetPage, page: data.page });
                if (done) done(data.page);
            }
        }, () => T.notify('Lấy danh sách sáng kiến bị lỗi!', 'danger'));
    };
}

export function createQtSangKienStaff(data, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/sang-kien';
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
        const url = '/api/tccb/qua-trinh/sang-kien';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình sáng kiến bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình sáng kiến thành công!', 'info');
                dispatch(getQtSangKienPage());
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật thông tin quá trình sáng kiến bị lỗi', 'danger'));
    };
}

export function deleteQtSangKienStaff(id, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/sang-kien';
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

// GroupPage
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
                dispatch({ type: QtSangKienGetGroupPage, page: data.page });
                done && done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

// Import Page
export function createMultiQtSangKien(qtSangKien, done) {
    return () => {
        const url = '/api/tccb/qua-trinh/sang-kien/multiple';
        T.post(url, { qtSangKien }, data => {
            if (data.error && data.error.length) {
                T.notify('Cập nhật dữ liệu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error('PUT: ' + url + '. ' + data.error.toString());
            } else {
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật dữ liệu bị lỗi!', 'danger'));
    };
}

// End TCCB Actions -------------------------------------------------------------------------------------------------------------

// User Actions -----------------------------------------------------------------------------------------------------------------
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
                dispatch({ type: QtSangKienGetUserPage, page: data.page });
                if (done) done(data.page);
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
                dispatch(getQtSangKienUserPage());
                done && done(data.item);
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
                dispatch(getQtSangKienUserPage());
                done && done(data.item);
            }
        }, () => T.notify('Xóa sáng kiến bị lỗi!', 'danger'));
    };
}

// End User Actions-----------------------------------------------------------------------------------------------