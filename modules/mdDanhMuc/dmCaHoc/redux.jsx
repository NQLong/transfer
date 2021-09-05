import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmCaHocGetAll = 'DmCaHoc:GetAll';
const DmCaHocGetPage = 'DmCaHoc:GetPage';
const DmCaHocUpdate = 'DmCaHoc:Update';

export default function DmCaHocReducer(state = null, data) {
    switch (data.type) {
        case DmCaHocGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmCaHocGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmCaHocUpdate:
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
T.initPage('pageDmCaHoc');
export function getDmCaHocPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmCaHoc', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/ca-hoc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách ca học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmCaHocGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách ca học bị lỗi!', 'danger'));
    };
}

export function getDmCaHocAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/ca-hoc/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách ca học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmCaHocGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách ca học bị lỗi!', 'danger'));
    };
}

export function getDmCaHoc(_id, done) {
    return dispatch => {
        const url = `/api/danh-muc/ca-hoc/item/${_id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin ca học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmCaHoc(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/ca-hoc';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo ca học bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmCaHocAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo ca học bị lỗi!', 'danger'));
    };
}

export function deleteDmCaHoc(_id) {
    return dispatch => {
        const url = '/api/danh-muc/ca-hoc';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa danh mục ca học bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Khoa đã xóa thành công!', 'success', false, 800);
                dispatch(getDmCaHocAll());
            }
        }, error => T.notify('Xóa ca học bị lỗi!', 'danger'));
    };
}

export function updateDmCaHoc(_id, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/ca-hoc';
        T.put(url, { _id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin ca học bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin ca học thành công!', 'success');
                dispatch(getDmCaHocAll());
            }
        }, error => T.notify('Cập nhật thông tin ca học bị lỗi!', 'danger'));
    };
}

export function changeDmCaHoc(item) {
    return { type: DmCaHocUpdate, item };
}
