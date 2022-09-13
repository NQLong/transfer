import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TcLoaiPhiGetAll = 'TcLoaiPhi:GetAll';
const TcLoaiPhiGetPage = 'TcLoaiPhi:GetPage';
const TcLoaiPhiUpdate = 'TcLoaiPhi:Update';

export default function TcLoaiPhiReducer(state = null, data) {
    switch (data.type) {
        case TcLoaiPhiGetAll:
            return Object.assign({}, state, { items: data.items });
        case TcLoaiPhiGetPage:
            return Object.assign({}, state, { page: data.page });
        case TcLoaiPhiUpdate:
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
export const PageName = 'pageTcLoaiPhi';
T.initPage(PageName);
export function getTcLoaiPhiPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/finance/loai-phi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại phí bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: TcLoaiPhiGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách loại phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getTcLoaiPhiAll(condition, done) {
    return dispatch => {
        const url = '/api/finance/loai-phi/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại phí bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: TcLoaiPhiGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách loại phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getTcLoaiPhi(id, done) {
    return () => {
        const url = `/api/finance/loai-phi/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin loại phí bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createTcLoaiPhi(item, done) {
    return dispatch => {
        const url = '/api/finance/loai-phi';
        T.post(url, { data: item }, data => {
            if (data.error) {
                T.notify('Tạo loại phí bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo thông tin loại phí thành công!', 'success');
                dispatch(getTcLoaiPhiPage());
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo loại phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteTcLoaiPhi(id) {
    return dispatch => {
        const url = '/api/finance/loai-phi';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa danh mục loại phí bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getTcLoaiPhiPage());
            }
        }, (error) => T.notify('Xóa loại phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateTcLoaiPhi(id, changes, done) {
    return dispatch => {
        const url = '/api/finance/loai-phi';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin loại phí bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin loại phí thành công!', 'success');
                done && done(data.item);
                dispatch(getTcLoaiPhiPage());
            }
        }, (error) => T.notify('Cập nhật thông tin loại phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export const SelectAdapter_TcLoaiPhi = {
    ajax: true,
    data: params => ({ condition: params.term, kichHoat: 1 }),
    url: '/api/finance/loai-phi/page/1/20',
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: item.ten })) : [] }),
    fetchOne: (id, done) => (getTcLoaiPhi(id, item => done && done({ id: item.id, text: item.ten })))(),
};

export function apply(data, done, onError) {
    return () => {
        const url = '/api/finance/loai-phi/ap-dung';
        T.post(url, data, (res) => {
            if (res.error) {
                T.notify(res.error.message || 'Áp dụng loại phí thất bại', 'danger');
                console.error('POST: ' + url, res.error);
                onError && onError();
            }
            else {
                T.notify('Áp dụng loại phí thành công' + (res.sum != null ? ` (${res.sum} sinh viên)` : ''), 'success');
                done && done();
            }
        }, () => T.notify('Áp dụng loại phí thất bại', 'danger'));
    };
}