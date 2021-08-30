import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmTinhTrangCongTacGetAll = 'DmTinhTrangCongTac:GetAll';
const DmTinhTrangCongTacGetPage = 'DmTinhTrangCongTac:GetPage';
const DmTinhTrangCongTacUpdate = 'DmTinhTrangCongTac:Update';

export default function dmTinhTrangCongTacReducer(state = null, data) {
    switch (data.type) {
        case DmTinhTrangCongTacGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmTinhTrangCongTacGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmTinhTrangCongTacUpdate:
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
                return Object.assign({}, state, { items: updatedItems, page: updatedPage })
            } else {
                return null;
            }

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('dmTinhTrangCongTacPage', true);
export function getDmTinhTrangCongTacPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmTinhTrangCongTacPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/tinh-trang-cong-tac/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách tình trạng công tác bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmTinhTrangCongTacGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách tình trạng công tác bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    }
}

export function getDmTinhTrangCongTacAll(condition, done) {
    return dispatch => {
        const url = `/api/danh-muc/tinh-trang-cong-tac/all`;
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách tình trạng công tác bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmTinhTrangCongTacGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách tình trạng công tác bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    }
}

export function getDmTinhTrangCongTac(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/tinh-trang-cong-tac/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin tình trạng công tác bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    }
}

export function createDmTinhTrangCongTac(dmTinhTrangCongTac, done) {
    return dispatch => {
        const url = '/api/danh-muc/tinh-trang-cong-tac';
        T.post(url, { dmTinhTrangCongTac }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một tình trạng công tác bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới tình trạng công tác thành công!', 'success');
                dispatch(getDmTinhTrangCongTacAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo mới một tình trạng công tác bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    }
}

export function updateDmTinhTrangCongTac(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/tinh-trang-cong-tac';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu tình trạng công tác bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật tình trạng công tác thành công!', 'success');
                done && done(data.item);
                dispatch(getDmTinhTrangCongTacAll());
            }
        }, error => T.notify('Cập nhật dữ liệu tình trạng công tác bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    }
}

export function deleteDmTinhTrangCongTac(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/tinh-trang-cong-tac`;
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa tình trạng công tác bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa tình trạng công tác thành công!', 'success', false, 800);
                dispatch(getDmTinhTrangCongTacAll());
            }
            done && done();
        }, error => T.notify('Xóa tình trạng công tác bị lỗi!', 'danger'));
    }
}

export const SelectAdapter_DmTinhTrangCongTac = {
    ajax: false,
    getAll: getDmTinhTrangCongTacAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    condition: { kichHoat: 1 },
}