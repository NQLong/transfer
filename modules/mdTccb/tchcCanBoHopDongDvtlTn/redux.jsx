import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TchcCanBoHopDongDvtlTnGetAll = 'TchcCanBoHopDongDvtlTn:GetAll';
const TchcCanBoHopDongDvtlTnGet = 'TchcCanBoHopDongDvtlTn:Get';
const TchcCanBoHopDongDvtlTnGetPage = 'TchcCanBoHopDongDvtlTn:GetPage';
const TchcCanBoHopDongDvtlTnUpdate = 'TchcCanBoHopDongDvtlTn:Update';

export default function TchcCanBoHopDongDvtlTnReducer(state = null, data) {
    switch (data.type) {
        case TchcCanBoHopDongDvtlTnGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case TchcCanBoHopDongDvtlTnGetAll:
            return Object.assign({}, state, { items: data.items });
        case TchcCanBoHopDongDvtlTnGetPage:
            return Object.assign({}, state, { page: data.page });
        case TchcCanBoHopDongDvtlTnUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].shcc == updatedItem.shcc) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].shcc == updatedItem.shcc) {
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
T.initPage('pageTchcCanBoHopDongDvtlTn');
export function getTchcCanBoHopDongDvtlTnPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageTchcCanBoHopDongDvtlTn', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/canBoHopDongDvtlTn/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách cán bộ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: TchcCanBoHopDongDvtlTnGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách cán bộ bị lỗi!', 'danger'));
    };
}

export function getTchcCanBoHopDongDvtlTnAll(done) {
    return dispatch => {
        const url = '/api/canBoHopDongDvtlTn/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách cán bộ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: TchcCanBoHopDongDvtlTnGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách cán bộ bị lỗi!', 'danger'));
    };
}

export function getTchcCanBoHopDongDvtlTn(shcc, done) {
    return () => {
        const url = `/api/canBoHopDongDvtlTn/item/${shcc}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy cán bộ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getTchcCanBoHopDongDvtlTnEdit(shcc, done) {
    return dispatch => {
        const url = `/api/canBoHopDongDvtlTn/edit/item/${shcc}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy cán bộ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
                dispatch({ type: TchcCanBoHopDongDvtlTnGet, item: data.item });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createTchcCanBoHopDongDvtlTn(item, done) {
    return dispatch => {
        const url = '/api/canBoHopDongDvtlTn';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo cán bộ bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo cán bộ thành công!', 'success');
                dispatch(getTchcCanBoHopDongDvtlTnPage());
                if (done) done(data);
            }
        }, () => T.notify('Tạo cán bộ bị lỗi!', 'danger'));
    };
}

export function deleteTchcCanBoHopDongDvtlTn(shcc, done) {
    return dispatch => {
        const url = '/api/canBoHopDongDvtlTn';
        T.delete(url, { shcc }, data => {
            if (data.error) {
                T.notify('Xóa cán bộ bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getTchcCanBoHopDongDvtlTnPage());
            }
            done && done();
        }, () => T.notify('Xóa cán bộ bị lỗi!', 'danger'));
    };
}

export function updateTchcCanBoHopDongDvtlTn(shcc, changes, done) {
    return dispatch => {
        const url = '/api/canBoHopDongDvtlTn';
        T.put(url, { shcc, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật cán bộ bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật cán bộ thành công!', 'success');
                done && done(data.item);
                dispatch(getTchcCanBoHopDongDvtlTnPage());
            }
        }, () => T.notify('Cập nhật cán bộ bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_HiredStaff = {
    ajax: false,
    getAll: getTchcCanBoHopDongDvtlTnAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.shcc, text: item.ho + ' ' + item.ten })) : [] }),
};