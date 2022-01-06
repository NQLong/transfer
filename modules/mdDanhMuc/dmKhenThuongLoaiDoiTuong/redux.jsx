import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmKhenThuongLoaiDoiTuongGetAll = 'DmKhenThuongLoaiDoiTuong:GetAll';
const DmKhenThuongLoaiDoiTuongGetPage = 'DmKhenThuongLoaiDoiTuong:GetPage';
const DmKhenThuongLoaiDoiTuongUpdate = 'DmKhenThuongLoaiDoiTuong:Update';

export default function DmKhenThuongLoaiDoiTuongReducer(state = null, data) {
    switch (data.type) {
        case DmKhenThuongLoaiDoiTuongGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmKhenThuongLoaiDoiTuongGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmKhenThuongLoaiDoiTuongUpdate:
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
T.initPage('pageDmKhenThuongLoaiDoiTuong');
export function getDmKhenThuongLoaiDoiTuongPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDmKhenThuongLoaiDoiTuong', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/khen-thuong-loai-doi-tuong/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách khen thưởng loại đối tượng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmKhenThuongLoaiDoiTuongGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách khen thưởng loại đối tượng bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function getDmKhenThuongLoaiDoiTuongAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/khen-thuong-loai-doi-tuong/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách khen thưởng loại đối tượng lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmKhenThuongLoaiDoiTuongGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách khen thưởng loại đối tượng bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function createDmKhenThuongLoaiDoiTuong(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/khen-thuong-loai-doi-tuong';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo dữ liệu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới dữ liệu thành công!', 'success');
                dispatch(getDmKhenThuongLoaiDoiTuongPage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo dữ liệu bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function deleteDmKhenThuongLoaiDoiTuong(ma) {
    return dispatch => {
        const url = '/api/danh-muc/khen-thuong-loai-doi-tuong';
        T.delete(url, { ma }, data => {
            if (data.error) {
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Xóa dữ liệu thành công!', 'success');
                dispatch(getDmKhenThuongLoaiDoiTuongPage());
            }
        }, error => T.notify('Xóa dữ liệu bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function updateDmKhenThuongLoaiDoiTuong(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/khen-thuong-loai-doi-tuong';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật dữ liệu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật dữ liệu thành công!', 'success');
                done && done(data.item);
                dispatch(getDmKhenThuongLoaiDoiTuongPage());
            }
        }, error => T.notify('Cập nhật dữ liệu bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export const SelectAdapter_DmKhenThuongLoaiDoiTuong = {
    ajax: false,
    getAll: getDmKhenThuongLoaiDoiTuongAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
};