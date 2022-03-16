import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtNghiThaiSanGetAll = 'QtNghiThaiSan:GetAll';
const QtNghiThaiSanGetPage = 'QtNghiThaiSan:GetPage';
const QtNghiThaiSanGetUserPage = 'QtNghiThaiSan:GetUserPage';
const QtNghiThaiSanUpdate = 'QtNghiThaiSan:Update';
const QtNghiThaiSanGet = 'QtNghiThaiSan:Get';
const QtNghiThaiSanGetGroupPage = 'QtNghiThaiSan:GetGroupPage';
const QtNghiThaiSanGetGroupPageMa = 'QtNghiThaiSan:GetGroupPageMa';

export default function QtNghiThaiSanReducer(state = null, data) {
    switch (data.type) {
        case QtNghiThaiSanGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtNghiThaiSanGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtNghiThaiSanGetUserPage:
            return Object.assign({}, state, { userPage: data.page });
        case QtNghiThaiSanGetGroupPage:
            return Object.assign({}, state, { pageGr: data.page });
        case QtNghiThaiSanGetGroupPageMa:
            return Object.assign({}, state, { pageMa: data.page });
        case QtNghiThaiSanGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtNghiThaiSanUpdate:
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

T.initPage('userPageQtNghiThaiSan');
export function getQtNghiThaiSanUserPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('userPageQtNghiThaiSan', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/user/qua-trinh/nghi-thai-san/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nghỉ thai sản bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtNghiThaiSanGetUserPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách nghỉ thai sản bị lỗi!', 'danger'));
    };
}

export function updateQtNghiThaiSanUserPage(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nghi-thai-san';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật nghỉ thai sản bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật nghỉ thai sản thành công!', 'success');
                done && done(data.item);
                dispatch(getQtNghiThaiSanUserPage());
            }
        }, () => T.notify('Cập nhật nghỉ thai sản bị lỗi!', 'danger'));
    };
}

export function createQtNghiThaiSanUserPage(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nghi-thai-san';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo nghỉ thai sản bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo nghỉ thai sản thành công!', 'success');
                    dispatch(getQtNghiThaiSanUserPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo nghỉ thai sản bị lỗi!', 'danger'));
    };
}
export function deleteQtNghiThaiSanUserPage(id, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nghi-thai-san';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa nghỉ thai sản bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('nghỉ thai sản đã xóa thành công!', 'success', false, 800);
                done && done(data.item);
                dispatch(getQtNghiThaiSanUserPage());
            }
        }, () => T.notify('Xóa nghỉ thai sản bị lỗi!', 'danger'));
    };
}

T.initPage('pageQtNghiThaiSan');
export function getQtNghiThaiSanPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtNghiThaiSan', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/qua-trinh/nghi-thai-san/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nghỉ thai sản bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtNghiThaiSanGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách nghỉ thai sản bị lỗi!', 'danger'));
    };
}

export function getQtNghiThaiSanGroupPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtNghiThaiSan', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/nghi-thai-san/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nghỉ thai sản theo cán bộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtNghiThaiSanGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

T.initPage('groupPageMaQtNghiThaiSan');
export function getQtNghiThaiSanGroupPageMa(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('groupPageMaQtNghiThaiSan', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/qua-trinh/nghi-thai-san/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nghỉ thai sản bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtNghiThaiSanGetGroupPageMa, page: data.page });
            }
        }, () => T.notify('Lấy danh sách nghỉ thai sản bị lỗi!', 'danger'));
    };
}
export function createQtNghiThaiSanGroupPageMa(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nghi-thai-san';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo nghỉ thai sản bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo nghỉ thai sản thành công!', 'success');
                    dispatch(getQtNghiThaiSanGroupPageMa());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo nghỉ thai sản bị lỗi!', 'danger'));
    };
}

export function deleteQtNghiThaiSanGroupPageMa(id, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nghi-thai-san';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa nghỉ thai sản bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('nghỉ thai sản đã xóa thành công!', 'success', false, 800);
                done && done(data.item);
                dispatch(getQtNghiThaiSanGroupPageMa());
            }
        }, () => T.notify('Xóa nghỉ thai sản bị lỗi!', 'danger'));
    };
}

export function updateQtNghiThaiSanGroupPageMa(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nghi-thai-san';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật nghỉ thai sản bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật nghỉ thai sản thành công!', 'success');
                done && done(data.item);
                dispatch(getQtNghiThaiSanGroupPageMa());
            }
        }, () => T.notify('Cập nhật nghỉ thai sản bị lỗi!', 'danger'));
    };
}

export function createQtNghiThaiSan(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nghi-thai-san';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin nghỉ thai sản bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin nghỉ thai sản thành công!', 'info');
                if (done) {
                    done(data);
                    dispatch(getQtNghiThaiSanPage());
                }
            }
        }, () => T.notify('Thêm thông tin nghỉ thai sản bị lỗi', 'danger'));
    };
}

export function updateQtNghiThaiSan(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nghi-thai-san';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin nghỉ thai sản bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin nghỉ thai sản thành công!', 'info');
                done && done(data.item);
                dispatch(getQtNghiThaiSanPage());
            }
        }, () => T.notify('Cập nhật thông tin nghỉ thai sản bị lỗi', 'danger'));
    };
}

export function deleteQtNghiThaiSan(id, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nghi-thai-san';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin nghỉ thai sản bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin nghỉ thai sản được xóa thành công!', 'info', false, 800);
                dispatch(getQtNghiThaiSanPage());
                done && done(data.item);
            }
        }, () => T.notify('Xóa thông tin nghỉ thai sản bị lỗi', 'danger'));
    };
}
