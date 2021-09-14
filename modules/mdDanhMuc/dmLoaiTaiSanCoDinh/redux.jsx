import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmLoaiTaiSanCoDinhGetAll = 'DmLoaiTaiSanCoDinh:GetAll';
const DmLoaiTaiSanCoDinhGetPage = 'DmLoaiTaiSanCoDinh:GetPage';
const DmLoaiTaiSanCoDinhUpdate = 'DmLoaiTaiSanCoDinh:Update';

export default function dmLoaiTaiSanCoDinhReducer(state = null, data) {
    switch (data.type) {
        case DmLoaiTaiSanCoDinhGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmLoaiTaiSanCoDinhGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmLoaiTaiSanCoDinhUpdate:
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
export function getDmLoaiTaiSanCoDinhAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/loai-tai-san-co-dinh/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại tài sản cố định bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmLoaiTaiSanCoDinhGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách loại tài sản cố định bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

T.initPage('dmLoaiTaiSanCoDinh', true);
export function getDmLoaiTaiSanCoDinhPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmLoaiTaiSanCoDinh', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/loai-tai-san-co-dinh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại tài sản cố định bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmLoaiTaiSanCoDinhGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách loại tài sản cố định bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmLoaiTaiSanCoDinh(ma, done) {
    return () => {
        const url = `/api/danh-muc/loai-tai-san-co-dinh/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin loại tài sản cố định bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function createDmLoaiTaiSanCoDinh(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/loai-tai-san-co-dinh';
        T.post(url, { item }, data => {
            if (data.error) {
                if (data.error.errorNum == 1) {
                    return T.notify('Tạo loại tài sản cố định không được trùng mã' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                }
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmLoaiTaiSanCoDinhPage());
                T.notify('Tạo mới thông tin loại tài sản cố định thành công!', 'success');
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo loại tài sản cố định bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmLoaiTaiSanCoDinh(ma, done) {
    return dispatch => {
        const url = '/api/danh-muc/loai-tai-san-co-dinh';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục  bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Khoa đã xóa thành công!', 'success', false, 800);
                dispatch(getDmLoaiTaiSanCoDinhPage());
            }
            done && done();
        }, (error) => T.notify('Xóa loại tài sản cố định bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmLoaiTaiSanCoDinh(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/loai-tai-san-co-dinh';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông loại tài sản cố định bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin loại tài sản cố định thành công!', 'success');
                done && done(data.item);
                dispatch(getDmLoaiTaiSanCoDinhPage());
            }
        }, (error) => T.notify('Cập nhật thông tin loại tài sản cố định bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export const SelectAdapter_DmLoaiTaiSanCoDinh = {
    ajax: true,
    url: function (params) {
        let page = params.page || 1;
        return `/api/danh-muc/loai-tai-san-co-dinh/page/${page}/20`;
    },
    data: params => ({ condition: params.term }),
    processResults: function (response, params) {
        params.page = params.page || 1;
        return {
            results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, tenTaiSan: item.ten, text: `${item.ma}: ${item.ten}` })) : [],
            pagination: {
                more: params.page < response.page.pageTotal
            }
        };
    },
    getOne: getDmLoaiTaiSanCoDinh,
    processResultOne: response => response && ({ value: response.ma, text: `${response.ma}:${response.ten}` }),
};
