import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmQuanHeGiaDinhGetAll = 'DmQuanHeGiaDinh:GetAll';
const DmQuanHeGiaDinhGetPage = 'DmQuanHeGiaDinh:GetPage';
const DmQuanHeGiaDinhUpdate = 'DmQuanHeGiaDinh:Update';

export default function DmQuanHeGiaDinhReducer(state = null, data) {
    switch (data.type) {
        case DmQuanHeGiaDinhGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmQuanHeGiaDinhGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmQuanHeGiaDinhUpdate:
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
T.initPage('dmQuanHeGiaDinh', true);
export function getDmQuanHeGiaDinhPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmQuanHeGiaDinh', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/quan-he-gia-dinh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách quan hệ gia đình bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmQuanHeGiaDinhGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách quan hệ gia đình bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmQuanHeGiaDinhAll(condition, done) {
    return dispatch => {
        const url = '/api/danh-muc/quan-he-gia-dinh/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách quan hệ gia đình bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmQuanHeGiaDinhGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách quan hệ gia đình bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmQuanHeGiaDinh(ma, done) {
    return () => {
        const url = `/api/danh-muc/quan-he-gia-dinh/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin quan hệ gia đình bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmQuanHeGiaDinh(dmQuanHeGiaDinh, done) {
    return dispatch => {
        const url = '/api/danh-muc/quan-he-gia-dinh';
        T.post(url, { dmQuanHeGiaDinh }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một quan hệ gia đình bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới quan hệ gia đình thành công!', 'success');
                dispatch(getDmQuanHeGiaDinhPage());
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo mới một quan hệ gia đình bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmQuanHeGiaDinh(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/quan-he-gia-dinh';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu quan hệ gia đình bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật quan hệ gia đình thành công!', 'success');
                done && done(data.item);
                dispatch(getDmQuanHeGiaDinhPage());
            }
        }, (error) => T.notify('Cập nhật dữ liệu quan hệ gia đình bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmQuanHeGiaDinh(ma, done) {
    return dispatch => {
        const url = '/api/danh-muc/quan-he-gia-dinh';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa quan hệ gia đình bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa quan hệ gia đình thành công!', 'success', false, 800);
                dispatch(getDmQuanHeGiaDinhPage());
            }
            done && done();
        }, () => T.notify('Xóa quan hệ gia đình bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_DmQuanHeGiaDinh = {
    ajax: false,
    getAll: getDmQuanHeGiaDinhAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    condition: { kichHoat: 1 },
};