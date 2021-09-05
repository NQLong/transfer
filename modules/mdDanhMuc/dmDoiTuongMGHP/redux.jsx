import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmDoiTuongMghpGetAll = 'dmDoiTuongMGHP:GetAll';
const DmDoiTuongMghpGetPage = 'dmDoiTuongMGHP:GetPage';
const DmDoiTuongMghpUpdate = 'dmDoiTuongMGHP:Update';

export default function dmDoiTuongMghpReducer(state = null, data) {
    switch (data.type) {
        case DmDoiTuongMghpGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmDoiTuongMghpGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmDoiTuongMghpUpdate:
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
T.initPage('dmDoiTuongMghpPage', true);
export function getDmDoiTuongMghpPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmDoiTuongMghpPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/doi-tuong-mghp/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách đối tượng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmDoiTuongMghpGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách đối tượng bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function getDmDoiTuongMghpAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/doi-tuong-mghp/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách đối tượng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmDoiTuongMghpGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách đối tượng bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function getDmDoiTuongMghp(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/doi-tuong-mghp/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin đối tượng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmDoiTuongMghp(dmDoiTuongMGHP, done) {
    return dispatch => {
        const url = '/api/danh-muc/doi-tuong-mghp';
        T.post(url, { dmDoiTuongMGHP }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một đối tượng bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmDoiTuongMghpAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo mới một đối tượng bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function updateDmDoiTuongMghp(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/doi-tuong-mghp';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu đối tượng MGHP bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                done && done(data.item);
                dispatch(getDmDoiTuongMghpAll());
            }
        }, error => T.notify('Cập nhật dữ liệu đối tượng MGHP bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    };
}

export function deleteDmDoiTuongMghp(ma, done) {
    return dispatch => {
        const url = '/api/danh-muc/doi-tuong-mghp';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa đối tượng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa đối tượng thành công!', 'success', false, 800);
                dispatch(getDmDoiTuongMghpAll());
            }
            done && done();
        }, error => T.notify('Xóa châu bị lỗi!', 'danger'));
    };
}