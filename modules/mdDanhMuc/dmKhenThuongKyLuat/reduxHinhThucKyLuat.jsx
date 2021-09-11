import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmHinhThucKyLuatGetAll = 'DmHinhThucKyLuat:GetAll';
const DmhinhThucKyLuatGetPage = 'DmHinhThucKyLuat:GetPage';
const DmHinhThucKyLuatUpdate = 'DmHinhThucKyLuat:Update';

export default function DmHinhThucKyLuatReducer(state = null, data) {
    switch (data.type) {
        case DmHinhThucKyLuatGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmhinhThucKyLuatGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmHinhThucKyLuatUpdate:
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
export function getDmHinhThucKyLuatAll(done) {
    return dispatch => {
        const url = '/api/dm-hinh-thuc-ky-luat/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách hình thức kỷ luật bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmHinhThucKyLuatGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách hình thức kỷ luật bị lỗi!', 'danger'));
    };
}

T.initPage('pageDmHinhThucKyLuat');
export function getDmHinhThucKyLuatPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmHinhThucKyLuat', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/dm-hinh-thuc-ky-luat/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách hình thức kỷ luật bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmhinhThucKyLuatGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách hình thức kỷ luật bị lỗi!', 'danger'));
    };
}

export function getDmHinhThucKyLuat(_id, done) {
    return () => {
        const url = `/api/dm-hinh-thuc-ky-luat/item/${_id}`;
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

export function createDmHinhThucKyLuat(item, done) {
    return dispatch => {
        const url = '/api/dm-hinh-thuc-ky-luat';
        T.post(url, { item }, data => {
            if (data.error) {
                if (data.error.errorNum == 1) {
                    return T.notify('Tạo hình thức kỷ luật không được trùng mã', 'danger');
                }
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmHinhThucKyLuatAll());
                if (done) done(data);
            }
        }, () => T.notify('Tạo hình thức kỷ luật bị lỗi!', 'danger'));
    };
}

export function deleteDmHinhThucKyLuat(ma) {
    return dispatch => {
        const url = '/api/dm-hinh-thuc-ky-luat';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục  bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Hình thức kỷ luật đã xóa thành công!', 'success', false, 800);
                dispatch(getDmHinhThucKyLuatAll());
            }
        }, () => T.notify('Xóa hình thức kỷ luật bị lỗi!', 'danger'));
    };
}

export function updateDmHinhThucKyLuat(ma, changes, done) {
    return dispatch => {
        const url = '/api/dm-hinh-thuc-ky-luat';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông hình thức kỷ luật bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin hình thức kỷ luật thành công!', 'success');
                dispatch(getDmHinhThucKyLuatAll());
            }
        }, () => T.notify('Cập nhật thông tin hình thức kỷ luật bị lỗi!', 'danger'));
    };
}

export function changeDmHinhThucKyLuat(item) {
    return { type: DmHinhThucKyLuatUpdate, item };
}

export const SelectAdapter_DmHinhThucKyLuat = {
    ajax: false,
    getAll: getDmHinhThucKyLuatAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.dienGiai })) : [] }),
    condition: { kichHoat: 1 },
};