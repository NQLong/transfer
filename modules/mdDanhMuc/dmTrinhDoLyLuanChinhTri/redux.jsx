import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmTrinhDoLyLuanChinhTriGetAll = 'DmTrinhDoLyLuanChinhTri:GetAll';
const DmTrinhDoLyLuanChinhTriGetPage = 'DmTrinhDoLyLuanChinhTri:GetPage';
const DmTrinhDoLyLuanChinhTriUpdate = 'DmTrinhDoLyLuanChinhTri:Update';

export default function DmTrinhDoLyLuanChinhTriReducer(state = null, data) {
    switch (data.type) {
        case DmTrinhDoLyLuanChinhTriGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmTrinhDoLyLuanChinhTriGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmTrinhDoLyLuanChinhTriUpdate:
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
T.initPage('pageDmTrinhDoLyLuanChinhTri');
export function getDmTrinhDoLyLuanChinhTriPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmTrinhDoLyLuanChinhTri', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/trinh-do-ly-luan-chinh-tri/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách trình độ lý luận chính trị bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmTrinhDoLyLuanChinhTriGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách ca học bị lỗi!', 'danger'));
    }
}

export function getDmTrinhDoLyLuanChinhTriAll(condition, done) {
    return dispatch => {
        const url = `/api/danh-muc/trinh-do-ly-luan-chinh-tri/all`;
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách trình độ lý luận chính trị bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmTrinhDoLyLuanChinhTriGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách trình độ lý luận chính trị bị lỗi!', 'danger'));
    }
}

export function getDmTrinhDoLyLuanChinhTri(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/trinh-do-ly-luan-chinh-tri/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin trình độ lý luận chính trị bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    }
}

export function createDmTrinhDoLyLuanChinhTri(item, done) {
    return dispatch => {
        const url = `/api/danh-muc/trinh-do-ly-luan-chinh-tri`;
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo trình độ lý luận chính trị bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmTrinhDoLyLuanChinhTriAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo trình độ lý luận chính trị bị lỗi!', 'danger'));
    }
}

export function deleteDmTrinhDoLyLuanChinhTri(ma) {
    return dispatch => {
        const url = `/api/danh-muc/trinh-do-ly-luan-chinh-tri`;
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục trình độ lý luận chính trị bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmTrinhDoLyLuanChinhTriAll());
            }
        }, error => T.notify('Xóa trình độ lý luận chính trị bị lỗi!', 'danger'));
    }
}

export function updateDmTrinhDoLyLuanChinhTri(ma, changes, done) {
    return dispatch => {
        const url = `/api/danh-muc/trinh-do-ly-luan-chinh-tri`;
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin trình độ lý luận chính trị bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin trình độ lý luận chính trị thành công!', 'success');
                dispatch(getDmTrinhDoLyLuanChinhTriAll());
            }
        }, error => T.notify('Cập nhật thông tin trình độ lý luận chính trị bị lỗi!', 'danger'));
    }
}

export function changeDmTrinhDoLyLuanChinhTri(item) {
    return { type: DmTrinhDoLyLuanChinhTriUpdate, item };
}

export const SelectAdapter_DmTrinhDoLyLuanChinhTri = {
    ajax: false,
    getAll: getDmTrinhDoLyLuanChinhTriAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    condition: { kichHoat: 1 },
}