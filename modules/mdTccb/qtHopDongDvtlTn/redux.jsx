import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtHopDongDvtlTnGetAll = 'QtHopDongDvtlTn:GetAll';
const QtHopDongDvtlTnGetPage = 'QtHopDongDvtlTn:GetPage';
const QtHopDongDvtlTnUpdate = 'QtHopDongDvtlTn:Update';
const QtHopDongDvtlTnGet = 'QtHopDongDvtlTn:Get';

export default function QtHopDongDvtlTnReducer(state = null, data) {
    switch (data.type) {
        case QtHopDongDvtlTnGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtHopDongDvtlTnGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtHopDongDvtlTnGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtHopDongDvtlTnUpdate:
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
T.initPage('pageQtHopDongDvtlTn');
export function getQtHopDongDvtlTnPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageQtHopDongDvtlTn', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/hop-dong-dvtl-tn/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtHopDongDvtlTnGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger'));
    };
}

export function getQtHopDongDvtlTnAll(done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/hop-dong-dvtl-tn/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: QtHopDongDvtlTnGetAll, items: data.items ? data.items : {} });
            }
        }, () => T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger'));
    };
}

export function getQtHopDongDvtlTn(ma, done) {
    return () => {
        const url = `/api/tccb/qua-trinh/hop-dong-dvtl-tn/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy hợp đồng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getQtHopDongDvtlTnEdit(ma, done) {
    return dispatch => {
        const url = `/api/tccb/qua-trinh/hop-dong-dvtl-tn/edit/item/${ma}`;
        T.get(url, data => {
            console.log(data);
            if (data.error) {
                T.notify('Lấy thông tin hợp đồng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data);
                dispatch({ type: QtHopDongDvtlTnGet, item: data.item });
            }
        }, () => T.notify('Lấy thông tin hợp đồng bị lỗi', 'danger'));
    };
}

export function createQtHopDongDvtlTn(item, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/hop-dong-dvtl-tn';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo hợp đồng bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo hợp đồng thành công!', 'success');
                dispatch(getQtHopDongDvtlTnPage());
                if (done) done(data);
            }
        }, () => T.notify('Tạo hợp đồng bị lỗi!', 'danger'));
    };
}

export function deleteQtHopDongDvtlTn(ma, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/hop-dong-dvtl-tn';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa hợp đồng bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('hợp đồng đã xóa thành công!', 'success', false, 800);
                dispatch(getQtHopDongDvtlTnPage());
            }
            done && done();
        }, () => T.notify('Xóa hợp đồng bị lỗi!', 'danger'));
    };
}

export function updateQtHopDongDvtlTn(ma, changes, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/hop-dong-dvtl-tn';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật hợp đồng bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật hợp đồng thành công!', 'success');
                done && done(data.item);
                dispatch(getQtHopDongDvtlTn(ma));
            }
        }, () => T.notify('Cập nhật hợp đồng bị lỗi!', 'danger'));
    };
}

//--USER-ACTION-------------------------------------------
export function createQtHopDongDvtlTnUser(data, done) {
    return () => {
        const url = '/api/user/qua-trinh/hop-dong-dvtl-tn';
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

export function updateQtHopDongDvtlTnUser(id, changes, done) {
    return () => {
        const url = '/api/user/qua-trinh/hop-dong-dvtl-tn';
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

export function deleteQtHopDongDvtlTnUser(id, done) {
    return () => {
        const url = '/api/user/qua-trinh/hop-dong-dvtl-tn';
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

export function downloadHopDongWord(ma, done) {
    console.log(ma);
    const url = `api/tccb/qua-trinh/hop-dong-dvtl-tn/download-word/${ma}`;
    T.get(url, data => {
        if (data.error) {
            T.notify('Tải file word bị lỗi', 'danger');
            console.error(`GET: ${url}.`, data.error);
        } else if (done) {
            done(data.data);
        }
    }, error => T.notify('Tải file world bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));

}
