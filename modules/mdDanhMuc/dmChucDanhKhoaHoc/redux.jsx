import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmChucDanhKhoaHocGetAll = 'DmChucDanhKhoaHoc:GetAll';
const DmChucDanhKhoaHocGetPage = 'DmChucDanhKhoaHoc:GetPage';
const DmChucDanhKhoaHocUpdate = 'DmChucDanhKhoaHoc:Update';

export default function DmChucDanhKhoaHocReducer(state = null, data) {
    switch (data.type) {
        case DmChucDanhKhoaHocGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmChucDanhKhoaHocGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmChucDanhKhoaHocUpdate:
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
T.initPage('pageDmChucDanhKhoaHoc');
export function getDmChucDanhKhoaHocPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmChucDanhKhoaHoc', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/chuc-danh-khoa-hoc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách chức danh khoa học bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmChucDanhKhoaHocGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách ca học bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmChucDanhKhoaHocAll(condition, done) {
    return dispatch => {
        const url = '/api/danh-muc/chuc-danh-khoa-hoc/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chức danh khoa học bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmChucDanhKhoaHocGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách chức danh khoa học bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmChucDanhKhoaHoc(ma, done) {
    return () => {
        const url = `/api/danh-muc/chuc-danh-khoa-hoc/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin chức danh khoa học bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmChucDanhKhoaHoc(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/chuc-danh-khoa-hoc';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo chức danh khoa học bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmChucDanhKhoaHocAll());
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo chức danh khoa học bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmChucDanhKhoaHoc(ma) {
    return dispatch => {
        const url = '/api/danh-muc/chuc-danh-khoa-hoc';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục chức danh khoa học bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Khoa đã xóa thành công!', 'success', false, 800);
                dispatch(getDmChucDanhKhoaHocAll());
            }
        }, (error) => T.notify('Xóa chức danh khoa học bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmChucDanhKhoaHoc(ma, changes, done) {

    return dispatch => {
        const url = '/api/danh-muc/chuc-danh-khoa-hoc';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin chức danh khoa học bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin chức danh khoa học thành công!', 'success');
                dispatch(getDmChucDanhKhoaHocAll());
            }
        }, (error) => T.notify('Cập nhật thông tin chức danh khoa học bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function changeDmChucDanhKhoaHoc(item) {
    return { type: DmChucDanhKhoaHocUpdate, item };
}

export const SelectAdapter_DmChucDanhKhoaHoc = {
    ajax: true,
    url: '/api/danh-muc/chuc-danh-khoa-hoc/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDmChucDanhKhoaHoc(ma, item => done && done({ id: item.ma, text: item.ten })))(),
};

export const SelectAdapter_DmChucDanhKhoaHocV2 = {
    ajax: true,
    data: params => ({ condition: params.term, kichHoat: 1 }),
    url: '/api/danh-muc/chuc-danh-khoa-hoc/page/1/20',
    getOne: getDmChucDanhKhoaHoc,
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDmChucDanhKhoaHoc(ma, item => done && done({ id: item.ma, text: item.ten })))(),
    processResultOne: response => response && ({ value: response.ma, text: response.ten }),
};