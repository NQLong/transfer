import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmNguonKinhPhiTrongNuocGetAll = 'DmNguonKinhPhiTrongNuoc:GetAll';
const DmNguonKinhPhiTrongNuocGetPage = 'DmNguonKinhPhiTrongNuoc:GetPage';
const DmNguonKinhPhiTrongNuocUpdate = 'DmNguonKinhPhiTrongNuoc:Update';

export default function DmNguonKinhPhiTrongNuocReducer(state = null, data) {
    switch (data.type) {
        case DmNguonKinhPhiTrongNuocGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmNguonKinhPhiTrongNuocGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmNguonKinhPhiTrongNuocUpdate:
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
T.initPage('pageDmNguonKinhPhiTrongNuoc');
export function getDmNguonKinhPhiTrongNuocPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDmNguonKinhPhiTrongNuoc', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/nguon-kinh-phi-trong-nuoc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nguồn kinh phí trong nước bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmNguonKinhPhiTrongNuocGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách nguồn kinh phí trong nước bị lỗi!', 'danger'));
    };
}

export function getDmNguonKinhPhiTrongNuocAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/nguon-kinh-phi-trong-nuoc/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách nguồn kinh phí trong nước bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmNguonKinhPhiTrongNuocGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách nguồn kinh phí trong nước bị lỗi!', 'danger'));
    };
}

export function getDmNguonKinhPhiTrongNuoc(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/nguon-kinh-phi-trong-nuoc/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin nguồn kinh phí trong nước bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmNguonKinhPhiTrongNuoc(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/nguon-kinh-phi-trong-nuoc';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo nguồn kinh phí trong nước bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmNguonKinhPhiTrongNuocPage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo nguồn kinh phí trong nước bị lỗi!', 'danger'));
    };
}

export function deleteDmNguonKinhPhiTrongNuoc(ma) {
    return dispatch => {
        const url = '/api/danh-muc/nguon-kinh-phi-trong-nuoc';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục nguồn kinh phí trong nước bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmNguonKinhPhiTrongNuocPage());
            }
        }, error => T.notify('Xóa nguồn kinh phí trong nước bị lỗi!', 'danger'));
    };
}

export function updateDmNguonKinhPhiTrongNuoc(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/nguon-kinh-phi-trong-nuoc';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin nguồn kinh phí trong nước bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin nguồn kinh phí trong nước thành công!', 'success');
                dispatch(getDmNguonKinhPhiTrongNuocPage());
            }
        }, error => T.notify('Cập nhật thông tin nguồn kinh phí trong nước bị lỗi!', 'danger'));
    };
}

export function changeDmNguonKinhPhiTrongNuoc(item) {
    return { type: DmNguonKinhPhiTrongNuocUpdate, item };
}
