import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmTapChiGetAll = 'DmTapChi:GetAll';
const DmTapChiGetPage = 'DmTapChi:GetPage';
const DmTapChiUpdate = 'DmTapChi:Update';

export default function DmTapChiReducer(state = null, data) {
    switch (data.type) {
        case DmTapChiGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmTapChiGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmTapChiUpdate:
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
T.initPage('pageDmTapChi');
export function getDmTapChiPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmTapChi', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/tap-chi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách tạp chí bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmTapChiGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách tạp chí bị lỗi!', 'danger'));
    };
}

export function getDmTapChiAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/tap-chi/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách tạp chí bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmTapChiGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách tạp chí bị lỗi!', 'danger'));
    };
}

export function getDmTapChi(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/tap-chi/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin tạp chí bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmTapChi(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/tap-chi';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo tạp chí bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmTapChiAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo tạp chí bị lỗi!', 'danger'));
    };
}

export function deleteDmTapChi(ma) {
    return dispatch => {
        const url = '/api/danh-muc/tap-chi';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục tạp chí bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmTapChiAll());
            }
        }, error => T.notify('Xóa tạp chí bị lỗi!', 'danger'));
    };
}

export function updateDmTapChi(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/tap-chi';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin tạp chí bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin tạp chí thành công!', 'success');
                dispatch(getDmTapChiAll());
            }
        }, error => T.notify('Cập nhật thông tin tạp chí bị lỗi!', 'danger'));
    };
}

export function changeDmTapChi(item) {
    return { type: DmTapChiUpdate, item };
}

export const SelectAdapter_DmTapChi = {
    ajax: true,
    url: '/api/danh-muc/tap-chi/page/1/20',
    getOne: getDmTapChi,
    data: params => ({ condition: params.term }),
    processResults: data => ({ results: data && data.page && data.page.list ? data.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    processResultOne: data => (data ? { value: data.ma, text: data.ma + ': ' + data.ten } : {})
};