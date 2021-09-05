import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmLoaiVienChucGetAll = 'DmLoaiVienChuc:GetAll';
const DmLoaiVienChucGetPage = 'DmLoaiVienChuc:GetPage';
const DmLoaiVienChucUpdate = 'DmLoaiVienChuc:Update';

export default function DmLoaiVienChucReducer(state = null, data) {
    switch (data.type) {
        case DmLoaiVienChucGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmLoaiVienChucGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmLoaiVienChucUpdate:
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
T.initPage('pageDmLoaiVienChuc');

export function getDmLoaiVienChucAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/loai-vien-chuc/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại viên chức bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmLoaiVienChucGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách loại viên chức bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function getDmLoaiVienChucPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmLoaiVienChuc', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/loai-vien-chuc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại viên chức bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmLoaiVienChucGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách loại viên chức bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function getDmLoaiVienChuc(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/loai-vien-chuc/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin loại viên chức bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function createDmLoaiVienChuc(item, done) {
    return dispatch => {

        const url = '/api/danh-muc/loai-vien-chuc';
        T.post(url, { item }, data => {
            if (data.error) {
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo loại viên chức thành công!', 'success');
                dispatch(getDmLoaiVienChucAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo loại viên chức bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function deleteDmLoaiVienChuc(ma) {
    return dispatch => {
        const url = '/api/danh-muc/loai-vien-chuc';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa loại viên chức  bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Loại viên chức đã xóa thành công!', 'success', false, 800);
                dispatch(getDmLoaiVienChucAll());
            }
        }, error => T.notify('Xóa loại viên chức bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function updateDmLoaiVienChuc(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/loai-vien-chuc';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật loại viên chức bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật loại viên chức thành công!', 'success');
                dispatch(getDmLoaiVienChucAll());
            }
        }, error => T.notify('Cập nhật loại viên chức bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function changeDmLoaiVienChuc(item) {
    return { type: DmLoaiVienChucUpdate, item };
}