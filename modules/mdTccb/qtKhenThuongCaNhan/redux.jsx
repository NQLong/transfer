import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtKhenThuongCaNhanGetAll = 'QtKhenThuongCaNhan:GetAll';
const QtKhenThuongCaNhanGetPage = 'QtKhenThuongCaNhan:GetPage';
const QtKhenThuongCaNhanUpdate = 'QtKhenThuongCaNhan:Update';
const QtKhenThuongCaNhanGet = 'QtKhenThuongCaNhan:Get';

export default function QtKhenThuongCaNhanReducer(state = null, data) {
    switch (data.type) {
        case QtKhenThuongCaNhanGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtKhenThuongCaNhanGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtKhenThuongCaNhanGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtKhenThuongCaNhanUpdate:
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
T.initPage('pageQtKhenThuongCaNhan');
export function getQtKhenThuongCaNhanPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageQtKhenThuongCaNhan', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/khen-thuong-ca-nhan/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách khen thưởng cá nhân bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtKhenThuongCaNhanGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách khen thưởng cá nhân bị lỗi!', 'danger'));
    };
}

export function getQtKhenThuongCaNhanAll(done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/khen-thuong-ca-nhan/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách khen thưởng cá nhân bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: QtKhenThuongCaNhanGetAll, items: data.items ? data.items : {} });
            }
        }, () => T.notify('Lấy danh sách khen thưởng cá nhân bị lỗi!', 'danger'));
    };
}

export function getQtKhenThuongCaNhan(id, done) {
    return () => {
        const url = `/api/tccb/qua-trinh/khen-thuong-ca-nhan/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy khen thưởng cá nhân bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getQtKhenThuongCaNhanEdit(id, done) {
    return dispatch => {
        const url = `/api/tccb/qua-trinh/khen-thuong-ca-nhan/edit/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin khen thưởng cá nhân bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data);
                dispatch({ type: QtKhenThuongCaNhanGet, item: data.item });
            }
        }, () => T.notify('Lấy thông tin khen thưởng cá nhân bị lỗi', 'danger'));
    };
}

export function createQtKhenThuongCaNhan(items, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/khen-thuong-ca-nhan';
        T.post(url, { items }, data => {
            if (data.error) {
                T.notify('Tạo khen thưởng cá nhân bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo khen thưởng cá nhân thành công!', 'success');
                dispatch(getQtKhenThuongCaNhanPage());
                if (done) done(data);
            }
        }, () => T.notify('Tạo khen thưởng cá nhân bị lỗi!', 'danger'));
    };
}

export function deleteQtKhenThuongCaNhan(id, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/khen-thuong-ca-nhan';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa khen thưởng cá nhân bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('khen thưởng cá nhân đã xóa thành công!', 'success', false, 800);
                dispatch(getQtKhenThuongCaNhanPage());
            }
            done && done();
        }, () => T.notify('Xóa khen thưởng cá nhân bị lỗi!', 'danger'));
    };
}

export function updateQtKhenThuongCaNhan(id, changes, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/khen-thuong-ca-nhan';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật khen thưởng cá nhân bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật khen thưởng cá nhân thành công!', 'success');
                done && done(data.item);
                dispatch(getQtKhenThuongCaNhanPage());
            }
        }, () => T.notify('Cập nhật khen thưởng cá nhân bị lỗi!', 'danger'));
    };
}

//updating: Tien ...
//--USER-ACTION-------------------------------------------
export function createQtKhenThuongCaNhanUser(data, done) {
    return () => {
        const url = '/api/user/qua-trinh/khen-thuong-ca-nhan';
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

export function updateQtKhenThuongCaNhanUser(id, changes, done) {
    return () => {
        const url = '/api/user/qua-trinh/khen-thuong-ca-nhan';
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

export function deleteQtKhenThuongCaNhanUser(id, done) {
    return () => {
        const url = '/api/user/qua-trinh/khen-thuong-ca-nhan';
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
