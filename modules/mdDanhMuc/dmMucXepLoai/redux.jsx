import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmMucXepLoaiGetAll = 'DmMucXepLoai:GetAll';
const DmMucXepLoaiGetPage = 'DmMucXepLoai:GetPage';
const DmMucXepLoaiUpdate = 'DmMucXepLoai:Update';

export default function DmMucXepLoaiReducer(state = null, data) {
    switch (data.type) {
        case DmMucXepLoaiGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmMucXepLoaiGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmMucXepLoaiUpdate:
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
T.initPage('pageDmMucXepLoai');

export function getDmMucXepLoaiAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/muc-xep-loai/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách mức xếp loại bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmMucXepLoaiGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách mức xếp loại bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmMucXepLoaiPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmMucXepLoai', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/muc-xep-loai/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách mức xếp loại bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmMucXepLoaiGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách mức xếp loại bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmMucXepLoai(ma, done) {
    return () => {
        const url = `/api/danh-muc/muc-xep-loai/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin mức xếp loại bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function createDmMucXepLoai(item, done) {
    return dispatch => {

        const url = '/api/danh-muc/muc-xep-loai';
        T.post(url, { item }, data => {
            if (data.error) {
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mức xếp loại thành công!', 'success');
                dispatch(getDmMucXepLoaiAll());
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo mức xếp loại bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmMucXepLoai(ma) {
    return dispatch => {
        const url = '/api/danh-muc/muc-xep-loai';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa mức xếp loại  bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('mức xếp loại đã xóa thành công!', 'success', false, 800);
                dispatch(getDmMucXepLoaiAll());
            }
        }, (error) => T.notify('Xóa mức xếp loại bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmMucXepLoai(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/muc-xep-loai';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật mức xếp loại bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật mức xếp loại thành công!', 'success');
                dispatch(getDmMucXepLoaiAll());
            }
        }, (error) => T.notify('Cập nhật mức xếp loại bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function changeDmMucXepLoai(item) {
    return { type: DmMucXepLoaiUpdate, item };
}
