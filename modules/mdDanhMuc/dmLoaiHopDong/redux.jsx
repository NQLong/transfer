import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmLoaiDonViGetAll = 'DmLoaiDonVi:GetAll';
const DmLoaiDonViGetPage = 'DmLoaiDonVi:GetPage';
const DmLoaiDonViUpdate = 'DmLoaiDonVi:Update';

export default function dmLoaiDonViReducer(state = null, data) {
    switch (data.type) {
        case DmLoaiDonViGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmLoaiDonViGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmLoaiDonViUpdate:
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
export function getdmLoaiHopDongAll(condition, done) {
    return dispatch => {
        const url = '/api/danh-muc/loai-hop-dong/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại hợp đồng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmLoaiDonViGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách loại hợp đồng bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

T.initPage('pageDmLoaiHopDong');
export function getDmLoaiHopDongPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDmLoaiHopDong', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/loai-hop-dong/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại hợp đồng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);                
                dispatch({ type: DmLoaiDonViGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách loại hợp đồng bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));    };
}

export function getDmLoaiHopDong(ma, done) {
    return () => {
        const url = `/api/danh-muc/loai-hop-dong/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin loại hợp đồng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function createDmLoaiHopdong(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/loai-hop-dong';
        T.post(url, { item }, data => {
            if (data.error) {
                if (data.error.errorNum == 1) {
                    return T.notify('Tạo loại hợp đồng không được trùng mã' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                }
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo lọai hợp đồng thành công!', 'success');
                dispatch(getDmLoaiHopDongPage());
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo loại hợp đồng bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmLoaiHopDong(ma) {
    return dispatch => {
        const url = '/api/danh-muc/loai-hop-dong';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục  bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Loại hợp đồng đã xóa thành công!', 'success', false, 800);
                dispatch(getDmLoaiHopDongPage());
            }
        }, (error) => T.notify('Xóa loại hợp đồng bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmLoaiHopDong(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/loai-hop-dong';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông loại hợp đồng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin loại hợp đồng thành công!', 'success');
                dispatch(getDmLoaiHopDongPage());
                done && done(data.item);
            }
        }, (error) => T.notify('Cập nhật thông tin loại hợp đồng bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function changeDmLoaiHopDong(item) {
    return { type: DmLoaiDonViUpdate, item };
}

export const SelectAdapter_DmLoaiHopDong = {
    ajax: false,
    getAll: getdmLoaiHopDongAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    condition: { kichHoat: 1 },
};