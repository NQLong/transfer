import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmTiepNhanVeNuocGetAll = 'DmTiepNhanVeNuoc:GetAll';
const DmTiepNhanVeNuocGetPage = 'DmTiepNhanVeNuoc:GetPage';
const DmTiepNhanVeNuocUpdate = 'DmTiepNhanVeNuoc:Update';

export default function DmTiepNhanVeNuocReducer(state = null, data) {
    switch (data.type) {
        case DmTiepNhanVeNuocGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmTiepNhanVeNuocGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmTiepNhanVeNuocUpdate:
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
T.initPage('pageDmTiepNhanVeNuoc');
export function getDmTiepNhanVeNuocPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDmTiepNhanVeNuoc', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/tiep-nhan-ve-nuoc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách tiếp nhận về nước bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmTiepNhanVeNuocGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách tiếp nhận về nước bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function getDmTiepNhanVeNuocAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/tiep-nhan-ve-nuoc/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách tiếp nhận về nước lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmTiepNhanVeNuocGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách tiếp nhận về nước bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function createDmTiepNhanVeNuoc(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/tiep-nhan-ve-nuoc';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo dữ liệu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới dữ liệu thành công!', 'success');
                dispatch(getDmTiepNhanVeNuocPage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo dữ liệu bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function deleteDmTiepNhanVeNuoc(ma) {
    return dispatch => {
        const url = '/api/danh-muc/tiep-nhan-ve-nuoc';
        T.delete(url, { ma }, data => {
            if (data.error) {
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Xóa dữ liệu thành công!', 'success');
                dispatch(getDmTiepNhanVeNuocPage());
            }
        }, error => T.notify('Xóa dữ liệu bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function updateDmTiepNhanVeNuoc(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/tiep-nhan-ve-nuoc';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật dữ liệu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật dữ liệu thành công!', 'success');
                done && done(data.item);
                dispatch(getDmTiepNhanVeNuocPage());
            }
        }, error => T.notify('Cập nhật dữ liệu bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function getDmTiepNhanVeNuoc(ma, done) {
    return () => {
        const url = `/api/danh-muc/tiep-nhan-ve-nuoc/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin tiếp nhận về nước bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export const SelectAdapter_DmTiepNhanVeNuoc = {
    ajax: false,
    getAll: getDmTiepNhanVeNuocAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
};

export const SelectAdapter_DmTiepNhanVeNuocV2 = {
    ajax: true,
    url: '/api/danh-muc/tiep-nhan-ve-nuoc/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDmTiepNhanVeNuoc(ma, item => item && done && done({ id: item.ma, text: item.ten })))(),
    getOne: getDmTiepNhanVeNuoc,
    processResultOne: response => response && ({ value: response.ma, text: `${response.ma}: ${response.ten}` }),
};