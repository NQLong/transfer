import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmTuyenBenhVienGetAll = 'DmTuyenBenhVien:GetAll';
const DmTuyenBenhVienGetPage = 'DmTuyenBenhVien:GetPage';
const DmTuyenBenhVienUpdate = 'DmTuyenBenhVien:Update';

export default function dmTuyenBenhVienReducer(state = null, data) {
    switch (data.type) {
        case DmTuyenBenhVienGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmTuyenBenhVienGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmTuyenBenhVienUpdate:
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
T.initPage('dmTuyenBenhVienPage', true);
export function getDmTuyenBenhVienPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmTuyenBenhVienPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/tuyen-benh-vien/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách tuyến tuyến bệnh viện bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmTuyenBenhVienGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách tuyến bệnh viện bị lỗi!', 'danger'));
    }
}

export function getDmTuyenBenhVienAll(done) {
    return dispatch => {
        const url = `/api/danh-muc/tuyen-benh-vien/all`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách tuyến bệnh viện bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmTuyenBenhVienGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách tuyến bệnh viện bị lỗi!', 'danger'));
    }
}

export function getDmTuyenBenhVien(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/tuyen-benh-vien/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin tuyến bệnh viện bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    }
}

export function createDmTuyenBenhVien(dmTuyenBenhVien, done) {
    return dispatch => {
        const url = '/api/danh-muc/tuyen-benh-vien';
        T.post(url, { dmTuyenBenhVien }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một tuyến bệnh viện bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới tuyến bệnh viện thành công!', 'success');
                dispatch(getDmTuyenBenhVienAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo mới một tuyến bệnh viện bị lỗi!', 'danger'));
    }
}

export function updateDmTuyenBenhVien(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/tuyen-benh-vien';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu tuyến bệnh viện bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật tuyến bệnh viện thành công!', 'success');
                done && done(data.item);
                dispatch(getDmTuyenBenhVienAll());
            }
        }, () => T.notify('Cập nhật dữ liệu tuyến bệnh viện bị lỗi!', 'danger'));
    }
}

export function deleteDmTuyenBenhVien(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/tuyen-benh-vien`;
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa tuyến bệnh viện bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa tuyến bệnh viện thành công!', 'success', false, 800);
                dispatch(getDmTuyenBenhVienAll());
            }
            done && done();
        }, error => T.notify('Xóa tuyến bệnh viện bị lỗi!', 'danger'));
    }
}
