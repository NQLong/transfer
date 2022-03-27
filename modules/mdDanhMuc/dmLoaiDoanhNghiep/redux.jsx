import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmLoaiDoanhNghiepGetAll = 'DmLoaiDoanhNghiep:GetAll';
const DmLoaiDoanhNghiepGetPage = 'DmLoaiDoanhNghiep:GetPage';
const DmLoaiDoanhNghiepUpdate = 'DmLoaiDoanhNghiep:Update';

export default function dmLoaiDoanhNghiepReducer(state = null, data) {
    switch (data.type) {
        case DmLoaiDoanhNghiepGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmLoaiDoanhNghiepGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmLoaiDoanhNghiepUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].id == updatedItem.id) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].id == updatedItem.id) {
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
export function getDmLoaiDoanhNghiepAll(done) {
    return dispatch => {
        const url = '/api/dm-loai-doanh-nghiep/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại doanh nghiệp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmLoaiDoanhNghiepGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách loại doanh nghiệp bị lỗi!', 'danger'));
    };
}

T.initPage('pageDmLoaiDoanhNghiep');
export function getDmLoaiDoanhNghiepPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmLoaiDoanhNghiep', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/dm-loai-doanh-nghiep/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại doanh nghiệp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmLoaiDoanhNghiepGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách loại doanh nghiệp bị lỗi!', 'danger'));
    };
}

export function getDmLoaiDoanhNghiep(id, done) {
    return () => {
        const url = `/api/dm-loai-doanh-nghiep/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin loại doanh nghiệp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function getDoanhNghiepById(id, done) {
    return () => {
        const url = `/dm-doanh-nghiep/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin loại doanh nghiệp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function createDmLoaiDoanhNghiep(item, done) {
    return dispatch => {
        const url = '/api/dm-loai-doanh-nghiep';
        T.post(url, { item }, data => {
            if (data.error) {
                if (data.error.errorNum == 1) {
                    return T.notify('Tạo loại doanh nghiệp không được trùng mã' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                }
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.alert('Tạo mới loại doanh nghiệp thành công!', 'success', false, 800);
                dispatch(getDmLoaiDoanhNghiepAll());
                if (done) done(data);
            }
        }, () => T.notify('Tạo loại doanh nghiệp bị lỗi: ', 'danger'));
    };
}

export function deleteDmLoaiDoanhNghiep(id) {
    return dispatch => {
        const url = '/api/dm-loai-doanh-nghiep';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa danh mục  bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa loại doanh nghiệp thành công!', 'success', false, 800);
                dispatch(getDmLoaiDoanhNghiepAll());
            }
        }, () => T.notify('Xóa loại doanh nghiệp bị lỗi: ', 'danger'));
    };
}

export function updateDmLoaiDoanhNghiep(id, changes, done) {
    return dispatch => {
        const url = '/api/dm-loai-doanh-nghiep';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông loại doanh nghiệp bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin loại doanh nghiệp thành công!', 'success');
                done && done(data.item);
                dispatch(getDmLoaiDoanhNghiepAll());
            }
        }, () => T.notify('Cập nhật thông tin loại doanh nghiệp bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_DmLoaiDoanhNghiep = {
    ajax: true,
    data: params => ({ condition: params.term, kichHoat: 1 }),
    url: '/api/dm-loai-doanh-nghiep/page/1/20',
    getOne: getDmLoaiDoanhNghiep,
    processResults: response => ({ results: response && response.page ? response.page.list.map(item => ({ id: item.id, text: item.ten })) : [] }),
    fetchOne: (id, done) => (getDmLoaiDoanhNghiep(id, item => done && done({ id: item.id, text: item.ten })))(),
    processResultOne: response => response && ({ value: response.id, text: response.ten }),
};

export function changeDmLoaiDoanhNghiep(item) {
    return { type: DmLoaiDoanhNghiepUpdate, item };
}