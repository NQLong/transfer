import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmPhanLoaiVienChucGetAll = 'DmPhanLoaiVienChuc:GetAll';
const DmPhanLoaiVienChucGetPage = 'DmPhanLoaiVienChuc:GetPage';
const DmPhanLoaiVienChucUpdate = 'DmPhanLoaiVienChuc:Update';

export default function dmPhanLoaiVienChucReducer(state = null, data) {
    switch (data.type) {
        case DmPhanLoaiVienChucGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmPhanLoaiVienChucGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmPhanLoaiVienChucUpdate:
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
T.initPage('dmPhanLoaiVienChucPage', true);
export function getDmPhanLoaiVienChucPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmPhanLoaiVienChucPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/phan-loai-vien-chuc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách phân loại viên chức bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmPhanLoaiVienChucGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách phân loại viên chức bị lỗi!', 'danger'));
    };
}

export function getDmPhanLoaiVienChucAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/phan-loai-vien-chuc/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách phân loại viên chức bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmPhanLoaiVienChucGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách phân loại viên chức bị lỗi!', 'danger'));
    };
}

export function getDmPhanLoaiVienChuc(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/phan-loai-vien-chuc/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin phân loại viên chức bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmPhanLoaiVienChuc(dmPhanLoaiVienChuc, done) {
    return dispatch => {
        const url = '/api/danh-muc/phan-loai-vien-chuc';
        T.post(url, { dmPhanLoaiVienChuc }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một phân loại viên chức bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmPhanLoaiVienChucPage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo mới một phân loại viên chức bị lỗi!', 'danger'));
    };
}

export function updateDmPhanLoaiVienChuc(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/phan-loai-vien-chuc';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu phân loại viên chức bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                done && done(data.item);
                dispatch(getDmPhanLoaiVienChucPage());
            }
        }, () => T.notify('Cập nhật dữ liệu phân loại viên chức bị lỗi!', 'danger'));
    };
}

export function deleteDmPhanLoaiVienChuc(ma, done) {
    return dispatch => {
        const url = '/api/danh-muc/phan-loai-vien-chuc';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa phân loại viên chức bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa phân loại viên chức thành công!', 'success', false, 800);
                dispatch(getDmPhanLoaiVienChucPage());
            }
            done && done();
        }, error => T.notify('Xóa phân loại viên chức bị lỗi!', 'danger'));
    };
}