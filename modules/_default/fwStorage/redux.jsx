import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const FwStorageGetAll = 'FwStorage:GetAll';
const FwStorageGetPage = 'FwStorage:GetPage';
const FwStorageUpdate = 'FwStorage:Update';

export default function FwStorageReducer(state = null, data) {
    switch (data.type) {
        case FwStorageGetAll:
            return Object.assign({}, state, { items: data.items });
        case FwStorageGetPage:
            return Object.assign({}, state, { page: data.page });
        case FwStorageUpdate:
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
export function getFwStorageAll(done) {
    return dispatch => {
        const url = '/api/storage/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách lưu trữ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: FwStorageGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách lưu trữ bị lỗi!', 'danger'));
    };
}

T.initPage('pageFwStorage');
export function getFwStoragePage(pageNumber, pageSize) {
    const page = T.updatePage('pageFwStorage', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/storage/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách lưu trữ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                // if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: FwStorageGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách lưu trữ bị lỗi!', 'danger'));
    };
}

export function getFwStorage(ma, done) {
    return () => {
        const url = `/api/storage/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin lưu trữ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function getDonViById(ma, done) {
    return () => {
        const url = `/dm-don-vi/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin lưu trữ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function createFwStorage(item, done) {
    return dispatch => {
        const url = '/api/storage';
        T.post(url, { item }, data => {
            if (data.error) {
                if (data.error.errorNum == 1) {
                    return T.notify('Tạo loại đơn vị trường đại học không được trùng mã' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                }
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getFwStorageAll());
                if (done) done(data);
            }
        }, () => T.notify('Tạo lưu trữ bị lỗi!', 'danger'));
    };
}

export function deleteStorage(id) {
    return dispatch => {
        const url = '/api/storage';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa danh mục  bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa lưu trữ thành công!', 'success', false, 800);
                dispatch(getFwStoragePage());
            }
        }, () => T.notify('Xóa lưu trữ bị lỗi!', 'danger'));
    };
}

export function updateStorage(id, changes, done) {
    return dispatch => {
        const url = '/api/storage';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông lưu trữ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật lưu trữ thành công!', 'success');
                dispatch(getFwStoragePage());
            }
        }, () => T.notify('Cập nhật thông tin lưu trữ bị lỗi!', 'danger'));
    };
}

export function changeFwStorage(item) {
    return { type: FwStorageUpdate, item };
}

export const SelectAdapter_FwStorage = {
    ajax: true,
    url: '/api/storage/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({
        results: response && response.page && response.page.list ?
            response.page.list.map(item => ({ id: item.id, text: `${item.nameDisplay}` })) : []
    }),
    getOne: getStorageItem,
    processResultOne: response => ({
        value: response.item.id,
        text: `${response.item.nameDisplay}`
    }),
};

export function getStorageItem(id, done) {
    return () => {
        const url = `/api/storage/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin người dùng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}