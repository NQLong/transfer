import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmLoaiHinhNghienCuuGetAll = 'DmLoaiHinhNghienCuu:GetAll';
const DmLoaiHinhNghienCuuGetPage = 'DmLoaiHinhNghienCuu:GetPage';
const DmLoaiHinhNghienCuuUpdate = 'DmLoaiHinhNghienCuu:Update';

export default function DmLoaiHinhNghienCuuReducer(state = null, data) {
    switch (data.type) {
        case DmLoaiHinhNghienCuuGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmLoaiHinhNghienCuuGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmLoaiHinhNghienCuuUpdate:
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
T.initPage('pageDmLoaiHinhNghienCuu');
export function getDmLoaiHinhNghienCuuPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmLoaiHinhNghienCuu', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/loai-hinh-nghien-cuu/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại hình nghiên cứu bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmLoaiHinhNghienCuuGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách loại hình nghiên cứu bị lỗi!', 'danger'));
    }
}

export function getDmLoaiHinhNghienCuuAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }
    return dispatch => {
        const url = `/api/danh-muc/loai-hinh-nghien-cuu/all`;
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại hình nghiên cứu bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmLoaiHinhNghienCuuGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách loại hình nghiên cứu bị lỗi!', 'danger'));
    }
}

export function getDmLoaiHinhNghienCuu(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/loai-hinh-nghien-cuu/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin loại hình nghiên cứu bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    }
}

export function createDmLoaiHinhNghienCuu(item, done) {
    return dispatch => {
        const url = `/api/danh-muc/loai-hinh-nghien-cuu`;
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo loại hình nghiên cứu bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo loại hình nghiên cứu thành công!', 'success');
                dispatch(getDmLoaiHinhNghienCuuAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo loại hình nghiên cứu bị lỗi!', 'danger'));
    }
}

export function deleteDmLoaiHinhNghienCuu(ma) {
    return dispatch => {
        const url = `/api/danh-muc/loai-hinh-nghien-cuu`;
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục loại hình nghiên cứu bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmLoaiHinhNghienCuuAll());
            }
        }, error => T.notify('Xóa loại hình nghiên cứu bị lỗi!', 'danger'));
    }
}

export function updateDmLoaiHinhNghienCuu(ma, changes, done) {
    return dispatch => {
        const url = `/api/danh-muc/loai-hinh-nghien-cuu`;
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin loại hình nghiên cứu bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin loại hình nghiên cứu thành công!', 'success');
                dispatch(getDmLoaiHinhNghienCuuAll());
            }
        }, error => T.notify('Cập nhật thông tin loại hình nghiên cứu bị lỗi!', 'danger'));
    }
}

export function changeDmLoaiHinhNghienCuu(item) {
    return { type: DmLoaiHinhNghienCuuUpdate, item };
}

export const SelectAdapter_DmLoaiHinhNghienCuu = {
    ajax: false,
    getAll: getDmLoaiHinhNghienCuuAll,
    processResults: response => ({ results: response ? response.filter(item => item.kichHoat == 1).map(item => ({ value: item.ma, text: item.ten })) : [] }),
}

export const SelectAdapter_DmLoaiHinhNghienCuuTmdt = (maCha) => {
    return {
        ajax: false,
        getAll: getDmLoaiHinhNghienCuuAll,
        processResults: response => ({ results: response ? response.filter(item => item.kichHoat == 1).map(item => ({ value: item.ma, text: item.ten })) : [] }),
        condition: { maCha: maCha }
    }
}