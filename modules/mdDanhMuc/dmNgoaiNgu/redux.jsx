import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmNgoaiNguGetAll = 'DmNgoaiNgu:GetAll';
const DmNgoaiNguGetPage = 'DmNgoaiNgu:GetPage';
const DmNgoaiNguUpdate = 'DmNgoaiNgu:Update';

export default function DmNgoaiNguReducer(state = null, data) {
    switch (data.type) {
        case DmNgoaiNguGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmNgoaiNguGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmNgoaiNguUpdate:
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
export function getDmNgoaiNguAll(condition, done) {
    return dispatch => {
        const url = '/api/danh-muc/ngoai-ngu/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách ngoại ngữ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmNgoaiNguGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách ngoại ngữ bị lỗi!', 'danger'));
    };
}

T.initPage('pageDmNgoaiNgu');
export function getDmNgoaiNguPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDmNgoaiNgu', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/ngoai-ngu/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách ngoại ngữ bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);                     
                dispatch({ type: DmNgoaiNguGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách ngoại ngữ bị lỗi!', 'danger'));
    };
}

export function getDmNgoaiNgu(ma, done) {
    return () => {
        const url = `/api/danh-muc/ngoai-ngu/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin ngoại ngữ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function createDmNgoaiNgu(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/ngoai-ngu';
        T.post(url, { item }, data => {
            if (data.error) {
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo ngoại ngữ thành công!', 'success');
                dispatch(getDmNgoaiNguPage());
                if (done) done(data);
            }
        }, () => T.notify('Tạo ngoại ngữ bị lỗi!', 'danger'));
    };
}

export function deleteDmNgoaiNgu(ma) {
    return dispatch => {
        const url = '/api/danh-muc/ngoai-ngu';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục  bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Tổ chức cơ sở xuất bản đã xóa thành công!', 'success', false, 800);
                dispatch(getDmNgoaiNguPage());
            }
        }, () => T.notify('Xóa tổ chức cơ sở xuất bản bị lỗi!', 'danger'));
    };
}

export function updateDmNgoaiNgu(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/ngoai-ngu';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật ngoại ngữ bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật ngoại ngữ thành công!', 'success');
                done && done(data.item);
                dispatch(getDmNgoaiNguPage());
            }
        }, () => T.notify('Cập nhật ngoại ngữ bị lỗi!', 'danger'));
    };
}

export function changeDmNgoaiNgu(item) {
    return { type: DmNgoaiNguUpdate, item };
}

export const SelectAdapter_DmNgoaiNgu = {
    ajax: false,
    getAll: getDmNgoaiNguAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    condition: { kichHoat: 1 },
};