import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmPhongGetAll = 'DmPhong:GetAll';
const DmPhongGetPage = 'DmPhong:GetPage';
const DmPhongUpdate = 'DmPhong:Update';

export default function dmPhongReducer(state = null, data) {
    switch (data.type) {
        case DmPhongGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmPhongGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmPhongUpdate:
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
export function getDmPhongAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }

    return dispatch => {
        const url = `/api/danh-muc/phong/all`;
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách phòng học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmPhongGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách phòng học bị lỗi!', 'danger'));
    }
}

T.initPage('dmPhong');
export function getDmPhongPage(pageNumber, pageSize, done) {
    const page = T.updatePage('dmPhong', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/phong/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách phòng học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmPhongGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách phòng học bị lỗi!', 'danger'));
    }
}

export function getDmPhong(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/phong/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin phòng học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    }
}

export function createDmPhong(item, done) {
    return dispatch => {
        const url = `/api/danh-muc/phong`;
        T.post(url, { item }, data => {
            if (data.error) {
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmPhongAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo phòng học bị lỗi!', 'danger'));
    }
}

export function deleteDmPhong(ma) {
    return dispatch => {
        const url = `/api/danh-muc/phong`;
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa phòng học bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xoá thành công!', 'success', false, 800);
                dispatch(getDmPhongAll());
            }
        }, error => T.notify('Xóa phòng học bị lỗi!', 'danger'));
    }
}

export function updateDmPhong(ma, changes, done) {
    return dispatch => {
        const url = `/api/danh-muc/phong`;
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông phòng học bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin phòng học thành công!', 'success');
                dispatch(getDmPhongAll());
            }
        }, error => T.notify('Cập nhật thông tin phòng học bị lỗi!', 'danger'));
    }
}
export function createDmPhongByUpload(item, done) {
    return dispatch => {
        const url = `/api/danh-muc/phong/createFromFile`;
        T.post(url, { item }, data => {
            if (data.error) {
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmPhongAll());
                if (done) done(data);
                T.notify('Import dữ liệu thành công!', 'success');
            }
        }, error => T.notify('Tạo phòng học bị lỗi!', 'danger'));
    }
}

export function changeDmPhong(item) {
    return { type: DmPhongUpdate, item };
}
