import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmPhuCapGetAll = 'DmPhuCap:GetAll';
const DmPhuCapGetPage = 'DmPhuCap:GetPage';
const DmPhuCapUpdate = 'DmPhuCap:Update';

export default function DmPhuCapReducer(state = null, data) {
    switch (data.type) {
        case DmPhuCapGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmPhuCapGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmPhuCapUpdate:
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
T.initPage('pageDmPhuCap');
export function getDmPhuCapPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmPhuCap', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/phu-cap/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách phụ cấp bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmPhuCapGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách phụ cấp bị lỗi!', 'danger'));
    };
}

export function getDmPhuCapAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/phu-cap/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách phụ cấp bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmPhuCapGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách phụ cấp bị lỗi!', 'danger'));
    };
}

export function getDmPhuCap(ma, done) {
    return () => {
        const url = `/api/danh-muc/phu-cap/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin phụ cấp bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmPhuCap(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/phu-cap';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo phụ cấp bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmPhuCapAll());
                if (done) done(data);
            }
        }, () => T.notify('Tạo phụ cấp bị lỗi!', 'danger'));
    };
}

export function deleteDmPhuCap(ma) {
    return dispatch => {
        const url = '/api/danh-muc/phu-cap';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục phụ cấp bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmPhuCapAll());
            }
        }, () => T.notify('Xóa phụ cấp bị lỗi!', 'danger'));
    };
}

export function updateDmPhuCap(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/phu-cap';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin phụ cấp bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin phụ cấp thành công!', 'success');
                dispatch(getDmPhuCapAll());
            }
        }, () => T.notify('Cập nhật thông tin phụ cấp bị lỗi!', 'danger'));
    };
}

export function changeDmPhuCap(item) {
    return { type: DmPhuCapUpdate, item };
}
