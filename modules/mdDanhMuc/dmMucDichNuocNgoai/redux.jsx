import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmMucDichNuocNgoaiGetAll = 'DmMucDichNuocNgoai:GetAll';
const DmMucDichNuocNgoaiGetPage = 'DmMucDichNuocNgoai:GetPage';
const DmMucDichNuocNgoaiUpdate = 'DmMucDichNuocNgoai:Update';

export default function DmMucDichNuocNgoaiReducer(state = null, data) {
    switch (data.type) {
        case DmMucDichNuocNgoaiGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmMucDichNuocNgoaiGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmMucDichNuocNgoaiUpdate:
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
T.initPage('pageDmMucDichNuocNgoai');
export function getDmMucDichNuocNgoaiPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmMucDichNuocNgoai', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/muc-dich-nuoc-ngoai/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách mục đích nước ngoài bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmMucDichNuocNgoaiGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách ca học bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    }
}

export function getDmMucDichNuocNgoaiAll(condition, done) {
    return dispatch => {
        const url = `/api/danh-muc/muc-dich-nuoc-ngoai/all`;
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách mục đích nước ngoài bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmMucDichNuocNgoaiGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách mục đích nước ngoài bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    }
}

export function getDmMucDichNuocNgoai(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/muc-dich-nuoc-ngoai/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin mục đích nước ngoài bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    }
}

export function createDmMucDichNuocNgoai(item, done) {
    return dispatch => {
        const url = `/api/danh-muc/muc-dich-nuoc-ngoai`;
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo mục đích nước ngoài bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmMucDichNuocNgoaiAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo mục đích nước ngoài bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    }
}

export function deleteDmMucDichNuocNgoai(ma) {
    return dispatch => {
        const url = `/api/danh-muc/muc-dich-nuoc-ngoai`;
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục mục đích nước ngoài bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmMucDichNuocNgoaiAll());
            }
        }, error => T.notify('Xóa mục đích nước ngoài bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    }
}

export function updateDmMucDichNuocNgoai(ma, changes, done) {
    return dispatch => {
        const url = `/api/danh-muc/muc-dich-nuoc-ngoai`;
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin mục đích nước ngoài bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin mục đích nước ngoài thành công!', 'success');
                dispatch(getDmMucDichNuocNgoaiAll());
            }
        }, error => T.notify('Cập nhật thông tin mục đích nước ngoài bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    }
}

export function changeDmMucDichNuocNgoai(item) {
    return { type: DmMucDichNuocNgoaiUpdate, item };
}

export const SelectAdapter_DmMucDichNuocNgoai = {
    ajax: false,
    getAll: getDmMucDichNuocNgoaiAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.moTa })) : [] }),
    condition: { kichHoat: 1 },
}