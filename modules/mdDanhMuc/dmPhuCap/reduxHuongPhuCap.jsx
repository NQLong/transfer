import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmHuongPhuCapGetAll = 'DmHuongPhuCap:GetAll';
const DmHuongPhuCapGetPage = 'DmHuongPhuCap:GetPage';
const DmHuongPhuCapUpdate = 'DmHuongPhuCap:Update';

export default function DmHuongPhuCapReducer(state = null, data) {
    switch (data.type) {
        case DmHuongPhuCapGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmHuongPhuCapGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmHuongPhuCapUpdate:
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
T.initPage('pageDmHuongPhuCap');
export function getDmHuongPhuCapPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmHuongPhuCap', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/huong-phu-cap/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách hưởng phụ cấp bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmHuongPhuCapGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách hưởng phụ cấp bị lỗi!', 'danger'));
    };
}

export function getDmHuongPhuCapAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/huong-phu-cap/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách hưởng phụ cấp bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmHuongPhuCapGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách hưởng phụ cấp bị lỗi!', 'danger'));
    };
}

export function getDmHuongPhuCap(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/huong-phu-cap/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin hưởng phụ cấp bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmHuongPhuCap(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/huong-phu-cap';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo hưởng phụ cấp bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmHuongPhuCapAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo hưởng phụ cấp bị lỗi!', 'danger'));
    };
}

export function deleteDmHuongPhuCap(ma) {
    return dispatch => {
        const url = '/api/danh-muc/huong-phu-cap';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục hưởng phụ cấp bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmHuongPhuCapAll());
            }
        }, error => T.notify('Xóa hưởng  hình thức hưởng phụ cấp bị lỗi!', 'danger'));
    };
}

export function updateDmHuongPhuCap(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/huong-phu-cap';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin hưởng phụ cấp bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin hưởng phụ cấp thành công!', 'success');
                dispatch(getDmHuongPhuCapAll());
            }
        }, error => T.notify('Cập nhật thông tin hưởng phụ cấp bị lỗi!', 'danger'));
    };
}

export function changeDmHuongPhuCap(item) {
    return { type: DmHuongPhuCapUpdate, item };
}
