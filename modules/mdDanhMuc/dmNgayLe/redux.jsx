import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmNgayLeGetAll = 'DmNgayLe:GetAll';
const DmNgayLeGetPage = 'DmNgayLe:GetPage';
const DmNgayLeUpdate = 'DmNgayLe:Update';

export default function dmNgayLeReducer(state = null, data) {
    switch (data.type) {
        case DmNgayLeGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmNgayLeGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmNgayLeUpdate:
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
export function getDmNgayLeAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }
    return dispatch => {
        const url = '/api/danh-muc/ngay-le/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách ngày lễ bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmNgayLeGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

T.initPage('pageDmNgayLe');
export function getDmNgayLePage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDmNgayLe', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/ngay-le/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách ngày lễ bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmNgayLeGetPage, page: data.page });
            }
        });
    };
}

export function createDmNgayLe(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/ngay-le';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo ngày lễ bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch(getDmNgayLePage());
            }
        });
    };
}

export function getDmNgayLe(id, done) {
    return () => {
        const url = `/api/danh-muc/ngay-le/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin ngày lễ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}


export function deleteDmNgayLe(id) {
    return dispatch => {
        const url = '/api/danh-muc/ngay-le';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa ngày lễ bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Ngày lễ đã xóa thành công!', 'success', false, 800);
                dispatch(getDmNgayLePage());
            }
        }, () => T.notify('Xóa ngày lễ bị lỗi!', 'danger'));
    };
}

export function updateDmNgayLe(id, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/ngay-le';
        T.put(url, {  id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật ngày lễ bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin ngày lễ thành công!', 'success');
                dispatch(getDmNgayLePage());
            }
        }, () => T.notify('Cập nhật thông tin ngày lễ bị lỗi!', 'danger'));
    };
}

export function changeDmNgayLe(item) {
    return { type: DmNgayLeUpdate, item };
}

