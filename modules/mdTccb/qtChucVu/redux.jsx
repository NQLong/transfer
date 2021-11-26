import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtChucVuGetAll = 'QtChucVu:GetAll';
const QtChucVuGetPage = 'QtChucVu:GetPage';
const QtChucVuUpdate = 'QtChucVu:Update';
const QtChucVuGet = 'QtChucVu:Get';

export default function QtChucVuReducer(state = null, data) {
    switch (data.type) {
        case QtChucVuGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtChucVuGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtChucVuGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtChucVuUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].ma == updatedItem.ma) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].ma == updatedItem.ma) {
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
T.initPage('pageQtChucVu');
export function getQtChucVuPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageQtChucVu', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/qua-trinh/chuc-vu/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chức vụ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtChucVuGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách chức vụ bị lỗi!', 'danger'));
    };
}

export function getQtChucVuAll(done) {
    return dispatch => {
        const url = '/api/qua-trinh/chuc-vu/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: QtChucVuGetAll, items: data.items ? data.items : {} });
            }
        }, () => T.notify('Lấy danh sách chức vụ bị lỗi!', 'danger'));
    };
}

export function getQtChucVu(ma, done) {
    return () => {
        const url = `/api/qua-trinh/chuc-vu/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy chức vụ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getQtChucVuEdit(ma, done) {
    return dispatch => {
        const url = `/api/qua-trinh/chuc-vu/edit/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin chức vụ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data);
                dispatch({ type: QtChucVuGet, item: data.item });
            }
        }, () => T.notify('Lấy thông tin chức vụ bị lỗi', 'danger'));
    };
}

export function createQtChucVu(item, done) {
    return dispatch => {
        const url = '/api/qua-trinh/chuc-vu';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo chức vụ bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo chức vụ thành công!', 'success');
                dispatch(getQtChucVuPage());
                if (done) done(data);
            }
        }, () => T.notify('Tạo chức vụ bị lỗi!', 'danger'));
    };
}

export function deleteQtChucVu(ma, done) {
    return dispatch => {
        const url = '/api/qua-trinh/chuc-vu';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa chức vụ bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Chức vụ đã xóa thành công!', 'success', false, 800);
                dispatch(getQtChucVuPage());
            }
            done && done();
        }, () => T.notify('Xóa chức vụ bị lỗi!', 'danger'));
    };
}

export function updateQtChucVu(ma, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/chuc-vu';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật chức vụ bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật chức vụ thành công!', 'success');
                done && done(data.item);
                dispatch(getQtChucVu(ma));
            }
        }, () => T.notify('Cập nhật chức vụ bị lỗi!', 'danger'));
    };
}

//--USER-ACTION-------------------------------------------
export function createQtChucVuUser(data, done) {
    return () => {
        const url = '/api/user/qua-trinh/chuc-vu';
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

export function updateQtChucVuUser(id, changes, done) {
    return () => {
        const url = '/api/user/qua-trinh/chuc-vu';
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

export function deleteQtChucVuUser(id, done) {
    return () => {
        const url = '/api/user/qua-trinh/chuc-vu';
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

export function downloadWord(ma, done) {
    return () => {
        const url = `/user/qua-trinh/chuc-vu/${ma}/word`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Tải file word bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else if (done) {
                done(data.data);
            }
        }, () => T.notify('Tải file word bị lỗi', 'danger'));
    };
}
