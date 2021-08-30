import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmNhomMauGetAll = 'DmNhomMau:GetAll';
const DmNhomMauGetPage = 'DmNhomMau:GetPage';
const DmNhomMauUpdate = 'DmNhomMau:Update';

export default function dmNhomMauReducer(state = null, data) {
    switch (data.type) {
        case DmNhomMauGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmNhomMauGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmNhomMauUpdate:
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
T.initPage('dmNhomMauPage', true);
export function getDmNhomMauPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmNhomMauPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/nhom-mau/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nhóm máu bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmNhomMauGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách nhóm máu bị lỗi!', 'danger'));
    }
}

export function getDmNhomMauAll(done) {
    return dispatch => {
        const url = `/api/danh-muc/nhom-mau/all`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách nhóm máu bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmNhomMauGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách nhóm máu bị lỗi!', 'danger'));
    }
}

export function getDmNhomMau(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/nhom-mau/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin nhóm máu bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    }
}

export function createDmNhomMau(dmNhomMau, done) {
    return dispatch => {
        const url = '/api/danh-muc/nhom-mau';
        T.post(url, { dmNhomMau }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một nhóm máu bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới nhóm máu thành công!', 'success');
                dispatch(getDmNhomMauAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo mới một nhóm máu bị lỗi!', 'danger'));
    }
}

export function updateDmNhomMau(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/nhom-mau';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu nhóm máu bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật nhóm máu thành công!', 'success');
                done && done(data.item);
                dispatch(getDmNhomMauAll());
            }
        }, () => T.notify('Cập nhật dữ liệu nhóm máu bị lỗi!', 'danger'));
    }
}

export function deleteDmNhomMau(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/nhom-mau`;
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa nhóm máu bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa nhóm máu thành công!', 'success', false, 800);
                dispatch(getDmNhomMauAll());
            }
            done && done();
        }, error => T.notify('Xóa nhóm máu bị lỗi!', 'danger'));
    }
}

export const SelectAdapter_DmNhomMau = {
    ajax: false,
    getAll: getDmNhomMauAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    condition: { kichHoat: 1 },
}