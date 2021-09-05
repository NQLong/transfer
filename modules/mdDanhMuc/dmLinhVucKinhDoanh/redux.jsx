import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmLinhVucKinhDoanhGetAll = 'DmLinhVucKinhDoanh:GetAll';
const DmLinhVucKinhDoanhGetPage = 'DmLinhVucKinhDoanh:GetPage';
const DmLinhVucKinhDoanhUpdate = 'DmLinhVucKinhDoanh:Update';

export default function DmLinhVucKinhDoanhReducer(state = null, data) {
    switch (data.type) {
        case DmLinhVucKinhDoanhGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmLinhVucKinhDoanhGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmLinhVucKinhDoanhUpdate:
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
T.initPage('pageDmLinhVucKinhDoanh', true);
export function getDmLinhVucKinhDoanhPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDmLinhVucKinhDoanh', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/linh-vuc-kinh-doanh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách lĩnh vực kinh doanh bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmLinhVucKinhDoanhGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách lĩnh vực kinh doanh bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function getDmLinhVucKinhDoanhAll(condition, done) {
    return dispatch => {
        const url = '/api/danh-muc/linh-vuc-kinh-doanh/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách lĩnh vực kinh doanh bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmLinhVucKinhDoanhGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách lĩnh vực kinh doanh bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function getDmLinhVucKinhDoanh(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/linh-vuc-kinh-doanh/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin lĩnh vực kinh doanh bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmLinhVucKinhDoanh(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/linh-vuc-kinh-doanh';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo lĩnh vực kinh doanh bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmLinhVucKinhDoanhPage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo lĩnh vực kinh doanh bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function deleteDmLinhVucKinhDoanh(ma) {
    return dispatch => {
        const url = '/api/danh-muc/linh-vuc-kinh-doanh';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục lĩnh vực kinh doanh bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmLinhVucKinhDoanhPage());
            }
        }, error => T.notify('Xóa lĩnh vực kinh doanh bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function updateDmLinhVucKinhDoanh(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/linh-vuc-kinh-doanh';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin lĩnh vực kinh doanh bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin lĩnh vực kinh doanh thành công!', 'success');
                dispatch(getDmLinhVucKinhDoanhPage());
            }
        }, error => T.notify('Cập nhật thông tin lĩnh vực kinh doanh bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function changeDmLinhVucKinhDoanh(item) {
    return { type: DmLinhVucKinhDoanhUpdate, item };
}