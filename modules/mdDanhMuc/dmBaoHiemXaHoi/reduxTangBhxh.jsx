import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmTangBhxhGetAll = 'DmTangBhxh:GetAll';
const DmTangBhxhGetPage = 'DmTangBhxh:GetPage';
const DmTangBhxhUpdate = 'DmTangBhxh:Update';

export default function DmTangBhxhReducer(state = null, data) {
    switch (data.type) {
        case DmTangBhxhGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmTangBhxhGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmTangBhxhUpdate:
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
T.initPage('pageDmTangBhxh');
export function getDmTangBhxhPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmTangBhxh', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/tang-bao-hiem-xa-hoi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách tăng Bảo hiểm xã hội bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmTangBhxhGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách tăng Bảo hiểm xã hội bị lỗi!', 'danger'));
    };
}

export function getDmTangBhxhAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/tang-bao-hiem-xa-hoi/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách tăng Bảo hiểm xã hội bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmTangBhxhGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách tăng Bảo hiểm xã hội bị lỗi!', 'danger'));
    };
}

export function getDmTangBhxh(ma, done) {
    return () => {
        const url = `/api/danh-muc/tang-bao-hiem-xa-hoi/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin tăng Bảo hiểm xã hội bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmTangBhxh(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/tang-bao-hiem-xa-hoi';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo tăng Bảo hiểm xã hội bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmTangBhxhAll());
                if (done) done(data);
            }
        }, () => T.notify('Tạo tăng Bảo hiểm xã hội bị lỗi!', 'danger'));
    };
}

export function deleteDmTangBhxh(ma) {
    return dispatch => {
        const url = '/api/danh-muc/tang-bao-hiem-xa-hoi';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục tăng Bảo hiểm xã hội bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmTangBhxhAll());
            }
        }, () => T.notify('Xóa tăng Bảo hiểm xã hội bị lỗi!', 'danger'));
    };
}

export function updateDmTangBhxh(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/tang-bao-hiem-xa-hoi';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin tăng Bảo hiểm xã hội bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin tăng Bảo hiểm xã hội thành công!', 'success');
                dispatch(getDmTangBhxhAll());
            }
        }, () => T.notify('Cập nhật thông tin tăng Bảo hiểm xã hội bị lỗi!', 'danger'));
    };
}

export function changeDmTangBhxh(item) {
    return { type: DmTangBhxhUpdate, item };
}
