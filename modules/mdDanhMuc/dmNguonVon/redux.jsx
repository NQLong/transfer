import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmNguonVonGetAll = 'DmNguonVon:GetAll';
const DmNguonVonGetPage = 'DmNguonVon:GetPage';
const DmNguonVonUpdate = 'DmNguonVon:Update';

export default function DmNguonVonReducer(state = null, data) {
    switch (data.type) {
        case DmNguonVonGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmNguonVonGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmNguonVonUpdate:
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
export const PageName = 'pageDmNguonVon';
T.initPage(PageName);
export function getDmNguonVonPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/nguon-von/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách Nguồn Vốn bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmNguonVonGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách Nguồn Vốn bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function getDmNguonVonAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/nguon-von/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách Nguồn Vốn bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmNguonVonGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách Nguồn Vốn bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function getDmNguonVon(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/nguon-von/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin Nguồn Vốn bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmNguonVon(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/nguon-von';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo Nguồn Vốn bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmNguonVonPage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo Nguồn Vốn bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function updateDmNguonVon(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/nguon-von';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin Nguồn Vốn bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin Nguồn Vốn thành công!', 'success');
                dispatch(getDmNguonVonPage());
            }
        }, error => T.notify('Cập nhật thông tin Nguồn Vốn bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function deleteDmNguonVon(ma) {
    return dispatch => {
        const url = '/api/danh-muc/nguon-von';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa Nguồn Vốn bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Nguồn Vốn đã xóa thành công!', 'success', false, 800);
                dispatch(getDmNguonVonPage());
            }
        }, error => T.notify('Xóa Nguồn Vốn bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function changeDmNguonVon(item) {
    return { type: DmNguonVonUpdate, item };
}

export const SelectAdapter_DmNguonVon = {
    ajax: true,
    url: '/api/danh-muc/nguon-von/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: `${item.ma}: ${item.tenNguonVon}` })) : [] }),
    getOne: getDmNguonVon,
    processResultOne: response => response && ({ value: response.ma, text: `${response.ma}:${response.tenNguonVon}` }),
};