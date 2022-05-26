import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtDanhSachChuyenNganhGetPage = 'DtDanhSachChuyenNganh:GetPage';
const DtDanhSachChuyenNganhUpdate = 'DtDanhSachChuyenNganh:Update';
const DtDanhSachChuyenNganhDelete = 'DtDanhSachChuyenNganh:Delete';
const DtDanhSachChuyenNganhCreate = 'DtDanhSachChuyenNganh:Create';

export default function DtDanhSachChuyenNganhReducer(state = null, data) {
    switch (data.type) {
        case DtDanhSachChuyenNganhGetPage:
            return Object.assign({}, state, { page: data.page });
        case DtDanhSachChuyenNganhUpdate:
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
        case DtDanhSachChuyenNganhDelete:
            if (state) {
                let
                    updatedPage = Object.assign({}, state.page),
                    deletedItem = data.item;
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].id == deletedItem.id) {
                            updatedPage.list.splice(i, 1);
                            break;
                        }
                    }
                }
                return Object.assign({}, state, { page: updatedPage });
            } else {
                return null;
            }
        case DtDanhSachChuyenNganhCreate:
            if (state) {
                let updatedPage = Object.assign({}, state.page),
                    createdItem = data.item;
                if (updatedPage) {
                    updatedPage.list.unshift(createdItem);
                }
                return Object.assign({}, state, { page: updatedPage });
            } else {
                return null;
            }
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageDtDanhSachChuyenNganh');
export function getDtDanhSachChuyenNganhPage(pageNumber, pageSize, pageCondition) {
    const page = T.updatePage('pageDtDanhSachChuyenNganh', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/dao-tao/danh-sach-chuyen-nganh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, {
            searchTerm: pageCondition.searchTerm,
            filter: {
                donVi: pageCondition.donVi,
                namHoc: pageCondition.nam
            }
        }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chuyên ngành bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: DtDanhSachChuyenNganhGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách chuyên ngành bị lỗi!', 'danger'));
    };
}

export function getDtDanhSachChuyenNganh(id, done) {
    return () => {
        const url = `/api/dao-tao/danh-sach-chuyen-nganh/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin chuyên ngành bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDtDanhSachChuyenNganh(item, done) {
    return dispatch => {
        const url = '/api/dao-tao/danh-sach-chuyen-nganh';
        T.post(url, { data: item }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo chuyên ngành bị lỗi', 'danger');
                console.error(`POST: ${url}.`, data.error);
                if (done) done(data.error);
            } else {
                T.notify('Tạo mới thông tin chuyên ngành thành công!', 'success');
                dispatch({ type: DtDanhSachChuyenNganhCreate, item: data.item });
                if (done) done(data.item);
            }
        }, () => T.notify('Tạo chuyên ngành bị lỗi!', 'danger'));
    };
}

export function deleteDtDanhSachChuyenNganh(id) {
    return dispatch => {
        const url = '/api/dao-tao/danh-sach-chuyen-nganh';
        T.delete(url, { id: id }, data => {
            if (data.error) {
                T.notify('Xóa chuyên ngành bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa chuyên ngành thành công!', 'success', false, 800);
                dispatch({ type: DtDanhSachChuyenNganhDelete, item: { id } });
            }
        }, () => T.notify('Xóa chuyên chuyên ngành bị lỗi!', 'danger'));
    };
}

export function updateDtDanhSachChuyenNganh(id, changes, done) {
    return dispatch => {
        const url = '/api/dao-tao/danh-sach-chuyen-nganh';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật thông tin chuyên ngành bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin chuyên ngành thành công!', 'success');
                dispatch({ type: DtDanhSachChuyenNganhUpdate, item: data.item });
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin chuyên ngành bị lỗi!', 'danger'));
    };
}

export function changeDtDanhSachChuyenNganh(item) {
    return { type: DtDanhSachChuyenNganhUpdate, item };
}

export const SelectAdapter_DtDanhSachChuyenNganh = (maNganh = '', namHoc = '') => {
    return {
        ajax: true,
        url: '/api/dao-tao/danh-sach-chuyen-nganh/page/1/20',
        data: params => ({ searchTerm: params.term, maNganh, namHoc }),
        processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: item.ten })) : [] }),
        fetchOne: (id, done) => (getDtDanhSachChuyenNganh(id, item => done && done({ id: item.id, text: item.ten })))(),
    };
};