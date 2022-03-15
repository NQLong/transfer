import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmLoaiSinhVienGetAll = 'DmLoaiSinhVien:GetAll';
const DmLoaiSinhVienGetPage = 'DmLoaiSinhVien:GetPage';
const DmLoaiSinhVienUpdate = 'DmLoaiSinhVien:Update';

export default function DmLoaiSinhVienReducer(state = null, data) {
    switch (data.type) {
        case DmLoaiSinhVienGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmLoaiSinhVienGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmLoaiSinhVienUpdate:
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
export const PageName = 'pageDmLoaiSinhVien';
T.initPage(PageName);
export function getDmLoaiSinhVienPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/loai-sinh-vien/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại sinh viên bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmLoaiSinhVienGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách loại sinh viên bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmLoaiSinhVienAll(condition, done) {
    return dispatch => {
        const url = '/api/danh-muc/loai-sinh-vien/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại sinh viên bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmLoaiSinhVienGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách loại sinh viên bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmLoaiSinhVien(ma, done) {
    return () => {
        const url = `/api/danh-muc/loai-sinh-vien/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin loại sinh viên bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmLoaiSinhVien(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/loai-sinh-vien';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo loại sinh viên bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo thông tin loại sinh viên thành công!', 'success');
                dispatch(getDmLoaiSinhVienPage());
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo loại sinh viên bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmLoaiSinhVien(ma) {
    return dispatch => {
        const url = '/api/danh-muc/loai-sinh-vien';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục loại sinh viên bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmLoaiSinhVienPage());
            }
        }, (error) => T.notify('Xóa loại sinh viên bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmLoaiSinhVien(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/loai-sinh-vien';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin loại sinh viên bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin loại sinh viên thành công!', 'success');
                done && done(data.item);
                dispatch(getDmLoaiSinhVienPage());
            }
        }, (error) => T.notify('Cập nhật thông tin loại sinh viên bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function changeDmLoaiSinhVien(item) {
    return { type: DmLoaiSinhVienUpdate, item };
}

export const SelectAdapter_DmLoaiSinhVien = {
    ajax: false,
    getAll: getDmLoaiSinhVienAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    condition: { kichHoat: 1 },
};

export const SelectAdapter_DmLoaiSinhVienV2 = {
    ajax: true,
    data: params => ({ condition: params.term, kichHoat: 1 }),
    url: '/api/danh-muc/loai-sinh-vien/page/1/20',
    getOne: getDmLoaiSinhVien,
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDmLoaiSinhVien(ma, item => done && done({ id: item.ma, text: item.ten })))(),
    processResultOne: response => response && ({ value: response.ma, text: response.ten }),
};