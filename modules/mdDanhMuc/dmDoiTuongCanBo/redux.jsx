import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmDoiTuongCanBoGetAll = 'DmDoiTuongCanBo:GetAll';
const DmDoiTuongCanBoGetPage = 'DmDoiTuongCanBo:GetPage';
const DmDoiTuongCanBoUpdate = 'DmDoiTuongCanBo:Update';

export default function dmDoiTuongCanBoReducer(state = null, data) {
    switch (data.type) {
        case DmDoiTuongCanBoGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmDoiTuongCanBoGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmDoiTuongCanBoUpdate:
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
export function getDmDoiTuongCanBoAll(condition, done) {
    return dispatch => {
        const url = '/api/danh-muc/doi-tuong-can-bo/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách đối tượng cán bộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmDoiTuongCanBoGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách đối tượng cán bộ bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

T.initPage('pageDmDoiTuongCanBo');
export function getDmDoiTuongCanBoPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmDoiTuongCanBo', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/doi-tuong-can-bo/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách đối tượng cán bộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmDoiTuongCanBoGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách đối tượng cán bộ bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmDoiTuongCanBo(ma, done) {
    return () => {
        const url = `/api/danh-muc/doi-tuong-can-bo/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin đối tượng cán bộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function createDmDoiTuongCanBo(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/doi-tuong-can-bo';
        T.post(url, { item }, data => {
            if (data.error) {
                if (data.error.errorNum == 1) {
                    return T.notify('Tạo đối tượng cán bộ không được trùng mã' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                }
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmDoiTuongCanBoAll());
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo đối tượng cán bộ bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmDoiTuongCanBo(ma) {
    return dispatch => {
        const url = '/api/danh-muc/doi-tuong-can-bo';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục  bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Khoa đã xóa thành công!', 'success', false, 800);
                dispatch(getDmDoiTuongCanBoAll());
            }
        }, (error) => T.notify('Xóa đối tượng cán bộ bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmDoiTuongCanBo(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/doi-tuong-can-bo';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông đối tượng cán bộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin đối tượng cán bộ thành công!', 'success');
                dispatch(getDmDoiTuongCanBoAll());
            }
        }, (error) => T.notify('Cập nhật thông tin đối tượng cán bộ bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function changeDmDoiTuongCanBo(item) {
    return { type: DmDoiTuongCanBoUpdate, item };
}

export const SelectAdapter_DmDoiTuongCanBo = {
    ajax: false,
    getAll: getDmDoiTuongCanBoAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    condition: { kichHoat: 1 },
};
