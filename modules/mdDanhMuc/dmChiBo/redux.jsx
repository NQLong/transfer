import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmChiBoGetAll = 'DmChiBo:GetAll';
const DmChiBoGetPage = 'DmChiBo:GetPage';
const DmChiBoUpdate = 'DmChiBo:Update';

export default function DmChiBoReducer(state = null, data) {
    switch (data.type) {
        case DmChiBoGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmChiBoGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmChiBoUpdate:
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
T.initPage('pageDmChiBo');
export function getDmChiBoPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDmChiBo', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/chi-bo/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chi bộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmChiBoGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách chi bộ bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function getDmChiBoAll(condition, done) {
    return dispatch => {
        const url = '/api/danh-muc/chi-bo/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chi bộ lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmChiBoGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách chi bộ bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function createDmChiBo(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/chi-bo';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo dữ liệu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmChiBoPage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo dữ liệu bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function deleteDmChiBo(ma) {
    return dispatch => {
        const url = '/api/danh-muc/chi-bo';
        T.delete(url, { ma }, data => {
            if (data.error) {
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                dispatch(getDmChiBoPage());
            }
        }, error => T.notify('Xóa dữ liệu bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function updateDmChiBo(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/chi-bo';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật dữ liệu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật dữ liệu thành công!', 'success');
                done && done(data.item);
                dispatch(getDmChiBoPage());
            }
        }, error => T.notify('Cập nhật dữ liệu bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export const SelectAdapter_DmChiBo = {
    ajax: false,
    getAll: getDmChiBoAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ma + ': ' + item.ten })) : [] }),
    condition: { kichHoat: 1 },
};