import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmTrinhDoQuanLyNhaNuocGetAll = 'DmTrinhDoQuanLyNhaNuoc:GetAll';
const DmTrinhDoQuanLyNhaNuocGetPage = 'DmTrinhDoQuanLyNhaNuoc:GetPage';
const DmTrinhDoQuanLyNhaNuocUpdate = 'DmTrinhDoQuanLyNhaNuoc:Update';

export default function DmTrinhDoQuanLyNhaNuocReducer(state = null, data) {
    switch (data.type) {
        case DmTrinhDoQuanLyNhaNuocGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmTrinhDoQuanLyNhaNuocGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmTrinhDoQuanLyNhaNuocUpdate:
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
T.initPage('pageDmTrinhDoQuanLyNhaNuoc');
export function getDmTrinhDoQuanLyNhaNuocPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmTrinhDoQuanLyNhaNuoc', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/trinh-do-quan-ly-nha-nuoc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách trình độ quản lý nhà nước bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmTrinhDoQuanLyNhaNuocGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách chức vụ bị lỗi!', 'danger'));
    }
}

export function dmTrinhDoQuanLyNhaNuocGetAll(condition, done) {
    return dispatch => {
        const url = `/api/danh-muc/trinh-do-quan-ly-nha-nuoc/all`;
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách trình độ quản lý nhà nước lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmTrinhDoQuanLyNhaNuocGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách trình độ quản lý nhà nước bị lỗi!', 'danger'));
    }
}

export function createDmTrinhDoQuanLyNhaNuoc(item, done) {
    return dispatch => {
        const url = `/api/danh-muc/trinh-do-quan-ly-nha-nuoc`;
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo dữ liệu bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmTrinhDoQuanLyNhaNuocPage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo dữ liệu bị lỗi!', 'danger'));
    }
}

export function deleteDmTrinhDoQuanLyNhaNuoc(ma) {
    return dispatch => {
        const url = `/api/danh-muc/trinh-do-quan-ly-nha-nuoc`;
        T.delete(url, { ma }, data => {
            if (data.error) {
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                dispatch(getDmTrinhDoQuanLyNhaNuocPage());
            }
        }, error => T.notify('Xóa dữ liệu bị lỗi!', 'danger'));
    }
}

export function updateDmTrinhDoQuanLyNhaNuoc(ma, changes, done) {
    return dispatch => {
        const url = `/api/danh-muc/trinh-do-quan-ly-nha-nuoc`;
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật dữ liệu bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật dữ liệu thành công!', 'success');
                done && done(data.item);
                dispatch(getDmTrinhDoQuanLyNhaNuocPage());
            }
        }, error => T.notify('Cập nhật dữ liệu bị lỗi!', 'danger'));
    }
}

export const SelectAdapter_DmTrinhDoQuanLyNhaNuoc = {
    ajax: false,
    getAll: dmTrinhDoQuanLyNhaNuocGetAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    condition: { kichHoat: 1 },
}