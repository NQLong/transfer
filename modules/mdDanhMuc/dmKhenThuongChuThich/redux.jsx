import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmKhenThuongChuThichGetAll = 'DmKhenThuongChuThich:GetAll';
const DmKhenThuongChuThichGetPage = 'DmKhenThuongChuThich:GetPage';
const DmKhenThuongChuThichUpdate = 'DmKhenThuongChuThich:Update';

export default function DmKhenThuongChuThichReducer(state = null, data) {
    switch (data.type) {
        case DmKhenThuongChuThichGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmKhenThuongChuThichGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmKhenThuongChuThichUpdate:
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
T.initPage('pageDmKhenThuongChuThich');
export function getDmKhenThuongChuThichPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDmKhenThuongChuThich', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/khen-thuong-chu-thich/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách khen thưởng chú thích bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmKhenThuongChuThichGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách khen thưởng chú thích bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function getDmKhenThuongChuThich(ma, done) {
    return () => {
        const url = `/api/danh-muc/khen-thuong-chu-thich/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin khen thưởng chú thích lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function getDmKhenThuongChuThichAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/khen-thuong-chu-thich/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách khen thưởng chú thích lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmKhenThuongChuThichGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách khen thưởng chú thích bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function createDmKhenThuongChuThich(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/khen-thuong-chu-thich';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo dữ liệu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới dữ liệu thành công!', 'success');
                if (done) done(data);
                dispatch(getDmKhenThuongChuThichPage());
            }
        }, error => T.notify('Tạo dữ liệu bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function deleteDmKhenThuongChuThich(ma) {
    return dispatch => {
        const url = '/api/danh-muc/khen-thuong-chu-thich';
        T.delete(url, { ma }, data => {
            if (data.error) {
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Xóa dữ liệu thành công!', 'success');
                dispatch(getDmKhenThuongChuThichPage());
            }
        }, error => T.notify('Xóa dữ liệu bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function updateDmKhenThuongChuThich(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/khen-thuong-chu-thich';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật dữ liệu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật dữ liệu thành công!', 'success');
                done && done(data.item);
                dispatch(getDmKhenThuongChuThichPage());
            }
        }, error => T.notify('Cập nhật dữ liệu bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function createMultiDmKhenThuongChuThich(dmKhenThuongChuThich, isOverride, done) {
    return () => {
        const url = '/api/danh-muc/khen-thuong-chu-thich/multiple';
        T.post(url, { dmKhenThuongChuThich, isOverride }, data => {
            if (data.error && data.error.length) {
                T.notify('Cập nhật dữ liệu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error('PUT: ' + url + '. ' + data.error.toString());
            } else {
                done && done(data.item);
            }
        }, error => T.notify('Cập nhật dữ liệu bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export const SelectAdapter_DmKhenThuongChuThich = {
    ajax: false,
    getAll: getDmKhenThuongChuThichAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    // condition: { kichHoat: 1 },
};

export const SelectAdapter_DmKhenThuongChuThichV2 = {
    ajax: true,
    data: params => ({ condition: params.term }),
    url: '/api/danh-muc/khen-thuong-chu-thich/page/1/20',
    getOne: getDmKhenThuongChuThich,
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDmKhenThuongChuThich(ma, item => done && done({ id: item.ma, text: item.ten })))(),
};