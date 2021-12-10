import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TchcHopDongLaoDongGetAll = 'TchcHopDongLaoDong:GetAll';
const TchcHopDongLaoDongGetPage = 'TchcHopDongLaoDong:GetPage';
const TchcHopDongLaoDongUpdate = 'TchcHopDongLaoDong:Update';
const TchcHopDongLaoDongGet = 'TchcHopDongLaoDong:Get';

export default function TchcHopDongLaoDongReducer(state = null, data) {
    switch (data.type) {
        case TchcHopDongLaoDongGetAll:
            return Object.assign({}, state, { items: data.items });
        case TchcHopDongLaoDongGetPage:
            return Object.assign({}, state, { page: data.page });
        case TchcHopDongLaoDongGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case TchcHopDongLaoDongUpdate:
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
T.initPage('pageTchcHopDongLaoDong');

export function getTchcHopDongLaoDongPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageTchcHopDongLaoDong', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/tchc/hop-dong-lao-dong/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: TchcHopDongLaoDongGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger'));
    };
}

export function getTchcHopDongLaoDongAll(done) {
    return dispatch => {
        const url = '/api/tchc/hop-dong-lao-dong/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: TchcHopDongLaoDongGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger'));
    };
}

export function getTchcHopDongLaoDong(ma, done) {
    return () => {
        const url = `/api/tchc/hop-dong-lao-dong/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy hợp đồng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getTchcHopDongLaoDongEdit(ma, done) {
    return dispatch => {
        const url = `/api/tchc/hop-dong-lao-dong/edit/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin hợp đồng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data);
                dispatch({ type: TchcHopDongLaoDongGet, item: data.item });
            }
        }, () => T.notify('Lấy thông tin hợp đồng bị lỗi', 'danger'));
    };
}

export function createTchcHopDongLaoDong(item, done) {
    return dispatch => {
        const url = '/api/tchc/hop-dong-lao-dong';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo hợp đồng bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo hợp đồng thành công!', 'success');
                dispatch(getTchcHopDongLaoDongPage());
                if (done) done(data);
            }
        }, () => T.notify('Tạo hợp đồng bị lỗi!', 'danger'));
    };
}

export function deleteTchcHopDongLaoDong(ma, done) {
    return dispatch => {
        const url = '/api/tchc/hop-dong-lao-dong';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa hợp đồng bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Hợp đồng đã xóa thành công!', 'success', false, 800);
                dispatch(getTchcHopDongLaoDongPage());
            }
            done && done();
        }, () => T.notify('Xóa hợp đồng bị lỗi!', 'danger'));
    };
}

export function updateTchcHopDongLaoDong(ma, changes, done) {
    return dispatch => {
        const url = '/api/tchc/hop-dong-lao-dong';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật hợp đồng bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật hợp đồng thành công!', 'success');
                done && done(data.item);
                dispatch(getTchcHopDongLaoDong(ma));
            }
        }, () => T.notify('Cập nhật hợp đồng bị lỗi!', 'danger'));
    };
}