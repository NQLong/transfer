import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmTrinhDoTinHocGetAll = 'DmTrinhDoTinHoc:GetAll';
const DmTrinhDoTinHocGetPage = 'DmTrinhDoTinHoc:GetPage';
const DmTrinhDoTinHocUpdate = 'DmTrinhDoTinHoc:Update';

export default function DmTrinhDoTinHocReducer(state = null, data) {
    switch (data.type) {
        case DmTrinhDoTinHocGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmTrinhDoTinHocGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmTrinhDoTinHocUpdate:
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
T.initPage('pageDmTrinhDoTinHoc');
export function getDmTrinhDoTinHocPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmTrinhDoTinHoc', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/trinh-do-tin-hoc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách trình độ tin học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmTrinhDoTinHocGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách ca học bị lỗi!', 'danger'));
    };
}

export function getDmTrinhDoTinHocAll(condition, done) {
    return dispatch => {
        const url = '/api/danh-muc/trinh-do-tin-hoc/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách trình độ tin học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmTrinhDoTinHocGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách trình độ tin học bị lỗi!', 'danger'));
    };
}

export function getDmTrinhDoTinHoc(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/trinh-do-tin-hoc/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin trình độ tin học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmTrinhDoTinHoc(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/trinh-do-tin-hoc';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo trình độ tin học bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmTrinhDoTinHocAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo trình độ tin học bị lỗi!', 'danger'));
    };
}

export function deleteDmTrinhDoTinHoc(ma) {
    return dispatch => {
        const url = '/api/danh-muc/trinh-do-tin-hoc';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục trình độ tin học bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmTrinhDoTinHocAll());
            }
        }, error => T.notify('Xóa trình độ tin học bị lỗi!', 'danger'));
    };
}

export function updateDmTrinhDoTinHoc(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/trinh-do-tin-hoc';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin trình độ tin học bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin trình độ tin học thành công!', 'success');
                dispatch(getDmTrinhDoTinHocAll());
            }
        }, error => T.notify('Cập nhật thông tin trình độ tin học bị lỗi!', 'danger'));
    };
}

export function changeDmTrinhDoTinHoc(item) {
    return { type: DmTrinhDoTinHocUpdate, item };
}

export const SelectAdapter_DmTrinhDoTinHoc = {
    ajax: false,
    getAll: getDmTrinhDoTinHocAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    condition: { kichHoat: 1 },
};