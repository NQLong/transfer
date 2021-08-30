import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmHoiNghiGetAll = 'DmHoiNghi:GetAll';
const DmHoiNghiGetPage = 'DmHoiNghi:GetPage';
const DmHoiNghiUpdate = 'DmHoiNghi:Update';

export default function DmHoiNghiReducer(state = null, data) {
    switch (data.type) {
        case DmHoiNghiGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmHoiNghiGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmHoiNghiUpdate:
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
                return Object.assign({}, state, { items: updatedItems, page: updatedPage })
            } else {
                return null;
            }
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageDmHoiNghi');
export function getDmHoiNghiPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmHoiNghi', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/hoi-nghi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách hội nghị bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmHoiNghiGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách hội nghị bị lỗi!', 'danger'));
    }
}

export function getDmHoiNghiAll(done) {
    return dispatch => {
        const url = `/api/danh-muc/hoi-nghi/all`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách hội nghị bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmHoiNghiGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách hội nghị bị lỗi!', 'danger'));
    }
}

export function getDmHoiNghi(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/hoi-nghi/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin hội nghị bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    }
}

export function createDmHoiNghi(item, done) {
    return dispatch => {
        const url = `/api/danh-muc/hoi-nghi`;
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo hội nghị bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmHoiNghiAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo hội nghị bị lỗi!', 'danger'));
    }
}

export function deleteDmHoiNghi(ma) {
    return dispatch => {
        const url = `/api/danh-muc/hoi-nghi`;
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục hội nghị bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmHoiNghiAll());
            }
        }, error => T.notify('Xóa hội nghị bị lỗi!', 'danger'));
    }
}

export function updateDmHoiNghi(ma, changes, done) {
    return dispatch => {
        const url = `/api/danh-muc/hoi-nghi`;
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin hội nghị bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin hội nghị thành công!', 'success');
                dispatch(getDmHoiNghiAll());
            }
        }, error => T.notify('Cập nhật thông tin hội nghị bị lỗi!', 'danger'));
    }
}

export function changeDmHoiNghi(item) {
    return { type: DmHoiNghiUpdate, item };
}

export const SelectAdapter_DmHoiNghi = {
    ajax: true,
    url: '/api/danh-muc/hoi-nghi/page/1/20',
    getOne: getDmHoiNghi,
    data: params => ({ condition: params.term }),
    processResults: data => ({ results: data && data.page && data.page.list ? data.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    processResultOne: data => (data ? { value: data.ma, text: data.ma + ': ' + data.ten } : {})
}