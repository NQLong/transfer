import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmPhuongThucTuyenSinhGetAll = 'DmPhuongThucTuyenSinh:GetAll';
const DmPhuongThucTuyenSinhGetPage = 'DmPhuongThucTuyenSinh:GetPage';
const DmPhuongThucTuyenSinhUpdate = 'DmPhuongThucTuyenSinh:Update';

export default function DmPhuongThucTuyenSinhReducer(state = null, data) {
    switch (data.type) {
        case DmPhuongThucTuyenSinhGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmPhuongThucTuyenSinhGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmPhuongThucTuyenSinhUpdate:
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
export const PageName = 'pageDmPhuongThucTuyenSinh';
T.initPage(PageName);
export function getDmPhuongThucTuyenSinhPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/phuong-thuc-tuyen-sinh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách phương thức bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmPhuongThucTuyenSinhGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách phương thức bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmPhuongThucTuyenSinhAll(condition, done) {
    return dispatch => {
        const url = '/api/danh-muc/phuong-thuc-tuyen-sinh/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách phương thức bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmPhuongThucTuyenSinhGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách phương thức bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmPhuongThucTuyenSinh(ma, done) {
    return () => {
        const url = `/api/danh-muc/phuong-thuc-tuyen-sinh/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin phương thức bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmPhuongThucTuyenSinh(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/phuong-thuc-tuyen-sinh';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo phương thức bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo thông tin phương thức thành công!', 'success');
                dispatch(getDmPhuongThucTuyenSinhPage());
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo phương thức bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmPhuongThucTuyenSinh(ma) {
    return dispatch => {
        const url = '/api/danh-muc/phuong-thuc-tuyen-sinh';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục phương thức bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmPhuongThucTuyenSinhPage());
            }
        }, (error) => T.notify('Xóa phương thức bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmPhuongThucTuyenSinh(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/phuong-thuc-tuyen-sinh';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin phương thức bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin phương thức thành công!', 'success');
                done && done(data.item);
                dispatch(getDmPhuongThucTuyenSinhPage());
            }
        }, (error) => T.notify('Cập nhật thông tin phương thức bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function changeDmPhuongThucTuyenSinh(item) {
    return { type: DmPhuongThucTuyenSinhUpdate, item };
}


export const SelectAdapter_DmPhuongThucTuyenSinh = {
    ajax: true,
    data: params => ({ condition: params.term, kichHoat: 1 }),
    url: '/api/danh-muc/phuong-thuc-tuyen-sinh/page/1/20',
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDmPhuongThucTuyenSinh(ma, item => done && done({ id: item.ma, text: item.ten })))(),
};