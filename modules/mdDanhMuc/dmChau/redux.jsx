import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmChauGetAll = 'DmChau:GetAll';
const DmChauGetPage = 'DmChau:GetPage';
const DmChauUpdate = 'DmChau:Update';

export default function dmChauReducer(state = null, data) {
    switch (data.type) {
        case DmChauGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmChauGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmChauUpdate:
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
                return Object.assign({}, state, { items: updatedItems, page: updatedPage })
            } else {
                return null;
            }

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('dmChauPage', true);
export function getDmChauPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmChauPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/chau/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách châu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmChauGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách châu bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    }
}

export function getDmChauAll(done) {
    return dispatch => {
        const url = `/api/danh-muc/chau/all`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách châu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmChauGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách châu bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    }
}

export function getDmChau(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/chau/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin châu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    }
}

export function createDmChau(dmChau, done) {
    return dispatch => {
        const url = '/api/danh-muc/chau';
        T.post(url, { dmChau }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một châu bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmChauAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo mới một châu bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    }
}

export function updateDmChau(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/chau';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu châu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                done && done(data.item);
                dispatch(getDmChauAll());
            }
        }, error => T.notify('Cập nhật dữ liệu châu bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    }
}

export function deleteDmChau(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/chau`;
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa châu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa châu thành công!', 'success', false, 800);
                dispatch(getDmChauAll());
            }
            done && done();
        }, error => T.notify('Xóa châu bị lỗi!', 'danger'));
    }
}