import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmNghiCongTacGetAll = 'DmNghiCongTac:GetAll';
const DmNghiCongTacGetPage = 'DmNghiCongTac:GetPage';
const DmNghiCongTacUpdate = 'DmNghiCongTac:Update';

export default function dmNghiCongTacReducer(state = null, data) {
    switch (data.type) {
        case DmNghiCongTacGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmNghiCongTacGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmNghiCongTacUpdate:
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
T.initPage('dmNghiCongTacPage', true);
export function getDmNghiCongTacPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmNghiCongTacPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/nghi-cong-tac/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nghỉ công tác bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmNghiCongTacGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách nghỉ công tác bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmNghiCongTacAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/nghi-cong-tac/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách nghỉ công tác bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmNghiCongTacGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách nghỉ công tác bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmNghiCongTac(ma, done) {
    return () => {
        const url = `/api/danh-muc/nghi-cong-tac/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin nghỉ công tác bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmNghiCongTac(dmNghiCongTac, done) {
    return dispatch => {
        const url = '/api/danh-muc/nghi-cong-tac';
        T.post(url, { dmNghiCongTac }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một nghỉ công tác bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmNghiCongTacAll());
                T.notify('Tạo mới nghỉ công tác thành công!', 'success');
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo mới một nghỉ công tác bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmNghiCongTac(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/nghi-cong-tac';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu nghỉ công tác bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                done && done(data.item);
                T.notify('Cập nhật nghỉ công tác thành công!', 'success');
                dispatch(getDmNghiCongTacAll());
            }
        }, (error) => T.notify('Cập nhật dữ liệu nghỉ công tác bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmNghiCongTac(ma, done) {
    return dispatch => {
        const url = '/api/danh-muc/nghi-cong-tac';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa nghỉ công tác bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa nghỉ công tác thành công!', 'success', false, 800);
                dispatch(getDmNghiCongTacAll());
            }
            done && done(data.item);
        }, () => T.notify('Xóa nghỉ công tác bị lỗi!', 'danger'));
    };
}