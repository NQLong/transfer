import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmMonHocGetAll = 'DmMonHoc:GetAll';
const DmMonHocGetPage = 'DmMonHoc:GetPage';
const DmMonHocUpdate = 'DmMonHoc:Update';

export default function dmMonHocReducer(state = null, data) {
    switch (data.type) {
        case DmMonHocGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmMonHocGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmMonHocUpdate:
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
export function getDmMonHocAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }
    return dispatch => {
        const url = '/api/danh-muc/mon-hoc/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách môn học bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmMonHocGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

T.initPage('pageDmMonHoc');
export function getDmMonHocPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmMonHoc', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/mon-hoc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách môn học bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmMonHocGetPage, page: data.page });
            }
        });
    };
}

export function createDmMonHoc(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/mon-hoc';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo môn học bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch(getDmMonHocAll());
            }
        });
    };
}

export function deleteDmMonHoc(ma) {
    return dispatch => {
        const url = '/api/danh-muc/mon-hoc';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa môn học bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Tòa nhà đã xóa thành công!', 'success', false, 800);
                dispatch(getDmMonHocAll());
            }
        }, () => T.notify('Xóa môn học bị lỗi!', 'danger'));
    };
}

export function updateDmMonHoc(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/mon-hoc';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật môn học bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin môn học thành công!', 'success');
                dispatch(getDmMonHocAll());
            }
        }, () => T.notify('Cập nhật thông tin môn học bị lỗi!', 'danger'));
    };
}

export function changeDmMonHoc(item) {
    return { type: DmMonHocUpdate, item };
}