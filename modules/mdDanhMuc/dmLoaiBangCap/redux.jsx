import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmLoaiBangCapGetAll = 'DmLoaiBangCap:GetAll';
const DmLoaiBangCapGetPage = 'DmLoaiBangCap:GetPage';
const DmLoaiBangCapUpdate = 'DmLoaiBangCap:Update';

export default function dmLoaiBangCapReducer(state = null, data) {
    switch (data.type) {
        case DmLoaiBangCapGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmLoaiBangCapGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmLoaiBangCapUpdate:
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
T.initPage('dmLoaiBangCapPage', true);
export function getDmLoaiBangCapPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmLoaiBangCapPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/loai-bang-cap/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại bằng cấp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmLoaiBangCapGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách loại bằng cấp bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmLoaiBangCapAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/loai-bang-cap/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại bằng cấp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmLoaiBangCapGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách loại bằng cấp bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmLoaiBangCap(ma, done) {
    return () => {
        const url = `/api/danh-muc/loai-bang-cap/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin loại bằng cấp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmLoaiBangCap(dmLoaiBangCap, done) {
    return dispatch => {
        const url = '/api/danh-muc/loai-bang-cap';
        T.post(url, { dmLoaiBangCap }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một loại bằng cấp bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới một loại bằng cấp thành công!', 'success');
                dispatch(getDmLoaiBangCapPage());
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo mới một loại bằng cấp bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmLoaiBangCap(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/loai-bang-cap';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu loại bằng cấp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật dữ liệu loại bằng cấp thành công!', 'success');
                done && done(data.item);
                dispatch(getDmLoaiBangCapPage());
            }
        }, (error) => T.notify('Cập nhật dữ liệu loại bằng cấp bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmLoaiBangCap(ma, done) {
    return dispatch => {
        const url = '/api/danh-muc/loai-bang-cap';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa loại bằng cấp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa loại bằng cấp thành công!', 'success', false, 800);
                dispatch(getDmLoaiBangCapPage());
            }
            done && done();
        }, () => T.notify('Xóa loại bằng cấp bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_DmLoaiBangCap = {
    ajax: false,
    getAll: getDmLoaiBangCapAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    condition: { kichHoat: 1 },
};