import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmQuanHeChuHoGetAll = 'DmQuanHeChuHo:GetAll';
const DmQuanHeChuHoGetPage = 'DmQuanHeChuHo:GetPage';
const DmQuanHeChuHoUpdate = 'DmQuanHeChuHo:Update';

export default function dmQuanHeChuHoReducer(state = null, data) {
    switch (data.type) {
        case DmQuanHeChuHoGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmQuanHeChuHoGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmQuanHeChuHoUpdate:
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
T.initPage('dmQuanHeChuHoPage', true);
export function getDmQuanHeChuHoPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmQuanHeChuHoPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/quan-he-chu-ho/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách quan hệ chủ hộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmQuanHeChuHoGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách quan hệ chủ hộ bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    }
}

export function getDmQuanHeChuHoAll(done) {
    return dispatch => {
        const url = `/api/danh-muc/quan-he-chu-ho/all`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách quan hệ chủ hộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmQuanHeChuHoGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách quan hệ chủ hộ bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    }
}

export function getDmQuanHeChuHo(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/quan-he-chu-ho/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin quan hệ chủ hộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    }
}

export function createDmQuanHeChuHo(dmQuanHeChuHo, done) {
    return dispatch => {
        const url = '/api/danh-muc/quan-he-chu-ho';
        T.post(url, { dmQuanHeChuHo }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một quan hệ chủ hộ bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmQuanHeChuHoPage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo mới một quan hệ chủ hộ bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    }
}

export function updateDmQuanHeChuHo(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/quan-he-chu-ho';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu quan hệ chủ hộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                done && done(data.item);
                dispatch(getDmQuanHeChuHoPage());
            }
        }, error => T.notify('Cập nhật dữ liệu quan hệ chủ hộ bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    }
}

export function deleteDmQuanHeChuHo(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/quan-he-chu-ho`;
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa quan hệ chủ hộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa quan hệ chủ hộ thành công!', 'success', false, 800);
                dispatch(getDmQuanHeChuHoPage());
            }
            done && done();
        }, error => T.notify('Xóa quan hệ chủ hộ bị lỗi!', 'danger'));
    }
}