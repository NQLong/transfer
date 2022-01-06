import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmChucDanhChuyenMonGetAll = 'DmChucDanhChuyenMon:GetAll';
const DmChucDanhChuyenMonGetPage = 'DmChucDanhChuyenMon:GetPage';
const DmChucDanhChuyenMonUpdate = 'DmChucDanhChuyenMon:Update';

export default function DmChucDanhChuyenMonReducer(state = null, data) {
    switch (data.type) {
        case DmChucDanhChuyenMonGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmChucDanhChuyenMonGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmChucDanhChuyenMonUpdate:
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
export function getDmChucDanhChuyenMon(ma, done) {
    return () => {
        const url = `/api/danh-muc/chuc-danh-chuyen-mon/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin chức danh chuyên môn bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function getDmChucDanhChuyenMonAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/chuc-danh-chuyen-mon/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách chức danh chuyên môn lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmChucDanhChuyenMonGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách chức danh chuyên môn bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function createDmChucDanhChuyenMon(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/chuc-danh-chuyen-mon';
        T.post(url, { item }, data => {
            if (data.error) {
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo chức danh chuyên môn thành công!', 'success');
                dispatch(getDmChucDanhChuyenMonAll());
                if (done) done(data);
            }
        }, () => T.notify('Tạo chức danh chuyên môn bị lỗi!', 'danger'));
    };
}

export function deleteDmChucDanhChuyenMon(ma) {
    return dispatch => {
        const url = '/api/danh-muc/chuc-danh-chuyen-mon';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục  bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa chức danh chuyên môn thành công!', 'success', false, 800);
                dispatch(getDmChucDanhChuyenMonAll());
            }
        }, () => T.notify('Xóa chức danh chuyên môn bị lỗi!', 'danger'));
    };
}

export function updateDmChucDanhChuyenMon(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/chuc-danh-chuyen-mon';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông chức danh chuyên môn bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin chức danh chuyên môn thành công!', 'success');
                done && done(data.item);
                dispatch(getDmChucDanhChuyenMonAll());
            }
        }, () => T.notify('Cập nhật thông tin chức danh chuyên môn bị lỗi!', 'danger'));
    };
}


export const SelectAdapter_DmChucDanhChuyenMon = {
    ajax: false,
    getAll: getDmChucDanhChuyenMonAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    condition: { kichHoat: 1 },
};