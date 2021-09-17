import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmSoHuuTriTueGetAll = 'DmSoHuuTriTue:GetAll';
const DmSoHuuTriTueGetPage = 'DmSoHuuTriTue:GetPage';
const DmSoHuuTriTueUpdate = 'DmSoHuuTriTue:Update';

export default function DmSoHuuTriTueReducer(state = null, data) {
    switch (data.type) {
        case DmSoHuuTriTueGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmSoHuuTriTueGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmSoHuuTriTueUpdate:
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
T.initPage('pageDmSoHuuTriTue');
export function getDmSoHuuTriTuePage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmSoHuuTriTue', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/so-huu-tri-tue/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách sở hữu trí tuệ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmSoHuuTriTueGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách sở hữu trí tuệ bị lỗi!', 'danger'));
    };
}

export function getDmSoHuuTriTueAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/so-huu-tri-tue/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách sở hữu trí tuệ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmSoHuuTriTueGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách sở hữu trí tuệ bị lỗi!', 'danger'));
    };
}

export function getDmSoHuuTriTue(ma, done) {
    return () => {
        const url = `/api/danh-muc/so-huu-tri-tue/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin sở hữu trí tuệ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmSoHuuTriTue(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/so-huu-tri-tue';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo sở hữu trí tuệ bị lỗi', 'danger');
                console.error(`POST: ${url}.`, data.error);
                if (done) done(data.error);
            } else {
                T.notify('Tạo mới thông tin sở hữu trí tuệ thành công!', 'success');
                dispatch(getDmSoHuuTriTueAll());
                if (done) done(data);
            }
        }, () => T.notify('Tạo sở hữu trí tuệ bị lỗi!', 'danger'));
    };
}

export function deleteDmSoHuuTriTue(ma) {
    return dispatch => {
        const url = '/api/danh-muc/so-huu-tri-tue';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục sở hữu trí tuệ bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmSoHuuTriTueAll());
            }
        }, () => T.notify('Xóa sở hữu trí tuệ bị lỗi!', 'danger'));
    };
}

export function updateDmSoHuuTriTue(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/so-huu-tri-tue';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật thông tin sở hữu trí tuệ bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin sở hữu trí tuệ thành công!', 'success');
                dispatch(getDmSoHuuTriTueAll());
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin sở hữu trí tuệ bị lỗi!', 'danger'));
    };
}

export function changeDmSoHuuTriTue(item) {
    return { type: DmSoHuuTriTueUpdate, item };
}

export const SelectAdapter_DmSoHuuTriTue = {
    ajax: true,
    url: '/api/danh-muc/so-huu-tri-tue/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    getOne: getDmSoHuuTriTue,
    processResultOne: response => response && ({ value: response.ma, text: response.ma + ': ' + response.ten }),
};