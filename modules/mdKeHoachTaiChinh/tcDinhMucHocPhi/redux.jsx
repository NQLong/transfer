import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TcDinhMucHocPhiGetAll = 'TcDinhMucHocPhi:GetAll';
const TcDinhMucHocPhiGetPage = 'TcDinhMucHocPhi:GetPage';
const TcDinhMucHocPhiUpdate = 'TcDinhMucHocPhi:Update';
const TcDinhMucHocPhiBy = 'TcDinhMucHocPhi:GetBy';

export default function TcDinhMucHocPhiReducer(state = null, data) {
    switch (data.type) {
        case TcDinhMucHocPhiBy:
            return Object.assign({}, state, { item: data.item });
        case TcDinhMucHocPhiGetAll:
            return Object.assign({}, state, { items: data.items });
        case TcDinhMucHocPhiGetPage:
            return Object.assign({}, state, { page: data.page });
        case TcDinhMucHocPhiUpdate:
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
export const PageName = 'pageTcDinhMucHocPhi';
T.initPage(PageName);

export function getTcDinhMucHocPhiPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/finance/dinh-muc-hoc-phi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách định mức học phí bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: TcDinhMucHocPhiGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách định mức học phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getTcDinhMucHocPhiBy(filter, done) {
    return dispatch => {
        const url = '/api/finance/dinh-muc-hoc-phi/get-item';
        T.get(url, { filter }, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu lỗi', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: TcDinhMucHocPhiBy, item: result.item });
                done && done(result.item);
            }
        });
    };
}

export function getTcDinhMucHocPhiAll(condition, done) {
    return dispatch => {
        const url = '/api/finance/dinh-muc-hoc-phi/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách định mức học phí bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: TcDinhMucHocPhiGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách định mức học phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getTcDinhMucHocPhi(ma, done) {
    return () => {
        const url = `/api/finance/dinh-muc-hoc-phi/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin định mức học phí bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createTcDinhMucHocPhiMultiple(data, done) {
    return () => {
        const url = '/api/finance/dinh-muc-hoc-phi/multiple';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Tạo định mức học phí bị lỗi', 'danger');
                console.error(`POST: ${url}.`, result.error);
            } else {
                T.notify('Tạo định mức học phí thành công!', 'success');
                done && done(result);
            }
        }, (error) => T.notify('Tạo định mức học phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteTcDinhMucHocPhi(listMa) {
    return dispatch => {
        const url = '/api/finance/dinh-muc-hoc-phi';
        T.delete(url, { listMa }, data => {
            if (data.error) {
                T.notify('Xóa định mức học phí bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Định mức học phí đã xóa thành công!', 'success', false, 800);
                dispatch(getTcDinhMucHocPhiPage());
            }
        }, (error) => T.notify('Xóa định mức học phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateTcDinhMucHocPhi(ma, changes, done) {
    return dispatch => {
        const url = '/api/finance/dinh-muc-hoc-phi';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin định mức học phí bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin định mức học phí thành công!', 'success');
                done && done(data.item);
                dispatch(getTcDinhMucHocPhiPage());
            }
        }, (error) => T.notify('Cập nhật thông tin định mức học phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export const SelectAdapter_TcDinhMucHocPhi = {
    ajax: true,
    data: params => ({ condition: params.term, kichHoat: 1 }),
    url: '/api/finance/dinh-muc-hoc-phi/page/1/20',
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getTcDinhMucHocPhi(ma, item => done && done({ id: item.ma, text: item.ten })))(),
};