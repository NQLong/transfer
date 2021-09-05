import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmGiamBhxhGetAll = 'DmGiamBhxh:GetAll';
const DmGiamBhxhGetPage = 'DmGiamBhxh:GetPage';
const DmGiamBhxhUpdate = 'DmGiamBhxh:Update';

export default function DmGiamBhxhReducer(state = null, data) {
    switch (data.type) {
        case DmGiamBhxhGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmGiamBhxhGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmGiamBhxhUpdate:
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
T.initPage('pageDmGiamBhxh');
export function getDmGiamBhxhPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmGiamBhxh', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/giam-bao-hiem-xa-hoi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách giảm Bảo hiểm xã hội bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmGiamBhxhGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách giảm Bảo hiểm xã hội bị lỗi!', 'danger'));
    };
}

export function getDmGiamBhxhAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/giam-bao-hiem-xa-hoi/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách giảm Bảo hiểm xã hội bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmGiamBhxhGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách giảm Bảo hiểm xã hội bị lỗi!', 'danger'));
    };
}

export function getDmGiamBhxh(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/giam-bao-hiem-xa-hoi/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin giảm Bảo hiểm xã hội bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmGiamBhxh(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/giam-bao-hiem-xa-hoi';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo giảm Bảo hiểm xã hội bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmGiamBhxhAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo giảm Bảo hiểm xã hội bị lỗi!', 'danger'));
    };
}

export function deleteDmGiamBhxh(ma) {
    return dispatch => {
        const url = '/api/danh-muc/giam-bao-hiem-xa-hoi';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục giảm Bảo hiểm xã hội bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmGiamBhxhAll());
            }
        }, error => T.notify('Xóa giảm Bảo hiểm xã hội bị lỗi!', 'danger'));
    };
}

export function updateDmGiamBhxh(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/giam-bao-hiem-xa-hoi';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin giảm Bảo hiểm xã hội bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin giảm Bảo hiểm xã hội thành công!', 'success');
                dispatch(getDmGiamBhxhAll());
            }
        }, error => T.notify('Cập nhật thông tin giảm Bảo hiểm xã hội bị lỗi!', 'danger'));
    };
}

export function changeDmGiamBhxh(item) {
    return { type: DmGiamBhxhUpdate, item };
}
