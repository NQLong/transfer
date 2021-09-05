import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmTinhTrangHonNhanAll = 'DmTrinhTrangHonNhan:GetAll';
const DmTinhTrangHonNhanGetPage = 'DmTrinhTrangHonNhan:GetPage';
const DmTinhTrangHonnhaUpdate = 'DmTrinhTrangHonNhan:Update';

export default function DmTinhTrangHonNhanReducer(state = null, data) {
    switch (data.type) {
        case DmTinhTrangHonNhanAll:
            return Object.assign({}, state, { items: data.items });
        case DmTinhTrangHonNhanGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmTinhTrangHonnhaUpdate:
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
export function getDmTinhTrangHonNhanAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/tinh-trang-hon-nhan/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách tình trạng hôn nhân bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmTinhTrangHonNhanAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách tình trạng hôn nhân bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

T.initPage('pageDmTinhTrangHonNhan');
export function getDmTinhTrangHonNhanPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmTinhTrangHonNhan', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/tinh-trang-hon-nhan/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách tình trạng hôn nhân bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmTinhTrangHonNhanGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách tình trạng hôn nhân bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function getDmTinhTrangHonNhan(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/tinh-trang-hon-nhan/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin tình trạng hôn nhân bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function createDmTinhTrangHonNhan(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/tinh-trang-hon-nhan';
        T.post(url, { item }, data => {
            if (data.error) {
                if (data.error.errorNum == 1) {
                    return T.notify('Tạo tình trạng hôn nhân không được trùng mã' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                }
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmTinhTrangHonNhanAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo tình trạng hôn nhân bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function deleteDmTinhTrangHonNhan(ma) {
    return dispatch => {
        const url = '/api/danh-muc/tinh-trang-hon-nhan';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục  bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Khoa đã xóa thành công!', 'success', false, 800);
                dispatch(getDmTinhTrangHonNhanAll());
            }
        }, error => T.notify('Xóa tình trạng hôn nhân bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function updateDmTinhTrangHonNhan(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/tinh-trang-hon-nhan';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tình trạng hôn nhân bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin tình trạng hôn nhân thành công!', 'success');
                dispatch(getDmTinhTrangHonNhanAll());
            }
        }, error => T.notify('Cập nhật thông tin tình trạng hôn nhân bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function changeDmTinhTrangHonNhan(item) {
    return { type: DmTinhTrangHonnhaUpdate, item };
}