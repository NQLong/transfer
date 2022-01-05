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

export const SelectAdapter_DmChucDanhChuyenMon = {
    ajax: false,
    getAll: getDmChucDanhChuyenMonAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    condition: { kichHoat: 1 },
};