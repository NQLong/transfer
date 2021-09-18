import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmDienChinhSachGetAll = 'DmDienChinhSach:GetAll';
const DmDienChinhSachGetPage = 'DmDienChinhSach:GetPage';
const DmDienChinhSachUpdate = 'DmDienChinhSach:Update';

export default function dmDienChinhSachReducer(state = null, data) {
    switch (data.type) {
        case DmDienChinhSachGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmDienChinhSachGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmDienChinhSachUpdate:
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
T.initPage('dmDienChinhSachPage', true);
export function getDmDienChinhSachPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmDienChinhSachPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/dien-chinh-sach/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách diện chính sách bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmDienChinhSachGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách diện chính sách bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmDienChinhSachAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/dien-chinh-sach/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách diện chính sách bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmDienChinhSachGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách diện chính sách bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmDienChinhSach(ma, done) {
    return () => {
        const url = `/api/danh-muc/dien-chinh-sach/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin diện chính sách bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmDienChinhSach(dmDienChinhSach, done) {
    return dispatch => {
        const url = '/api/danh-muc/dien-chinh-sach';
        T.post(url, { dmDienChinhSach }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một diện chính sách bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo diện chính sách thành công!', 'success');
                dispatch(getDmDienChinhSachPage());
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo mới một diện chính sách bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmDienChinhSach(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/dien-chinh-sach';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu diện chính sách bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật diện chính sách thành công!', 'success');
                done && done(data.item);
                dispatch(getDmDienChinhSachPage());
            }
        }, (error) => T.notify('Cập nhật dữ liệu diện chính sách bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmDienChinhSach(ma, done) {
    return dispatch => {
        const url = '/api/danh-muc/dien-chinh-sach';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa diện chính sách bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa diện chính sách thành công!', 'success', false, 800);
                dispatch(getDmDienChinhSachPage());
            }
            done && done();
        }, () => T.notify('Xóa diện chính sách bị lỗi!', 'danger'));
    };
}
