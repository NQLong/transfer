import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DvWebsiteGet = 'DvWebsite:Get';
const DvWebsiteGetAll = 'DvWebsite:GetAll';
const DvWebsiteGetPage = 'DvWebsite:GetPage';
const DvWebsiteUpdate = 'DvWebsite:Update';
const GtKhoaGetPage = 'GtKhoa:GetPage';

export default function DvWebsiteReducer(state = null, data) {
    switch (data.type) {
        case GtKhoaGetPage:
            return Object.assign({}, state, { page: data.page });
        case DvWebsiteGet:
            return Object.assign({}, state, { item: data.item });
        case DvWebsiteGetAll:
            return Object.assign({}, state, { items: data.items });
        case DvWebsiteGetPage:
            return Object.assign({}, state, { page: data.page });
        case DvWebsiteUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].shortname == updatedItem.shortname) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].shortname == updatedItem.shortname) {
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
T.initPage('pageDvWebsite', true);
export function getDvWebsitePage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDvWebsite', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/website/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách website đơn vị bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DvWebsiteGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách website đơn vị bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}


export function getDvWebsiteAll(condition, done) {
    return dispatch => {
        const url = '/api/website/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                // T.notify('Lấy danh sách website đơn vị bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DvWebsiteGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => {
            console.error(error);
        });
    };
}

export function getDvWebsite(id, done) {
    return dispatch => {
        const url = typeof id == 'string' ? `/api/website/item/${id}` : '/api/website/item/null';
        T.get(url, { condition: typeof id == 'string' ? null : id }, data => {
            if (data.error) {
                T.notify('Lấy thông tin website đơn vị bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: DvWebsiteGet, item: data.item });
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDvWebsite(item, done) {
    return dispatch => {
        const url = '/api/website';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo website đơn vị bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo thông tin website đơn vị thành công!', 'success');
                dispatch(getDvWebsitePage());
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo website đơn vị bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDvWebsite(shortname) {
    return dispatch => {
        const url = '/api/website';
        T.delete(url, { shortname }, data => {
            if (data.error) {
                T.notify('Xóa website đơn vị bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Website đơn vị đã xóa thành công!', 'success', false, 800);
                dispatch(getDvWebsitePage());
            }
        }, (error) => T.notify('Xóa website đơn vị bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDvWebsite(id, changes, done) {
    return dispatch => {
        const url = '/api/website';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin website đơn vị bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin website đơn vị thành công!', 'success');
                if (done) done(data.item);
                dispatch(getDvWebsitePage());
            }
        }, (error) => T.notify('Cập nhật thông tin website đơn vị bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function changeDvWebsite(item) {
    return { type: DvWebsiteUpdate, item };
}


