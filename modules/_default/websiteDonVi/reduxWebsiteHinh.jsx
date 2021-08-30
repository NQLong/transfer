import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------

const WebsiteHinhGetAll = 'WebsiteHinh:GetAll';
const WebsiteHinhUpdate = 'WebsiteHinh:Update';
const WebsiteHinhHomeDv = 'WebsiteHinh:HomeDv';

export default function WebsiteReducer(state = null, data) {
    switch (data.type) {
        case WebsiteHinhGetAll:
            return Object.assign({}, state, { items: data.items });

        case WebsiteHinhHomeDv:
            return Object.assign({}, state, { homeDv: data.items, maDonVi: data.maDonVi });

        case WebsiteHinhUpdate:
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

export function getWebsiteHinhAll(maDonVi, done) {
    return dispatch => {
        const url = `/api/website/image/all/${maDonVi}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách hinh website đơn vị bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: WebsiteHinhGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách hình website đơn vị bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    }
}

export function getWebsiteHinh(ma, done) {
    return dispatch => {
        const url = `/api/website/image/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin hình website đơn vị bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    }
}

export function createWebsiteHinh(item, done) {
    return dispatch => {
        const url = `/api/website/image`;
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo hình website đơn vị bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo hình website đơn vị thành công!', 'success');
                dispatch(getWebsiteHinhAll(item.maDonVi));
                if (done) done(data);
            }
        }, error => T.notify('Tạo hình website đơn vị bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    }
}

export function deleteWebsiteHinh(item) {
    return dispatch => {
        const url = `/api/website/image`;
        T.delete(url, { ma: item.ma }, data => {
            if (data.error) {
                T.notify('Xóa hình website đơn vị bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Hình Website đơn vị đã xóa thành công!', 'success', false, 800);
                dispatch(getWebsiteHinhAll(item.maDonVi));
            }
        }, error => T.notify('Xóa hình website đơn vị bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    }
}

export function updateWebsiteHinh(maDonVi, ma, changes, done) {
    return dispatch => {
        const url = `/api/website/image`;
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin hình website đơn vị bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin hình website đơn vị thành công!', 'success');
                if (done) done(data.items);
                dispatch(getWebsiteHinhAll(maDonVi));
            }
        }, error => T.notify('Cập nhật thông tin hình website đơn vị bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    }
}

export function swapWebsiteHinh(maDonVi, ma, thuTu, isMoveUp, done) {
    return dispatch => {
        const url = '/api/website/image/swap';
        T.put(url, { ma, thuTu, isMoveUp, maDonVi }, data => {
            if (data.error) {
                T.notify('Thay đổi vị trí hình khoa bị lỗi!', 'danger')
                console.error('PUT: ' + url + '. ' + data.error);
            } else {

                if (done) done(data.items);
                dispatch(getWebsiteHinhAll(maDonVi));

            }
        }, error => T.notify('Thay đổi vị trí hình khoa bị lỗi!', 'danger'));
    }
}
//User 

export function getWebsiteHinhDonVi(maDonVi, done) {
    return dispatch => {
        const url = `/website/image/all/${maDonVi}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách hinh website đơn vị bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({
                    type: WebsiteHinhHomeDv,
                    items: data.items ? data.items : [], maDonVi
                });
                if (done) done(data.items);
            }
        }, error => T.notify('Lấy danh sách hình website đơn vị bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    }
}

export function changeWebsiteHinh(item) {
    return { type: WebsiteHinhUpdate, item };
}
