import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmTrinhDoGetAll = 'DmTrinhDo:GetAll';
const DmTrinhDoGetPage = 'DmTrinhDo:GetPage';
const DmTrinhDoUpdate = 'DmTrinhDo:Update';

export default function dmTrinhDoReducer(state = null, data) {
    switch (data.type) {
        case DmTrinhDoGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmTrinhDoGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmTrinhDoUpdate:
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
T.initPage('dmTrinhDoPage', true);
export function getDmTrinhDoPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmTrinhDoPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/trinh-do/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách trình độ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmTrinhDoGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách trình độ bị lỗi!', 'danger'));
    }
}

export function getDmTrinhDoAll(done) {
    return dispatch => {
        const url = `/api/danh-muc/trinh-do/all`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách trình độ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmTrinhDoGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách trình độ bị lỗi!', 'danger'));
    }
}

export function getDmTrinhDo(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/trinh-do/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin trình độ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    }
}

export function createDmTrinhDo(dmTrinhDo, done) {
    return dispatch => {
        const url = '/api/danh-muc/trinh-do';
        T.post(url, { dmTrinhDo }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một trình độ bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmTrinhDoAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo mới một trình độ bị lỗi!', 'danger'));
    }
}

export function updateDmTrinhDo(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/trinh-do';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu trình độ bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                done && done(data.item);
                dispatch(getDmTrinhDoAll());
            }
        }, () => T.notify('Cập nhật dữ liệu trình độ bị lỗi!', 'danger'));
    }
}

export function deleteDmTrinhDo(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/trinh-do`;
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa trình độ bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa trình độ thành công!', 'success', false, 800);
                dispatch(getDmTrinhDoAll());
            }
            done && done();
        }, error => T.notify('Xóa trình độ bị lỗi!', 'danger'));
    }
}

export const SelectAdapter_DmTrinhDo = {
    ajax: false,
    getAll: getDmTrinhDoAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    condition: { kichHoat: 1 },
}
