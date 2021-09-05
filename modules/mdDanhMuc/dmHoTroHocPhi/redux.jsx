import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmHoTroHocPhiGetAll = 'DmHoTroHocPhi:GetAll';
const DmHoTroHocPhiGetPage = 'DmHoTroHocPhi:GetPage';
const DmHoTroHocPhiUpdate = 'DmHoTroHocPhi:Update';

export default function DmHoTroHocPhiReducer(state = null, data) {
    switch (data.type) {
        case DmHoTroHocPhiGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmHoTroHocPhiGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmHoTroHocPhiUpdate:
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
T.initPage('pageDmHoTroHocPhi');
export function getDmHoTroHocPhiPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmHoTroHocPhi', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/ho-tro-hoc-phi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách hỗ trợ học phí bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmHoTroHocPhiGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách hỗ trợ học phí bị lỗi!', 'danger'));
    };
}

export function getDmHoTroHocPhiAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/ho-tro-hoc-phi/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách hỗ trợ học phí bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmHoTroHocPhiGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách hỗ trợ học phí bị lỗi!', 'danger'));
    };
}

export function getDmHoTroHocPhi(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/ho-tro-hoc-phi/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin hỗ trợ học phí bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmHoTroHocPhi(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/ho-tro-hoc-phi';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo hỗ trợ học phí bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmHoTroHocPhiAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo hỗ trợ học phí bị lỗi!', 'danger'));
    };
}

export function deleteDmHoTroHocPhi(ma) {
    return dispatch => {
        const url = '/api/danh-muc/ho-tro-hoc-phi';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục hỗ trợ học phí bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmHoTroHocPhiAll());
            }
        }, error => T.notify('Xóa hỗ trợ học phí bị lỗi!', 'danger'));
    };
}

export function updateDmHoTroHocPhi(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/ho-tro-hoc-phi';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin hỗ trợ học phí bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin hỗ trợ học phí thành công!', 'success');
                dispatch(getDmHoTroHocPhiAll());
            }
        }, error => T.notify('Cập nhật thông tin hỗ trợ học phí bị lỗi!', 'danger'));
    };
}

export function changeDmHoTroHocPhi(item) {
    return { type: DmHoTroHocPhiUpdate, item };
}
