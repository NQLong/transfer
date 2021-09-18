import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmViTriTuyenDungGetAll = 'DmViTriTuyenDung:GetAll';
const DmViTriTuyenDungGetPage = 'DmViTriTuyenDung:GetPage';
const DmViTriTuyenDungUpdate = 'DmViTriTuyenDung:Update';

export default function DmViTriTuyenDungReducer(state = null, data) {
    switch (data.type) {
        case DmViTriTuyenDungGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmViTriTuyenDungGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmViTriTuyenDungUpdate:
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
T.initPage('pageDmViTriTuyenDung');
export function getDmViTriTuyenDungPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDmViTriTuyenDung', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/vi-tri-tuyen-dung/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách vị trí tuyển dụng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);                
                dispatch({ type: DmViTriTuyenDungGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách vị trí tuyển dụng bị lỗi!', 'danger'));
    };
}

export function getDmViTriTuyenDungAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/vi-tri-tuyen-dung/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách vị trí tuyển dụng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmViTriTuyenDungGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách vị trí tuyển dụng bị lỗi!', 'danger'));
    };
}

export function getDmViTriTuyenDung(ma, done) {
    return () => {
        const url = `/api/danh-muc/vi-tri-tuyen-dung/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin vị trí tuyển dụng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmViTriTuyenDung(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/vi-tri-tuyen-dung';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo vị trí tuyển dụng bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo vị trí tuyển dụng thành công!', 'success');
                dispatch(getDmViTriTuyenDungPage());
                if (done) done(data);
            }
        }, () => T.notify('Tạo vị trí tuyển dụng bị lỗi!', 'danger'));
    };
}

export function deleteDmViTriTuyenDung(ma) {
    return dispatch => {
        const url = '/api/danh-muc/vi-tri-tuyen-dung';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục vị trí tuyển dụng bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmViTriTuyenDungPage());
            }
        }, () => T.notify('Xóa vị trí tuyển dụng bị lỗi!', 'danger'));
    };
}

export function updateDmViTriTuyenDung(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/vi-tri-tuyen-dung';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin vị trí tuyển dụng bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin vị trí tuyển dụng thành công!', 'success');
                done && done(data.item);
                dispatch(getDmViTriTuyenDungPage());
            }
        }, () => T.notify('Cập nhật thông tin vị trí tuyển dụng bị lỗi!', 'danger'));
    };
}

export function changeDmViTriTuyenDung(item) {
    return { type: DmViTriTuyenDungUpdate, item };
}
