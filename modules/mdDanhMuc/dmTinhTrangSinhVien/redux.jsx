import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmTinhTrangSinhVienGetAll = 'DmTinhTrangSinhVien:GetAll';
const DmTinhTrangSinhVienGetPage = 'DmTinhTrangSinhVien:GetPage';
const DmTinhTrangSinhVienUpdate = 'DmTinhTrangSinhVien:Update';

export default function DmTinhTrangSinhVienReducer(state = null, data) {
    switch (data.type) {
        case DmTinhTrangSinhVienGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmTinhTrangSinhVienGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmTinhTrangSinhVienUpdate:
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
export const PageName = 'pageDmTinhTrangSinhVien';
T.initPage(PageName);
export function getDmTinhTrangSinhVienPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/tinh-trang-sinh-vien/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách tình trạng sinh viên bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmTinhTrangSinhVienGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách tình trạng sinh viên bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmTinhTrangSinhVienAll(condition, done) {
    return dispatch => {
        const url = '/api/danh-muc/tinh-trang-sinh-vien/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách tình trạng sinh viên bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmTinhTrangSinhVienGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách tình trạng sinh viên bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmTinhTrangSinhVien(ma, done) {
    return () => {
        const url = `/api/danh-muc/tinh-trang-sinh-vien/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin tình trạng sinh viên bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmTinhTrangSinhVien(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/tinh-trang-sinh-vien';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo tình trạng sinh viên bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo thông tin tình trạng sinh viên thành công!', 'success');
                dispatch(getDmTinhTrangSinhVienPage());
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo tình trạng sinh viên bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmTinhTrangSinhVien(ma) {
    return dispatch => {
        const url = '/api/danh-muc/tinh-trang-sinh-vien';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục tình trạng sinh viên bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmTinhTrangSinhVienPage());
            }
        }, (error) => T.notify('Xóa tình trạng sinh viên bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmTinhTrangSinhVien(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/tinh-trang-sinh-vien';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin tình trạng sinh viên bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin tình trạng sinh viên thành công!', 'success');
                done && done(data.item);
                dispatch(getDmTinhTrangSinhVienPage());
            }
        }, (error) => T.notify('Cập nhật thông tin tình trạng sinh viên bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function changeDmTinhTrangSinhVien(item) {
    return { type: DmTinhTrangSinhVienUpdate, item };
}

export const SelectAdapter_DmTinhTrangSinhVien = {
    ajax: false,
    getAll: getDmTinhTrangSinhVienAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    condition: { kichHoat: 1 },
};

export const SelectAdapter_DmTinhTrangSinhVienV2 = {
    ajax: true,
    data: params => ({ condition: params.term, kichHoat: 1 }),
    url: '/api/danh-muc/tinh-trang-sinh-vien/page/1/20',
    getOne: getDmTinhTrangSinhVien,
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDmTinhTrangSinhVien(ma, item => done && done({ id: item.ma, text: item.ten })))(),
    processResultOne: response => response && ({ value: response.ma, text: response.ten }),
};