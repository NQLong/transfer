import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmNhomTaiSanCoDinhGetAll = 'DmNhomTaiSanCoDinh:GetAll';
const DmNhomTaiSanCoDinhGetPage = 'DmNhomTaiSanCoDinh:GetPage';
const DmNhomTaiSanCoDinhUpdate = 'DmNhomTaiSanCoDinh:Update';

export default function dmNhomTaiSanCoDinhReducer(state = null, data) {
    switch (data.type) {
        case DmNhomTaiSanCoDinhGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmNhomTaiSanCoDinhGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmNhomTaiSanCoDinhUpdate:
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
export function getdmNhomTaiSanCoDinhAll(condition, done) {
    return dispatch => {
        const url = `/api/danh-muc/nhom-tai-san-co-dinh/all`;
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nhóm tài sản cố đinh bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmNhomTaiSanCoDinhGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách nhóm tài sản cố đinh bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    }
}

T.initPage('dmNhomTaiSanCoDinh');
export function getDmNhomTaiSanCoDinhPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmNhomTaiSanCoDinh', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/nhom-tai-san-co-dinh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nhóm tài sản cố đinh bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmNhomTaiSanCoDinhGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách nhóm tài sản cố đinh bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    }
}

export function getDmNhomTaiSanCoDinh(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/nhom-tai-san-co-dinh/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin nhóm tài sản cố định bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    }
}

export function createDmNhomTaiSanCoDinh(item, done) {
    return dispatch => {
        const url = `/api/danh-muc/nhom-tai-san-co-dinh`;
        T.post(url, { item }, data => {
            if (data.error) {
                if (data.error.errorNum == 1) {
                    return T.notify('Tạo nhóm tài sản cố định không được trùng mã' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                }
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getdmNhomTaiSanCoDinhAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo nhóm tài sản cố định bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    }
}

export function deleteDmNhomTaiSanCoDinh(ma) {
    return dispatch => {
        const url = `/api/danh-muc/nhom-tai-san-co-dinh`;
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục  bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Khoa đã xóa thành công!', 'success', false, 800);
                dispatch(getdmNhomTaiSanCoDinhPage());
            }
        }, error => T.notify('Xóa nhóm tài sản cố định bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    }
}

export function updateDmNhomTaiSanCoDinh(ma, changes, done) {
    return dispatch => {
        const url = `/api/danh-muc/nhom-tai-san-co-dinh`;
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông nhóm tài sản cố định bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin nhóm tài sản cố định thành công!', 'success');
                dispatch(getDmNhomTaiSanCoDinhPage());
            }
        }, error => T.notify('Cập nhật thông tin nhóm tài sản cố định bị lỗi' + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    }
}

export function changeDmNhomTaiSanCoDinh(item) {
    return { type: DmNhomTaiSanCoDinhUpdate, item };
}

export const SelectAdapter_DmNhomTaiSanCoDinh = {
    ajax: false,
    getAll: getdmNhomTaiSanCoDinhAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    condition: { kichHoat: 1 },
}