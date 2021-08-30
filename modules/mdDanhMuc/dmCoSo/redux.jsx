import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmCoSoGetAll = 'DmCoSo:GetAll';
const DmCoSoGetPage = 'DmCoSo:GetPage';
const DmCoSoUpdate = 'DmCoSo:Update';

export default function dmCoSoReducer(state = null, data) {
    switch (data.type) {
        case DmCoSoGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmCoSoGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmCoSoUpdate:
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
export function getDmCoSoAll(done) {
    return dispatch => {
        const url = `/api/danh-muc/co-so/all`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách cơ sở trường đại học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmCoSoGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách cơ sở trường đại học bị lỗi!', 'danger'));
    }
}

T.initPage('pageDmCoSo');
export function getDmCoSoPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmCoSo', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/co-so/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách cơ sở trường đại học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmCoSoGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách cơ sở trường đại học bị lỗi!', 'danger'));
    }
}

export function getDmCoSo(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/co-so/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin cơ sở trường đại học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    }
}

export function createDmCoSo(item, done) {
    return dispatch => {
        const url = `/api/danh-muc/co-so`;
        T.post(url, { item }, data => {
            if (data.error) {
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmCoSoAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo cơ sở trường đại học bị lỗi!', 'danger'));
    }
}

export function deleteDmCoSo(ma) {
    return dispatch => {
        const url = `/api/danh-muc/co-so`;
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục  bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Khoa đã xóa thành công!', 'success', false, 800);
                dispatch(getDmCoSoAll());
            }
        }, error => T.notify('Xóa cơ sở trường đại học bị lỗi!', 'danger'));
    }
}

export function updateDmCoSo(ma, changes, done) {
    return dispatch => {
        const url = `/api/danh-muc/co-so`;
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông cơ sở trường đại học bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin cơ sở trường đại học thành công!', 'success');
                dispatch(getDmCoSoAll());
            }
        }, error => T.notify('Cập nhật thông tin cơ sở trường đại học bị lỗi!', 'danger'));
    }
}

export function changeDmCoSo(item) {
    return { type: DmCoSoUpdate, item };
}