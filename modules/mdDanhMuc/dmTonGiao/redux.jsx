import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmTonGiaoGetAll = 'DmTonGiao:GetAll';
const DmTonGiaoGetPage = 'DmTonGiao:GetPage';
const DmTonGiaoUpdate = 'DmTonGiao:Update';

export default function DmTonGiaoReducer(state = null, data) {
    switch (data.type) {
        case DmTonGiaoGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmTonGiaoGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmTonGiaoUpdate:
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
T.initPage('pageDmTonGiao', true);
export function getDmTonGiaoPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDmTonGiao', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/ton-giao/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách tôn giáo bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmTonGiaoGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách tôn giáo bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function getDmTonGiaoAll(condition, done) {
    return dispatch => {
        const url = '/api/danh-muc/ton-giao/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách tôn giáo bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmTonGiaoGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách tôn giáo bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function getDmTonGiao(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/ton-giao/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin tôn giáo bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmTonGiao(dmTonGiao, done) {
    return dispatch => {
        const url = '/api/danh-muc/ton-giao';
        T.post(url, { dmTonGiao }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một tôn giáo bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới tôn giáo thành công!', 'success');
                dispatch(getDmTonGiaoPage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo mới một tôn giáo bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function updateDmTonGiao(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/ton-giao';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu tôn giáo bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật tôn giáo thành công!', 'success');
                done && done(data.item);
                dispatch(getDmTonGiaoPage());
            }
        }, error => T.notify('Cập nhật dữ liệu tôn giáo bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function deleteDmTonGiao(ma, done) {
    return dispatch => {
        const url = '/api/danh-muc/ton-giao';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa tôn giáo bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa tôn giáo thành công!', 'success', false, 800);
                dispatch(getDmTonGiaoPage());
            }
            done && done();
        }, error => T.notify('Xóa tôn giáo bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_DmTonGiao = {
    ajax: false,
    getAll: getDmTonGiaoAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    condition: { kichHoat: 1 },
};