import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtKhenThuongAllGetAll = 'QtKhenThuongAll:GetAll';
const QtKhenThuongAllGetPage = 'QtKhenThuongAll:GetPage';
const QtKhenThuongAllGetUserPage = 'QtKhenThuongAll:GetUserPage';
const QtKhenThuongAllGetGroupPage = 'QtKhenThuongAll:GetGroupPage';
const QtKhenThuongAllGetGroupPageMa = 'QtKhenThuongAll:GetGroupPageMa';
const QtKhenThuongAllUpdate = 'QtKhenThuongAll:Update';
const QtKhenThuongAllGet = 'QtKhenThuongAll:Get';

export default function QtKhenThuongAllReducer(state = null, data) {
    switch (data.type) {
        case QtKhenThuongAllGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtKhenThuongAllGetGroupPage:
            return Object.assign({}, state, { pageGr: data.page });
        case QtKhenThuongAllGetGroupPageMa:
            return Object.assign({}, state, { pageMa: data.page });
        case QtKhenThuongAllGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtKhenThuongAllGetUserPage:
            return Object.assign({}, state, { userPage: data.page });
        case QtKhenThuongAllGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtKhenThuongAllUpdate:
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
T.initPage('userPageQtKhenThuongAll');
export function getQtKhenThuongAllUserPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('userPageQtKhenThuongAll', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/user/qua-trinh/khen-thuong-all/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách khen thưởng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: QtKhenThuongAllGetUserPage, page: data.page });
                if (done) done(data.page);
            }
        }, () => T.notify('Lấy danh sách khen thưởng bị lỗi!', 'danger'));
    };
}

export function updateQtKhenThuongAllUserPage(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/khen-thuong-all';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật khen thưởng bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật khen thưởng thành công!', 'success');
                dispatch(getQtKhenThuongAllUserPage());
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật khen thưởng bị lỗi!', 'danger'));
    };
}

export function createQtKhenThuongAllUserPage(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/khen-thuong-all';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo khen thưởng bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo khen thưởng thành công!', 'success');
                    dispatch(getQtKhenThuongAllUserPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo khen thưởng bị lỗi!', 'danger'));
    };
}
export function deleteQtKhenThuongAllUserPage(id, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/khen-thuong-all';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa khen thưởng bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('khen thưởng đã xóa thành công!', 'success', false, 800);
                dispatch(getQtKhenThuongAllUserPage());
                done && done(data.item);
            }
        }, () => T.notify('Xóa khen thưởng bị lỗi!', 'danger'));
    };
}

T.initPage('pageQtKhenThuongAll');
export function getQtKhenThuongAllPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtKhenThuongAll', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/khen-thuong-all/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách khen thưởng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: QtKhenThuongAllGetPage, page: data.page });
                if (done) done(data.page);
            }
        }, () => T.notify('Lấy danh sách khen thưởng bị lỗi!', 'danger'));
    };
}

export function getQtKhenThuongAllGroupPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtKhenThuongAll', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/khen-thuong-all/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter}, data => {
            if (data.error) {
                T.notify('Lấy danh sách khen thưởng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: QtKhenThuongAllGetGroupPage, page: data.page });
                done && done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createQtKhenThuongAll(items, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/khen-thuong-all';
        T.post(url, { items }, data => {
            if (data.error) {
                T.notify('Tạo khen thưởng bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                if (done) {
                    T.notify('Tạo khen thưởng thành công!', 'success');
                    dispatch(getQtKhenThuongAllPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo khen thưởng bị lỗi!', 'danger'));
    };
}

export function deleteQtKhenThuongAll(id, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/khen-thuong-all';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa khen thưởng bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('khen thưởng đã xóa thành công!', 'success', false, 800);
                dispatch(getQtKhenThuongAllPage());
                done && done(data.item);
            }
        }, () => T.notify('Xóa khen thưởng bị lỗi!', 'danger'));
    };
}

export function updateQtKhenThuongAll(id, changes, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/khen-thuong-all';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật khen thưởng bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật khen thưởng thành công!', 'success');
                dispatch(getQtKhenThuongAllPage());
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật khen thưởng bị lỗi!', 'danger'));
    };
}

T.initPage('groupPageMaQtKhenThuongAll');
export function getQtKhenThuongAllGroupPageMa(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('groupPageMaQtKhenThuongAll', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/khen-thuong-all/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách khen thưởng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: QtKhenThuongAllGetGroupPageMa, page: data.page });
                if (done) done(data.page);
            }
        }, () => T.notify('Lấy danh sách khen thưởng bị lỗi!', 'danger'));
    };
}

export function updateQtKhenThuongAllGroupPageMa(id, changes, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/khen-thuong-all';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật khen thưởng bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật khen thưởng thành công!', 'success');
                dispatch(getQtKhenThuongAllGroupPageMa());
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật khen thưởng bị lỗi!', 'danger'));
    };
}

export function createQtKhenThuongAllGroupPageMa(items, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/khen-thuong-all';
        T.post(url, { items }, data => {
            if (data.error) {
                T.notify('Tạo khen thưởng bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                if (done) {
                    T.notify('Tạo khen thưởng thành công!', 'success');
                    dispatch(getQtKhenThuongAllGroupPageMa());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo khen thưởng bị lỗi!', 'danger'));
    };
}
export function deleteQtKhenThuongAllGroupPageMa(id, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/khen-thuong-all';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa khen thưởng bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('khen thưởng đã xóa thành công!', 'success', false, 800);
                dispatch(getQtKhenThuongAllGroupPageMa());
                done && done(data.item);
            }
        }, () => T.notify('Xóa khen thưởng bị lỗi!', 'danger'));
    };
}

export function getQtKhenThuongAllAll(done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/khen-thuong-all/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách khen thưởng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: QtKhenThuongAllGetAll, items: data.items ? data.items : {} });
                if (done) done(data.items);
            }
        }, () => T.notify('Lấy danh sách khen thưởng bị lỗi!', 'danger'));
    };
}

export function getQtKhenThuongAll(id, done) {
    return () => {
        const url = `/api/tccb/qua-trinh/khen-thuong-all/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy khen thưởng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getQtKhenThuongAllEdit(id, done) {
    return dispatch => {
        const url = `/api/tccb/qua-trinh/khen-thuong-all/edit/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin khen thưởng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: QtKhenThuongAllGet, item: data.item });
                if (done) done(data);
            }
        }, () => T.notify('Lấy thông tin khen thưởng bị lỗi', 'danger'));
    };
}
//updating: Tien ...
//--USER-ACTION-------------------------------------------
export function createQtKhenThuongAllUser(data, done) {
    return () => {
        const url = '/api/user/qua-trinh/khen-thuong-all';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình khen thưởng bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình khen thưởng thành công!', 'info');
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin quá trình khen thưởng bị lỗi', 'danger'));
    };
}

export function updateQtKhenThuongAllUser(id, changes, done) {
    return () => {
        const url = '/api/user/qua-trinh/khen-thuong-all';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình khen thưởng bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình khen thưởng thành công!', 'info');
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin quá trình khen thưởng bị lỗi', 'danger'));
    };
}

export function deleteQtKhenThuongAllUser(id, done) {
    return () => {
        const url = '/api/user/qua-trinh/khen-thuong-all';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình khen thưởng bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình khen thưởng được xóa thành công!', 'info', false, 800);
                done && done();
            }
        }, () => T.notify('Xóa thông tin quá trình khen thưởng bị lỗi', 'danger'));
    };
}

export function createMultiQtKhenThuongAll(qtKhenThuongAll, done) {
    return () => {
        const url = '/api/tccb/qua-trinh/khen-thuong-all/multiple';
        T.post(url, { qtKhenThuongAll }, data => {
            if (data.error && data.error.length) {
                T.notify('Cập nhật dữ liệu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error('PUT: ' + url + '. ' + data.error.toString());
            } else {
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật dữ liệu bị lỗi!', 'danger'));
    };
}