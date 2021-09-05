import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmGioiTinhGetAll = 'DmGioiTinh:GetAll';
const DmGioiTinhGetPage = 'DmGioiTinh:GetPage';
const DmGioiTinhUpdate = 'DmGioiTinh:Update';

export default function dmGioiTinhReducer(state = null, data) {
    switch (data.type) {
        case DmGioiTinhGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmGioiTinhGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmGioiTinhUpdate:
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
export const PageName = 'dmGioiTinhPage';
T.initPage(PageName);
export function getDmGioiTinhPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/gioi-tinh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách giới tính bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmGioiTinhGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách giới tính bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function getDmGioiTinhAll(condition, done) {
    return dispatch => {
        const url = '/api/danh-muc/gioi-tinh/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách giới tính bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmGioiTinhGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách giới tính bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function getDmGioiTinh(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/gioi-tinh/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin giới tính bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
                dispatch(changeDmGioiTinh(data.item));
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmGioiTinh(dmGioiTinh, done) {
    return dispatch => {
        const url = '/api/danh-muc/gioi-tinh';
        T.post(url, { dmGioiTinh }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một giới tính bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới giới tính thành công!', 'success');
                dispatch(getDmGioiTinhAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo mới một giới tính bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function updateDmGioiTinh(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/gioi-tinh';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu giới tính bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật giới tính thành công!', 'success');
                done && done(data.item);
                dispatch(getDmGioiTinhAll());
            }
        }, error => T.notify('Cập nhật dữ liệu giới tính bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function deleteDmGioiTinh(ma, done) {
    return dispatch => {
        const url = '/api/danh-muc/gioi-tinh';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa giới tính bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa giới tính thành công!', 'success', false, 800);
                dispatch(getDmGioiTinhAll());
            }
            done && done();
        }, error => T.notify('Xóa giới tính bị lỗi!', 'danger'));
    };
}

export function changeDmGioiTinh(item) {
    return { type: DmGioiTinhUpdate, item };
}

export const SelectAdapter_DmGioiTinh = {
    ajax: false,
    getAll: getDmGioiTinhAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: JSON.parse(item.ten).vi })) : [] }),
    condition: { kichHoat: 1 },
};