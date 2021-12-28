import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmDienHopDongGetAll = 'DmDienHopDong:GetAll';
const DmDienHopDongGetPage = 'DmDienHopDong:GetPage';
const DmDienHopDongUpdate = 'DmDienHopDong:Update';

export default function DmDienHopDongReducer(state = null, data) {
    switch (data.type) {
        case DmDienHopDongGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmDienHopDongGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmDienHopDongUpdate:
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
export const PageName = 'pageDmDienHopDong';
T.initPage(PageName);
export function getDmDienHopDongPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/dien-hop-dong/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách diện hợp đồng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmDienHopDongGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách ca học bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmDienHopDongAll(condition, done) {
    return dispatch => {
        const url = '/api/danh-muc/dien-hop-dong/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách diện hợp đồng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmDienHopDongGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách diện hợp đồng bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmDienHopDong(ma, done) {
    return () => {
        const url = `/api/danh-muc/dien-hop-dong/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin diện hợp đồng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmDienHopDong(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/dien-hop-dong';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo diện hợp đồng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo thông tin diện hợp đồng thành công!', 'success');
                dispatch(getDmDienHopDongPage());
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo diện hợp đồng bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmDienHopDong(ma) {
    return dispatch => {
        const url = '/api/danh-muc/dien-hop-dong';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục diện hợp đồng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmDienHopDongPage());
            }
        }, (error) => T.notify('Xóa diện hợp đồng bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmDienHopDong(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/dien-hop-dong';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin diện hợp đồng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin diện hợp đồng thành công!', 'success');
                done && done(data.item);
                dispatch(getDmDienHopDongPage());
            }
        }, (error) => T.notify('Cập nhật thông tin diện hợp đồng bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function changeDmDienHopDong(item) {
    return { type: DmDienHopDongUpdate, item };
}

export const SelectAdapter_DmDienHopDong = {
    ajax: false,
    getAll: getDmDienHopDongAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    condition: { kichHoat: 1 },
};


export const SelectAdapter_DmDienHopDongV2 = {
    ajax: false,
    data: () => ({ condition: {} }),
    url: '/api/danh-muc/dien-hop-dong/all',
    getOne: getDmDienHopDong,
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDmDienHopDong(ma, item => done && done({ id: item.ma, text: item.ten })))(),
};