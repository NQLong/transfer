
import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmLuongCoSoGetAll = 'DmLuongCoSo:GetAll';
const DmLuongCoSoGetPage = 'DmLuongCoSo:GetPage';
const DmLuongCoSoUpdate = 'DmLuongCoSo:Update';

export default function dmLuongCoSoReducer(state = null, data) {
    switch (data.type) {
        case DmLuongCoSoGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmLuongCoSoGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmLuongCoSoUpdate:
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
T.initPage('dmLuongCoSoPage', true);
export function getDmLuongCoSoPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmLuongCoSoPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/luong-co-so/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách lương cơ sở bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmLuongCoSoGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách lương cơ sở bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function getDmLuongCoSoAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/luong-co-so/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách lương cơ sở bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmLuongCoSoGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách lương cơ sở bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function getDmLuongCoSo(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/luong-co-so/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin lương cơ sở bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmLuongCoSo(dmLuongCoSo, done) {
    return dispatch => {
        const url = '/api/danh-muc/luong-co-so';
        T.post(url, { dmLuongCoSo }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một lương cơ sở bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmLuongCoSoPage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo mới một lương cơ sở bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function updateDmLuongCoSo(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/luong-co-so';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu lương cơ sở bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                done && done(data.item);
                dispatch(getDmLuongCoSoPage());
            }
        }, error => T.notify('Cập nhật dữ liệu lương cơ sở bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function deleteDmLuongCoSo(ma, done) {
    return dispatch => {
        const url = '/api/danh-muc/luong-co-so';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa lương cơ sở bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa lương cơ sở thành công!', 'success', false, 800);
                dispatch(getDmLuongCoSoPage());
            }
            done && done();
        }, error => T.notify('Xóa lương cơ sở bị lỗi!', 'danger'));
    };
}
