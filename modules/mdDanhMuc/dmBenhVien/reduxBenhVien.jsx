import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmBenhVienGetAll = 'DmBenhVien:GetAll';
const DmBenhVienGetPage = 'DmBenhVien:GetPage';
const DmBenhVienUpdate = 'DmBenhVien:Update';

export default function dmBenhVienReducer(state = null, data) {
    switch (data.type) {
        case DmBenhVienGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmBenhVienGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmBenhVienUpdate:
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
T.initPage('dmBenhVienPage', true);
export function getDmBenhVienPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmBenhVienPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/benh-vien/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách bệnh viện bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmBenhVienGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách bệnh viện bị lỗi!', 'danger'));
    };
}

export function getDmBenhVienAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/benh-vien/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách bệnh viện bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmBenhVienGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách bệnh viện bị lỗi!', 'danger'));
    };
}

export function getDmBenhVien(ma, done) {
    return () => {
        const url = `/api/danh-muc/benh-vien/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin bệnh viện bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmBenhVien(dmBenhVien, done) {
    return dispatch => {
        const url = '/api/danh-muc/benh-vien';
        T.post(url, { dmBenhVien }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một bệnh viện bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới bệnh viện thành công!', 'success');
                dispatch(getDmBenhVienPage());
                if (done) done(data);
            }
        }, () => T.notify('Tạo mới một bệnh viện bị lỗi!', 'danger'));
    };
}

export function updateDmBenhVien(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/benh-vien';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu bệnh viện bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật bệnh viện thành công!', 'success');
                done && done(data.item);
                dispatch(getDmBenhVienPage());
            }
        }, () => T.notify('Cập nhật dữ liệu bệnh viện bị lỗi!', 'danger'));
    };
}

export function deleteDmBenhVien(ma, done) {
    return dispatch => {
        const url = '/api/danh-muc/benh-vien';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa bệnh viện bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa bệnh viện thành công!', 'success', false, 800);
                dispatch(getDmBenhVienPage());
            }
            done && done();
        }, () => T.notify('Xóa bệnh viện bị lỗi!', 'danger'));
    };
}

export function createMultiDmBenhVien(dmBenhVien, done) {
    return () => {
        const url = '/api/danh-muc/benh-vien/multiple';
        T.post(url, { dmBenhVien }, data => {
            if (data.error) {
                T.notify('Upload thông tin bệnh viện có lỗi!', 'danger');
            } else {
                T.notify(`Cập nhật ${data && data.items ? data.items.length + ' ' : ''} bệnh viện thành công!`, 'success');
            }
            done && done();
        }, () => T.notify('Upload thông tin bệnh viện có lỗi!', 'danger'));
    };
}
