import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmHocPhanGetAll = 'DmHocPhan:GetAll';
const DmHocPhanGetPage = 'DmHocPhan:GetPage';
const DmHocPhanUpdate = 'DmHocPhan:Update';

export default function dmHocPhanReducer(state = null, data) {
    switch (data.type) {
        case DmHocPhanGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmHocPhanGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmHocPhanUpdate:
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
export function getDmHocPhanAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }
    return dispatch => {
        const url = '/api/danh-muc/hoc-phan/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách học phần bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmHocPhanGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

T.initPage('pageDmHocPhan');
export function getDmHocPhanPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmHocPhan', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/hoc-phan/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách học phần bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmHocPhanGetPage, page: data.page });
            }
        });
    };
}

export function createDmHocPhan(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/hoc-phan';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo học phần bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch(getDmHocPhanAll());
            }
        });
    };
}

export function deleteDmHocPhan(ma) {
    return dispatch => {
        const url = '/api/danh-muc/hoc-phan';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa học phần bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Học phần đã xóa thành công!', 'success', false, 800);
                dispatch(getDmHocPhanAll());
            }
        }, () => T.notify('Xóa học phần bị lỗi!', 'danger'));
    };
}

export function updateDmHocPhan(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/hoc-phan';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật học phần bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin học phần thành công!', 'success');
                dispatch(getDmHocPhanAll());
            }
        }, () => T.notify('Cập nhật thông tin học phần bị lỗi!', 'danger'));
    };
}

export function changeDmHocPhan(item) {
    return { type: DmHocPhanUpdate, item };
}