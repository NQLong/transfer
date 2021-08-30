import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmKhuVucGetAll = 'DmKhuVuc:GetAll';
const DmKhuVucGetPage = 'DmKhuVuc:GetPage';
const DmKhuVucUpdate = 'DmKhuVuc:Update';

export default function dmKhuVucReducer(state = null, data) {
    switch (data.type) {
        case DmKhuVucGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmKhuVucGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmKhuVucUpdate:
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
export const PageName = 'dmKhuVucPage';
T.initPage(PageName);
export function getDmKhuVucPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/khu-vuc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách khu vực bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmKhuVucGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách khu vực bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    }
}

export function getDmKhuVucAll(done) {
    return dispatch => {
        const url = `/api/danh-muc/khu-vuc/all`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách khu vực bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmKhuVucGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách khu vực bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    }
}

export function getDmKhuVuc(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/khu-vuc/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin khu vực bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
                dispatch(changeDmKhuVuc(data.item));
            }
        }, error => console.error(`GET: ${url}.`, error));
    }
}

export function createDmKhuVuc(dmKhuVuc, done) {
    return dispatch => {
        const url = '/api/danh-muc/khu-vuc';
        T.post(url, { dmKhuVuc }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một khu vực bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới khu vực thành công!', 'success');
                dispatch(getDmKhuVucPage());
                if (done) done(data);
            }
        }, error => done(error));
    }
}

export function updateDmKhuVuc(condition, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/khu-vuc';
        T.put(url, { condition, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu khu vực bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật khu vực thành công!', 'success');
                done && done(data.item);
                dispatch(getDmKhuVucPage());
            }
        }, error => done(error));
    }
}

export function deleteDmKhuVuc(ma, done) {
    return dispatch => {
        const url = '/api/danh-muc/khu-vuc';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa khu vực bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa khu vực thành công!', 'success', false, 800);
                dispatch(getDmKhuVucPage());
            }
            done && done();
        }, error => done(error));
    }
}

export function changeDmKhuVuc(item) {
    return { type: DmKhuVucUpdate, item };
}