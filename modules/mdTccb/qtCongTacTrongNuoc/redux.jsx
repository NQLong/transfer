import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtCongTacTrongNuocGetAll = 'QtCongTacTrongNuoc:GetAll';
const QtCongTacTrongNuocGetPage = 'QtCongTacTrongNuoc:GetPage';
const QtCongTacTrongNuocGetUserPage = 'QtCongTacTrongNuoc:GetUserPage';
const QtCongTacTrongNuocGetGroupPage = 'QtCongTacTrongNuoc:GetGroupPage';
const QtCongTacTrongNuocGetGroupPageMa = 'QtCongTacTrongNuoc:GetGroupPageMa';
const QtCongTacTrongNuocUpdate = 'QtCongTacTrongNuoc:Update';
const QtCongTacTrongNuocGet = 'QtCongTacTrongNuoc:Get';

export default function QtCongTacTrongNuocReducer(state = null, data) {
    switch (data.type) {
        case QtCongTacTrongNuocGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtCongTacTrongNuocGetGroupPage:
            return Object.assign({}, state, { page_gr: data.page });
        case QtCongTacTrongNuocGetGroupPageMa:
            return Object.assign({}, state, { page_ma: data.page });
        case QtCongTacTrongNuocGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtCongTacTrongNuocGetUserPage:
            return Object.assign({}, state, { user_page: data.page });
        case QtCongTacTrongNuocGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtCongTacTrongNuocUpdate:
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
T.initPage('userPageQtCongTacTrongNuoc');
export function getQtCongTacTrongNuocUserPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('userPageQtCongTacTrongNuoc', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/user/qua-trinh/cong-tac-trong-nuoc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách công tác trong nước bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtCongTacTrongNuocGetUserPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách công tác trong nước bị lỗi!', 'danger'));
    };
}

export function updateQtCongTacTrongNuocUserPage(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/cong-tac-trong-nuoc';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật công tác trong nước bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật công tác trong nước thành công!', 'success');
                done && done(data.item);
                dispatch(getQtCongTacTrongNuocUserPage());
            }
        }, () => T.notify('Cập nhật công tác trong nước bị lỗi!', 'danger'));
    };
}

export function createQtCongTacTrongNuocUserPage(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/cong-tac-trong-nuoc';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo công tác trong nước bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo công tác trong nước thành công!', 'success');
                    dispatch(getQtCongTacTrongNuocUserPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo công tác trong nước bị lỗi!', 'danger'));
    };
}
export function deleteQtCongTacTrongNuocUserPage(id, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/cong-tac-trong-nuoc';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa công tác trong nước bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa thành công!', 'success', false, 800);
                done && done(data.item);
                dispatch(getQtCongTacTrongNuocUserPage());
            }
        }, () => T.notify('Xóa công tác trong nước bị lỗi!', 'danger'));
    };
}

T.initPage('pageQtCongTacTrongNuoc');
export function getQtCongTacTrongNuocPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtCongTacTrongNuoc', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/cong-tac-trong-nuoc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách công tác trong nước bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtCongTacTrongNuocGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách công tác trong nước bị lỗi!', 'danger'));
    };
}

export function createQtCongTacTrongNuoc(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/cong-tac-trong-nuoc';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình công tác trong nước bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                if (done) {
                    T.notify('Thêm thông tin quá trình công tác trong nước thành công!', 'info');
                    dispatch(getQtCongTacTrongNuocPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Thêm thông tin quá trình công tác trong nước bị lỗi', 'danger'));
    };
}

export function updateQtCongTacTrongNuoc(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/cong-tac-trong-nuoc';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình công tác trong nước bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình công tác trong nước thành công!', 'info');
                done && done(data.item);
                dispatch(getQtCongTacTrongNuocPage());
            }
        }, () => T.notify('Cập nhật thông tin quá trình công tác trong nước bị lỗi', 'danger'));
    };
}

export function deleteQtCongTacTrongNuoc(id, done) {
    return dispatch => {
        const url = '/api/qua-trinh/cong-tac-trong-nuoc';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình công tác trong nước bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình công tác trong nước được xóa thành công!', 'info', false, 800);
                dispatch(getQtCongTacTrongNuocPage());
                done && done(data.item);
            }
        }, () => T.notify('Xóa thông tin quá trình công tác trong nước bị lỗi', 'danger'));
    };
}

export function getQtCongTacTrongNuocGroupPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtCongTacTrongNuoc', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/cong-tac-trong-nuoc/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách công tác trong nước bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtCongTacTrongNuocGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

T.initPage('groupPageMaQtCongTacTrongNuoc');
export function getQtCongTacTrongNuocGroupPageMa(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('groupPageMaQtCongTacTrongNuoc', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/cong-tac-trong-nuoc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách công tác trong nước bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtCongTacTrongNuocGetGroupPageMa, page: data.page });
            }
        }, () => T.notify('Lấy danh sách công tác trong nước bị lỗi!', 'danger'));
    };
}

export function updateQtCongTacTrongNuocGroupPageMa(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/cong-tac-trong-nuoc';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình công tác trong nước bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình công tác trong nước thành công!', 'info');
                done && done(data.item);
                dispatch(getQtCongTacTrongNuocGroupPageMa());
            }
        }, () => T.notify('Cập nhật thông tin quá trình công tác trong nước bị lỗi', 'danger'));
    };
}

export function deleteQtCongTacTrongNuocGroupPageMa(id, done) {
    return dispatch => {
        const url = '/api/qua-trinh/cong-tac-trong-nuoc';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình công tác trong nước bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình công tác trong nước được xóa thành công!', 'info', false, 800);
                done && done(data.item);
                dispatch(getQtCongTacTrongNuocGroupPageMa());
            }
        }, () => T.notify('Xóa thông tin quá trình công tác trong nước bị lỗi', 'danger'));
    };
}

export function createQtCongTacTrongNuocGroupPageMa(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/cong-tac-trong-nuoc';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo công tác trong nước bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo công tác trong nước thành công!', 'success');
                    dispatch(getQtCongTacTrongNuocGroupPageMa());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo công tác trong nước bị lỗi!', 'danger'));
    };
}