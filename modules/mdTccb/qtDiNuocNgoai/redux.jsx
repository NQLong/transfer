import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtDiNuocNgoaiGetAll = 'QtDiNuocNgoai:GetAll';
const QtDiNuocNgoaiGetPage = 'QtDiNuocNgoai:GetPage';
const QtDiNuocNgoaiGetUserPage = 'QtDiNuocNgoai:GetUserPage';
const QtDiNuocNgoaiGetGroupPage = 'QtDiNuocNgoai:GetGroupPage';
const QtDiNuocNgoaiGetGroupPageMa = 'QtDiNuocNgoai:GetGroupPageMa';
const QtDiNuocNgoaiUpdate = 'QtDiNuocNgoai:Update';
const QtDiNuocNgoaiGet = 'QtDiNuocNgoai:Get';

export default function QtDiNuocNgoaiReducer(state = null, data) {
    switch (data.type) {
        case QtDiNuocNgoaiGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtDiNuocNgoaiGetGroupPage:
            return Object.assign({}, state, { pageGr: data.page });
        case QtDiNuocNgoaiGetGroupPageMa:
            return Object.assign({}, state, { pageMa: data.page });
        case QtDiNuocNgoaiGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtDiNuocNgoaiGetUserPage:
            return Object.assign({}, state, { userPage: data.page });
        case QtDiNuocNgoaiGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtDiNuocNgoaiUpdate:
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
T.initPage('userPageQtDiNuocNgoai');
export function getQtDiNuocNgoaiUserPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('userPageQtDiNuocNgoai', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/user/qua-trinh/di-nuoc-ngoai/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách đi nước ngoài bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtDiNuocNgoaiGetUserPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách đi nước ngoài bị lỗi!', 'danger'));
    };
}

export function updateQtDiNuocNgoaiUserPage(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/di-nuoc-ngoai';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật đi nước ngoài bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật đi nước ngoài thành công!', 'success');
                done && done(data.item);
                dispatch(getQtDiNuocNgoaiUserPage());
            }
        }, () => T.notify('Cập nhật đi nước ngoài bị lỗi!', 'danger'));
    };
}

export function createQtDiNuocNgoaiUserPage(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/di-nuoc-ngoai';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo đi nước ngoài bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo đi nước ngoài thành công!', 'success');
                    dispatch(getQtDiNuocNgoaiUserPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo đi nước ngoài bị lỗi!', 'danger'));
    };
}
export function deleteQtDiNuocNgoaiUserPage(id, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/di-nuoc-ngoai';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa đi nước ngoài bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa thành công!', 'success', false, 800);
                done && done(data.item);
                dispatch(getQtDiNuocNgoaiUserPage());
            }
        }, () => T.notify('Xóa đi nước ngoài bị lỗi!', 'danger'));
    };
}

T.initPage('pageQtDiNuocNgoai');
export function getQtDiNuocNgoaiPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtDiNuocNgoai', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/di-nuoc-ngoai/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách đi nước ngoài bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtDiNuocNgoaiGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách đi nước ngoài bị lỗi!', 'danger'));
    };
}

export function createQtDiNuocNgoai(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/di-nuoc-ngoai';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình đi nước ngoài bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                if (done) {
                    T.notify('Thêm thông tin quá trình đi nước ngoài thành công!', 'info');
                    dispatch(getQtDiNuocNgoaiPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Thêm thông tin quá trình đi nước ngoài bị lỗi', 'danger'));
    };
}

export function updateQtDiNuocNgoai(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/di-nuoc-ngoai';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình đi nước ngoài bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình đi nước ngoài thành công!', 'info');
                done && done(data.item);
                dispatch(getQtDiNuocNgoaiPage());
            }
        }, () => T.notify('Cập nhật thông tin quá trình đi nước ngoài bị lỗi', 'danger'));
    };
}

export function deleteQtDiNuocNgoai(id, done) {
    return dispatch => {
        const url = '/api/qua-trinh/di-nuoc-ngoai';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình đi nước ngoài bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình đi nước ngoài được xóa thành công!', 'info', false, 800);
                dispatch(getQtDiNuocNgoaiPage());
                done && done(data.item);
            }
        }, () => T.notify('Xóa thông tin quá trình đi nước ngoài bị lỗi', 'danger'));
    };
}

export function getQtDiNuocNgoaiGroupPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtDiNuocNgoai', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/di-nuoc-ngoai/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách đi nước ngoài bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtDiNuocNgoaiGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

T.initPage('groupPageMaQtDiNuocNgoai');
export function getQtDiNuocNgoaiGroupPageMa(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('groupPageMaQtDiNuocNgoai', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/di-nuoc-ngoai/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách đi nước ngoài bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtDiNuocNgoaiGetGroupPageMa, page: data.page });
            }
        }, () => T.notify('Lấy danh sách đi nước ngoài bị lỗi!', 'danger'));
    };
}

export function updateQtDiNuocNgoaiGroupPageMa(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/di-nuoc-ngoai';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình đi nước ngoài bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình đi nước ngoài thành công!', 'info');
                done && done(data.item);
                dispatch(getQtDiNuocNgoaiGroupPageMa());
            }
        }, () => T.notify('Cập nhật thông tin quá trình đi nước ngoài bị lỗi', 'danger'));
    };
}

export function deleteQtDiNuocNgoaiGroupPageMa(id, done) {
    return dispatch => {
        const url = '/api/qua-trinh/di-nuoc-ngoai';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình đi nước ngoài bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình đi nước ngoài được xóa thành công!', 'info', false, 800);
                done && done(data.item);
                dispatch(getQtDiNuocNgoaiGroupPageMa());
            }
        }, () => T.notify('Xóa thông tin quá trình đi nước ngoài bị lỗi', 'danger'));
    };
}

export function createQtDiNuocNgoaiGroupPageMa(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/di-nuoc-ngoai';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo đi nước ngoài bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo đi nước ngoài thành công!', 'success');
                    dispatch(getQtDiNuocNgoaiGroupPageMa());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo đi nước ngoài bị lỗi!', 'danger'));
    };
}

export function getThongKeMucDich(pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    return () => {
        const url = '/api/tccb/qua-trinh/di-nuoc-ngoai/thong-ke-muc-dich';
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Thống kê danh sách mục đích đi nước ngoài bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
            }
        }, (error) => T.notify('Thống kê danh sách mục đích đi nước ngoài bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}