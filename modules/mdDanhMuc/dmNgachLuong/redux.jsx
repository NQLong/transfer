import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmNgachLuongGetAll = 'DmNgachLuong:GetAll';
const DmNgachLuongGetPage = 'DmNgachLuong:GetPage';
const DmNgachLuongUpdate = 'DmNgachLuong:Update';

export default function DmNgachLuongReducer(state = null, data) {
    switch (data.type) {
        case DmNgachLuongGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmNgachLuongGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmNgachLuongUpdate:
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
T.initPage('pageDmNgachLuong');
export function getDmNgachLuongPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmNgachLuong', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/ngach-luong/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách ngạch lương bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmNgachLuongGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách ngạch lương bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function getDmNgachLuongAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/ngach-luong/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách ngạch lương bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmNgachLuongGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách ngạch lương bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function getDmNgachLuong(id, done) {
    return dispatch => {
        const url = `/api/danh-muc/ngach-luong/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin ngạch lương bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmNgachLuong(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/ngach-luong';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo ngạch lương bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmNgachLuongAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo ngạch lương bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function deleteDmNgachLuong(idNgach, bac) {
    return dispatch => {
        const url = '/api/danh-muc/ngach-luong';
        T.delete(url, { idNgach, bac }, data => {
            if (data.error) {
                T.notify('Xóa danh mục ngạch lương bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Khoa đã xóa thành công!', 'success', false, 800);
                dispatch(getDmNgachLuongAll());
            }
        }, error => T.notify('Xóa ngạch lương bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function updateDmNgachLuong(idNgach, bac, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/ngach-luong';
        T.put(url, { idNgach, bac, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin ngạch lương bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin ngạch lương thành công!', 'success');
                dispatch(getDmNgachLuongAll());
            }
        }, error => T.notify('Cập nhật thông tin ngạch lương bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function changeDmNgachLuong(item) {
    return { type: DmNgachLuongUpdate, item };
}

export const SelectAdapter_DmNgachLuong = {
    ajax: false,
    getAll: getDmNgachLuongAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.id, text: item.id + ': ' + item.tenNgach })) : [] }),
    condition: { kichHoat: 1 },
};
