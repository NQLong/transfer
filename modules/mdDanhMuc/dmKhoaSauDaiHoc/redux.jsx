import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmKhoaSdhGetAll = 'DmKhoaSdh:GetAll';
const DmKhoaSdhGetPage = 'DmKhoaSdh:GetPage';
const DmKhoaSdhUpdate = 'DmKhoaSdh:Update';

export default function dmKhoaSdhReducer(state = null, data) {
    switch (data.type) {
        case DmKhoaSdhGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmKhoaSdhGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmKhoaSdhUpdate:
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
export const PageName = 'pageDmKhoaSdh';
T.initPage(PageName);
export function getDmKhoaSdhPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/khoa-sau-dai-hoc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách khoa sau đại học bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmKhoaSdhGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách khoa sau đại học bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmKhoaSdhAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/khoa-sau-dai-hoc/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách khoa sau đại học bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmKhoaSdhGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách khoa sau đại học bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmKhoaSdh(ma, done) {
    return () => {
        const url = `/api/danh-muc/khoa-sau-dai-hoc/item/${ma}`;
        T.get(url, { ma }, data => {
            if (data.error) {
                T.notify('Lấy thông tin khoa sau đại học bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function createDmKhoaSdh(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/khoa-sau-dai-hoc';
        T.post(url, { item }, data => {
            if (data.error) {
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo khoa sau đại học thành công!', 'success');
                dispatch(getDmKhoaSdhPage());
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo khoa sau đại học bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmKhoaSdh(ma) {
    return dispatch => {
        const url = '/api/danh-muc/khoa-sau-dai-hoc';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục  bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đơn vị đã xóa thành công!', 'success', false, 800);
                dispatch(getDmKhoaSdhPage());
            }
        }, (error) => T.notify('Xóa khoa sau đại học bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmKhoaSdh(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/khoa-sau-dai-hoc';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông khoa sau đại học bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin khoa sau đại học thành công!', 'success');
                done && done(data.item);
                dispatch(getDmKhoaSdhPage());
            }
        }, (error) => T.notify('Cập nhật thông tin khoa sau đại học bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function changeDmKhoaSdh(item) {
    return { type: DmKhoaSdhUpdate, item };
}

export const SelectAdapter_DmKhoaSdh = {
    ajax: true,
    url: '/api/danh-muc/khoa-sau-dai-hoc/page/1/50',
    data: params => ({ condition: params.term, kichHoat: 1 }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (id, done) => (getDmKhoaSdh(id, item => item && done && done({ id: item.ma, text: item.ten })))(),
};