import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmDanTocGetAll = 'DmDanToc:GetAll';
const DmDanTocGetPage = 'DmDanToc:GetPage';
const DmDanTocUpdate = 'DmDanToc:Update';

export default function DmDanTocReducer(state = null, data) {
    switch (data.type) {
        case DmDanTocGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmDanTocGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmDanTocUpdate:
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
export const PageName = 'pageDmDanToc';
T.initPage(PageName);
export function getDmDanTocPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/dan-toc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách dân tộc bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmDanTocGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách ca học bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmDanTocAll(condition, done) {
    return dispatch => {
        const url = '/api/danh-muc/dan-toc/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách dân tộc bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmDanTocGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách dân tộc bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmDanToc(ma, done) {
    return () => {
        const url = `/api/danh-muc/dan-toc/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin dân tộc bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmDanToc(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/dan-toc';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo dân tộc bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmDanTocPage());
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo dân tộc bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmDanToc(ma) {
    return dispatch => {
        const url = '/api/danh-muc/dan-toc';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục dân tộc bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmDanTocPage());
            }
        }, (error) => T.notify('Xóa dân tộc bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmDanToc(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/dan-toc';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin dân tộc bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin dân tộc thành công!', 'success');
                dispatch(getDmDanTocPage());
            }
        }, (error) => T.notify('Cập nhật thông tin dân tộc bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function changeDmDanToc(item) {
    return { type: DmDanTocUpdate, item };
}

export const SelectAdapter_DmDanToc = {
    ajax: false,
    getAll: getDmDanTocAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    condition: { kichHoat: 1 },
};