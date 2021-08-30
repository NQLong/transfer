import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmKhenThuongGetAll = 'DmKhenThuong:GetAll';
const DmKhenThuongGetPage = 'DmKhenThuong:GetPage';
const DmKhenThuongUpdate = 'DmKhenThuong:Update';

export default function DmKhenThuongReducer(state = null, data) {
    switch (data.type) {
        case DmKhenThuongGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmKhenThuongGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmKhenThuongUpdate:
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
export function getDmKhenThuongAll(done) {
    return dispatch => {
        const url = `/api/dm-khen-thuong/all`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách khen thưởng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmKhenThuongGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách khen thưởng bị lỗi!', 'danger'));
    }
}

T.initPage('pageDmKhenThuong');
export function getDmKhenThuongPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmKhenThuong', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/dm-khen-thuong/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách khen thưởng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmKhenThuongGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách khen thưởng bị lỗi!', 'danger'));
    }
}

export function getDmKhenThuong(_id, done) {
    return dispatch => {
        const url = `/api/dm-khen-thuong/item/${_id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin khen thưởng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    }
}

export function createDmKhenThuong(item, done) {
    return dispatch => {
        const url = `/api/dm-khen-thuong`;
        T.post(url, { item }, data => {
            if (data.error) {
                if (data.error.errorNum == 1) {
                    return T.notify('Tạo khen thưởng không được trùng mã', 'danger');
                }
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmKhenThuongAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo khen thưởng bị lỗi!', 'danger'));
    }
}

export function deleteDmKhenThuong(ma) {
    return dispatch => {
        const url = `/api/dm-khen-thuong`;
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục  bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Khen thưởng đã xóa thành công!', 'success', false, 800);
                dispatch(getDmKhenThuongAll());
            }
        }, error => T.notify('Xóa khen thưởng bị lỗi!', 'danger'));
    }
}

export function updateDmKhenThuong(ma, changes, done) {
    return dispatch => {
        const url = `/api/dm-khen-thuong`;
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông khen thưởng bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin khen thưởng thành công!', 'success');
                dispatch(getDmKhenThuongAll());
            }
        }, error => T.notify('Cập nhật thông tin khen thưởng bị lỗi!', 'danger'));
    }
}

export function changeDmKhenThuong(item) {
    return { type: DmKhenThuongUpdate, item };
}

export const SelectAdapter_DmKhenThuong = {
    ajax: true,
    url: '/api/dm-khen-thuong/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    getOne: getDmKhenThuong,
    processResultOne: response => response && ({ value: response.ma, text: response.ma + ': ' + response.ten }),
}