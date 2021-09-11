import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmKyLuatGetAll = 'DmKyLuat:GetAll';
const DmKyLuatGetPage = 'DmKyLuat:GetPage';
const DmKyLuatUpdate = 'DmKyLuat:Update';

export default function DmKyLuatReducer(state = null, data) {
    switch (data.type) {
        case DmKyLuatGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmKyLuatGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmKyLuatUpdate:
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
export function getDmKyLuatAll(done) {
    return dispatch => {
        const url = '/api/dm-ky-luat/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách hình thức kỷ luật bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmKyLuatGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách hình thức kỷ luật bị lỗi!', 'danger'));
    };
}

T.initPage('pageDmKyLuat');
export function getDmKyLuatPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmKyLuat', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/dm-ky-luat/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách hình thức kỷ luật bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmKyLuatGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách hình thức kỷ luật bị lỗi!', 'danger'));
    };
}

export function getDmKyLuat(_id, done) {
    return () => {
        const url = `/api/dm-ky-luat/item/${_id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin hình thức kỷ luật bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function createDmKyLuat(item, done) {
    return dispatch => {
        const url = '/api/dm-ky-luat';
        T.post(url, { item }, data => {
            if (data.error) {
                if (data.error.errorNum == 1) {
                    return T.notify('Tạo hình thức kỷ luật không được trùng mã', 'danger');
                }
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmKyLuatAll());
                if (done) done(data);
            }
        }, () => T.notify('Tạo hình thức kỷ luật bị lỗi!', 'danger'));
    };
}

export function deleteDmKyLuat(ma) {
    return dispatch => {
        const url = '/api/dm-ky-luat';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa hình thức kỷ luật bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Khoa đã xóa thành công!', 'success', false, 800);
                dispatch(getDmKyLuatAll());
            }
        }, () => T.notify('Xóa hình thức kỷ luật bị lỗi!', 'danger'));
    };
}

export function updateDmKyLuat(ma, changes, done) {
    return dispatch => {
        const url = '/api/dm-ky-luat';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông hình thức kỷ luật bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin hình thức kỷ luật thành công!', 'success');
                dispatch(getDmKyLuatAll());
            }
        }, () => T.notify('Cập nhật thông tin hình thức kỷ luật bị lỗi!', 'danger'));
    };
}

export function changeDmKyLuat(item) {
    return { type: DmKyLuatUpdate, item };
}

export const SelectAdapter_DmKyLuat = {
    ajax: false,
    getAll: getDmKyLuatAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    condition: { kichHoat: 1 },
};