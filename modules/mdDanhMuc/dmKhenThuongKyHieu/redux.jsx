import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmKhenThuongKyHieuGetAll = 'DmKhenThuongKyHieu:GetAll';
const DmKhenThuongKyHieuGetPage = 'DmKhenThuongKyHieu:GetPage';
const DmKhenThuongKyHieuUpdate = 'DmKhenThuongKyHieu:Update';

export default function DmKhenThuongKyHieuReducer(state = null, data) {
    switch (data.type) {
        case DmKhenThuongKyHieuGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmKhenThuongKyHieuGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmKhenThuongKyHieuUpdate:
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
T.initPage('pageDmKhenThuongKyHieu');
export function getDmKhenThuongKyHieuPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDmKhenThuongKyHieu', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/khen-thuong-ky-hieu/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách khen thưởng ký hiệu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmKhenThuongKyHieuGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách khen thưởng ký hiệu bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function getDmKhenThuongKyHieuAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/khen-thuong-ky-hieu/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách khen thưởng ký hiệu lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmKhenThuongKyHieuGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách khen thưởng ký hiệu bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function getDmKhenThuongKyHieu(ma, done) {
    return () => {
        const url = `/api/danh-muc/khen-thuong-ky-hieu/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin khen thưởng ký hiệu lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function createDmKhenThuongKyHieu(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/khen-thuong-ky-hieu';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo dữ liệu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới dữ liệu thành công!', 'success');
                dispatch(getDmKhenThuongKyHieuPage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo dữ liệu bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function deleteDmKhenThuongKyHieu(ma) {
    return dispatch => {
        const url = '/api/danh-muc/khen-thuong-ky-hieu';
        T.delete(url, { ma }, data => {
            if (data.error) {
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Xóa dữ liệu thành công!', 'success');
                dispatch(getDmKhenThuongKyHieuPage());
            }
        }, error => T.notify('Xóa dữ liệu bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function updateDmKhenThuongKyHieu(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/khen-thuong-ky-hieu';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật dữ liệu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật dữ liệu thành công!', 'success');
                done && done(data.item);
                dispatch(getDmKhenThuongKyHieuPage());
            }
        }, error => T.notify('Cập nhật dữ liệu bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function createMultiDmKhenThuongKyHieu(dmKhenThuongKyHieu, isOverride, done) {
    return () => {
        const url = '/api/danh-muc/khen-thuong-ky-hieu/multiple';
        T.post(url, { dmKhenThuongKyHieu, isOverride }, data => {
            if (data.error && data.error.length) {
                T.notify('Cập nhật dữ liệu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error('PUT: ' + url + '. ' + data.error.toString());
            } else {
                done && done(data.item);
            }
        }, error => T.notify('Cập nhật dữ liệu bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export const SelectAdapter_DmKhenThuongKyHieu = {
    ajax: false,
    getAll: getDmKhenThuongKyHieuAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    // condition: { kichHoat: 1 },
};

export const SelectAdapter_DmKhenThuongKyHieuV2 = {
    ajax: true,
    data: params => ({ condition: params.term }),
    url: '/api/danh-muc/khen-thuong-ky-hieu/page/1/20',
    getOne: getDmKhenThuongKyHieu,
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }), 
    fetchOne: (ma, done) => (getDmKhenThuongKyHieu(ma, item => done && done({ id: item.ma, text: item.ten })))(),
};
