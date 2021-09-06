import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmTaiKhoanKeToanGetAll = 'DmTaiKhoanKeToan:GetAll';
const DmTaiKhoanKeToanGetPage = 'DmTaiKhoanKeToan:GetPage';
const DmTaiKhoanKeToanUpdate = 'DmTaiKhoanKeToan:Update';

export default function DmTaiKhoanKeToanReducer(state = null, data) {
    switch (data.type) {
        case DmTaiKhoanKeToanGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmTaiKhoanKeToanGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmTaiKhoanKeToanUpdate:
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
export const PageName = 'pageDmTaiKhoanKeToan';
T.initPage(PageName);
export function getDmTaiKhoanKeToanPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/tai-khoan-ke-toan/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách Tài Khoản Kế Toán bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmTaiKhoanKeToanGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách Tài Khoản Kế Toán bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function getDmTaiKhoanKeToanAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/tai-khoan-ke-toan/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách Tài Khoản Kế Toán bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmTaiKhoanKeToanGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách Tài Khoản Kế Toán bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function getDmTaiKhoanKeToan(ma, done) {
    return () => {
        const url = `/api/danh-muc/tai-khoan-ke-toan/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin Tài Khoản Kế Toán bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmTaiKhoanKeToan(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/tai-khoan-ke-toan';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo Tài Khoản Kế Toán bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmTaiKhoanKeToanPage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo Tài Khoản Kế Toán bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function updateDmTaiKhoanKeToan(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/tai-khoan-ke-toan';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin Tài Khoản Kế Toán bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin Tài Khoản Kế Toán thành công!', 'success');
                dispatch(getDmTaiKhoanKeToanPage());
            }
        }, error => T.notify('Cập nhật thông tin Tài Khoản Kế Toán bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function deleteDmTaiKhoanKeToan(ma) {
    return dispatch => {
        const url = '/api/danh-muc/tai-khoan-ke-toan';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục Tài Khoản Kế Toán bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Khoa đã xóa thành công!', 'success', false, 800);
                dispatch(getDmTaiKhoanKeToanPage());
            }
        }, error => T.notify('Xóa Tài Khoản Kế Toán bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function changeDmTaiKhoanKeToan(item) {
    return { type: DmTaiKhoanKeToanUpdate, item };
}

export function createDmTaiKhoanKeToanByUpload(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/tai-khoan-ke-toan/createFromFile';
        T.post(url, { item }, data => {
            if (data.error) {
                console.error(`POST: ${url}.`, data.error);
            }
            dispatch(getDmTaiKhoanKeToanPage());
            if (done) done(data);

        }, () => T.notify('Tạo danh mục Tài Khoản Kế Toán bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_DmTaiKhoanKeToan = {
    ajax: true,
    url: '/api/danh-muc/tai-khoan-ke-toan/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: `${item.ma}: ${item.tenTaiKhoan}` })) : [] }),
    getOne: getDmTaiKhoanKeToan,
    processResultOne: response => response && ({ value: response.ma, text: `${response.ma}:${response.tenTaiKhoan}` }),
};