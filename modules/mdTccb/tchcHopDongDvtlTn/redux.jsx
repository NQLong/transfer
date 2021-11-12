import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TchcHopDongDvtlTnGetAll = 'TchcHopDongDvtlTn:GetAll';
const TchcHopDongDvtlTnGetPage = 'TchcHopDongDvtlTn:GetPage';
const TchcHopDongDvtlTnUpdate = 'TchcHopDongDvtlTn:Update';
const TchcHopDongDvtlTnGet = 'TchcHopDongDvtlTn:Get';

export default function TchcHopDongDvtlTnReducer(state = null, data) {
    switch (data.type) {
        case TchcHopDongDvtlTnGetAll:
            return Object.assign({}, state, { items: data.items });
        case TchcHopDongDvtlTnGetPage:
            return Object.assign({}, state, { page: data.page });
        case TchcHopDongDvtlTnGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case TchcHopDongDvtlTnUpdate:
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
T.initPage('pageTchcHopDongDvtlTn');
export function getTchcHopDongDvtlTnPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageTchcHopDongDvtlTn', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/hopDongDvtlTn/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: TchcHopDongDvtlTnGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger'));
    };
}

export function getTchcHopDongDvtlTnAll(done) {
    return dispatch => {
        const url = '/api/hopDongDvtlTn/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: TchcHopDongDvtlTnGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger'));
    };
}

export function getTchcHopDongDvtlTn(ma, done) {
    return () => {
        const url = `/api/hopDongDvtlTn/item/${ma}`;
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

export function getTchcHopDongDvtlTnEdit(ma, done) {
    return dispatch => {
        const url = `/api/hopDongDvtlTn/edit/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin hợp đồng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data);
                dispatch({ type: TchcHopDongDvtlTnGet, item: data.item });
            }
        }, () => T.notify('Lấy thông tin hợp đồng bị lỗi', 'danger'));
    };
}

export function createTchcHopDongDvtlTn(item, done) {
    return dispatch => {
        const url = '/api/hopDongDvtlTn';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo hợp đồng bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo hợp đồng thành công!', 'success');
                dispatch(getTchcHopDongDvtlTnPage());
                if (done) done(data);
            }
        }, () => T.notify('Tạo hợp đồng bị lỗi!', 'danger'));
    };
}

export function deleteTchcHopDongDvtlTn(ma, done) {
    return dispatch => {
        const url = '/api/hopDongDvtlTn';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa hợp đồng bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Hợp đồng đã xóa thành công!', 'success', false, 800);
                dispatch(getTchcHopDongDvtlTnPage());
            }
            done && done();
        }, () => T.notify('Xóa hợp đồng bị lỗi!', 'danger'));
    };
}

export function updateTchcHopDongDvtlTn(ma, changes, done) {
    return dispatch => {
        const url = '/api/hopDongDvtlTn';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật hợp đồng bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật hợp đồng thành công!', 'success');
                done && done(data.item);
                dispatch(getTchcHopDongDvtlTn(ma));
            }
        }, () => T.notify('Cập nhật hợp đồng bị lỗi!', 'danger'));
    };
}

export function downloadWord(ma, done) {
    return () => {
        const url = `/user/hopDongDvtlTn/${ma}/word`;
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
