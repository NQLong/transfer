import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtKhenThuongAllGetAll = 'QtKhenThuongAll:GetAll';
const QtKhenThuongAllGetPage = 'QtKhenThuongAll:GetPage';
const QtKhenThuongAllGetGroupPage = 'QtKhenThuongAll:GetGroupPage';
const QtKhenThuongAllUpdate = 'QtKhenThuongAll:Update';
const QtKhenThuongAllGet = 'QtKhenThuongAll:Get';

export default function QtKhenThuongAllReducer(state = null, data) {
    switch (data.type) {
        case QtKhenThuongAllGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtKhenThuongAllGetGroupPage:
            return Object.assign({}, state, { page_gr: data.page });
        case QtKhenThuongAllGetPage:
            return Object.assign({}, state, { page: data.page });
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
T.initPage('pageQtKhenThuongAll');
export function getQtKhenThuongAllPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageQtKhenThuongAll', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/khen-thuong-all/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách khen thưởng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtKhenThuongAllGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách khen thưởng bị lỗi!', 'danger'));
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
                if (done) done(data.items);
                dispatch({ type: QtKhenThuongAllGetAll, items: data.items ? data.items : {} });
            }
        }, () => T.notify('Lấy danh sách khen thưởng bị lỗi!', 'danger'));
    };
}

T.initPage('groupPageQtKhenThuongAll', true);
export function getQtKhenThuongAllGroupPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('groupPageQtKhenThuongAll', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/khen-thuong-all/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách khen thưởng theo đối tượng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtKhenThuongAllGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

T.initPage('groupPageMaQtKhenThuongAll', true);
export function getQtKhenThuongAllGroupPageMa(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('groupPageMaQtKhenThuongAll', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/khen-thuong-all/group_dt/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách khen thưởng theo đối tượng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtKhenThuongAllGetPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
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
                if (done) done(data);
                dispatch({ type: QtKhenThuongAllGet, item: data.item });
            }
        }, () => T.notify('Lấy thông tin khen thưởng bị lỗi', 'danger'));
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
                T.notify('Tạo khen thưởng thành công!', 'success');
                dispatch(getQtKhenThuongAllPage());
                if (done) done(data);
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
            }
            done && done();
        }, () => T.notify('Xóa khen thưởng bị lỗi!', 'danger'));
    };
}

export function updateQtKhenThuongAll(id, ma, changes, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/khen-thuong-all';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật khen thưởng bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật khen thưởng thành công!', 'success');
                done && done(data.item);
                dispatch(getQtKhenThuongAllGroupPageMa(undefined, undefined, ma));
            }
        }, () => T.notify('Cập nhật khen thưởng bị lỗi!', 'danger'));
    };
}

export function updateQtKhenThuongAllGroup(id, changes, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/khen-thuong-all';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật khen thưởng bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật khen thưởng thành công!', 'success');
                done && done(data.item);
                dispatch(getQtKhenThuongAllPage());
            }
        }, () => T.notify('Cập nhật khen thưởng bị lỗi!', 'danger'));
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