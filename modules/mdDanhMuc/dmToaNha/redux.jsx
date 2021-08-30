import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmToaNhaGetAll = 'DmToaNha:GetAll';
const DmToaNhaGetPage = 'DmToaNha:GetPage';
const DmToaNhaUpdate = 'DmToaNha:Update';

export default function dmToaNhaReducer(state = null, data) {
    switch (data.type) {
        case DmToaNhaGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmToaNhaGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmToaNhaUpdate:
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
export function getDmToaNhaAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }
    return dispatch => {
        const url = `/api/danh-muc/toa-nha/all`;
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách tòa nhà bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmToaNhaGetAll, items: data.items ? data.items : [] });
            }
        })
    }
}

T.initPage('pageDmToaNha');
export function getDmToaNhaPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmToaNha', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/toa-nha/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách tòa nhà bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmToaNhaGetPage, page: data.page });
            }
        })
    }
}

export function createDmToaNha(item, done) {
    return dispatch => {
        const url = `/api/danh-muc/toa-nha`;
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo tòa nhà bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch(getDmToaNhaAll());
            }
        })
    }
}

export function deleteDmToaNha(ma) {
    return dispatch => {
        const url = `/api/danh-muc/toa-nha`;
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa tòa nhà bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Tòa nhà đã xóa thành công!', 'success', false, 800);
                dispatch(getDmToaNhaAll());
            }
        }, error => T.notify('Xóa tòa nhà bị lỗi!', 'danger'));
    }
}

export function updateDmToaNha(ma, changes, done) {
    return dispatch => {
        const url = `/api/danh-muc/toa-nha`;
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật tòa nhà bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin tòa nhà thành công!', 'success');
                dispatch(getDmToaNhaAll());
            }
        }, error => T.notify('Cập nhật thông tin tòa nhà bị lỗi!', 'danger'));
    }
}

export function changeDmToaNha(item) {
    return { type: DmToaNhaUpdate, item };
}