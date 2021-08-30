import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmLoaiDonViGetAll = 'DmLoaiDonVi:GetAll';
const DmLoaiDonViGetPage = 'DmLoaiDonVi:GetPage';
const DmLoaiDonViUpdate = 'DmLoaiDonVi:Update';

export default function dmLoaiDonViReducer(state = null, data) {
    switch (data.type) {
        case DmLoaiDonViGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmLoaiDonViGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmLoaiDonViUpdate:
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
export function getDmLoaiDonViAll(done) {
    return dispatch => {
        const url = `/api/dm-loai-don-vi/all`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại đơn vị trường đại học bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmLoaiDonViGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách loại đơn vị trường đại học bị lỗi!', 'danger'));
    }
}

T.initPage('pageDmLoaiDonVi');
export function getDmLoaiDonViPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmLoaiDonVi', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/dm-loai-don-vi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại đơn vị trường đại học bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmLoaiDonViGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách loại đơn vị trường đại học bị lỗi!', 'danger'));
    }
}

export function getDmLoaiDonVi(ma, done) {
    return dispatch => {
        const url = `/api/dm-loai-don-vi/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin loại đơn vị trường đại học bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    }
}

export function getDonViById(ma, done) {
    return dispatch => {
        const url = `/dm-don-vi/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin loại đơn vị trường đại học bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    }
}

export function createDmLoaiDonVi(item, done) {
    return dispatch => {
        const url = `/api/dm-loai-don-vi`;
        T.post(url, { item }, data => {
            if (data.error) {
                if (data.error.errorNum == 1) {
                    return T.notify('Tạo loại đơn vị trường đại học không được trùng mã' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                }
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmLoaiDonViAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo loại đơn vị trường đại học bị lỗi!', 'danger'));
    }
}

export function deleteDmLoaiDonVi(ma) {
    return dispatch => {
        const url = `/api/dm-loai-don-vi`;
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục  bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Khoa đã xóa thành công!', 'success', false, 800);
                dispatch(getDmLoaiDonViAll());
            }
        }, error => T.notify('Xóa loại đơn vị trường đại học bị lỗi!', 'danger'));
    }
}

export function updateDmLoaiDonVi(ma, changes, done) {
    return dispatch => {
        const url = `/api/dm-loai-don-vi`;
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông loại đơn vị trường đại học bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin loại đơn vị trường đại học thành công!', 'success');
                dispatch(getDmLoaiDonViAll());
            }
        }, error => T.notify('Cập nhật thông tin loại đơn vị trường đại học bị lỗi!', 'danger'));
    }
}

export function changeDmLoaiDonVi(item) {
    return { type: DmLoaiDonViUpdate, item };
}