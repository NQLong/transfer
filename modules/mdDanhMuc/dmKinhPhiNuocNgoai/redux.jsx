import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmKinhPhiNuocNgoaiGetAll = 'DmKinhPhiNuocNgoai:GetAll';
const DmKinhPhiNuocNgoaiGetPage = 'DmKinhPhiNuocNgoai:GetPage';
const DmKinhPhiNuocNgoaiUpdate = 'DmKinhPhiNuocNgoai:Update';

export default function DmKinhPhiNuocNgoaiReducer(state = null, data) {
    switch (data.type) {
        case DmKinhPhiNuocNgoaiGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmKinhPhiNuocNgoaiGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmKinhPhiNuocNgoaiUpdate:
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
T.initPage('pageDmKinhPhiNuocNgoai');
export function getDmKinhPhiNuocNgoaiPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmKinhPhiNuocNgoai', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/kinh-phi-nuoc-ngoai/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách kinh phí đi nước ngoài bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmKinhPhiNuocNgoaiGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách ca học bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmKinhPhiNuocNgoaiAll(condition, done) {
    return dispatch => {
        const url = '/api/danh-muc/kinh-phi-nuoc-ngoai/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách kinh phí đi nước ngoài bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmKinhPhiNuocNgoaiGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách kinh phí đi nước ngoài bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmKinhPhiNuocNgoai(ma, done) {
    return () => {
        const url = `/api/danh-muc/kinh-phi-nuoc-ngoai/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin kinh phí đi nước ngoài bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmKinhPhiNuocNgoai(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/kinh-phi-nuoc-ngoai';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo kinh phí đi nước ngoài bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmKinhPhiNuocNgoaiAll());
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo kinh phí đi nước ngoài bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmKinhPhiNuocNgoai(ma) {
    return dispatch => {
        const url = '/api/danh-muc/kinh-phi-nuoc-ngoai';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục kinh phí đi nước ngoài bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmKinhPhiNuocNgoaiAll());
            }
        }, (error) => T.notify('Xóa kinh phí đi nước ngoài bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmKinhPhiNuocNgoai(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/kinh-phi-nuoc-ngoai';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin kinh phí đi nước ngoài bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin kinh phí đi nước ngoài thành công!', 'success');
                dispatch(getDmKinhPhiNuocNgoaiAll());
            }
        }, (error) => T.notify('Cập nhật thông tin kinh phí đi nước ngoài bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function changeDmKinhPhiNuocNgoai(item) {
    return { type: DmKinhPhiNuocNgoaiUpdate, item };
}

export const SelectAdapter_DmKinhPhiNuocNgoai = {
    ajax: false,
    getAll: getDmKinhPhiNuocNgoaiAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    condition: { kichHoat: 1 },
};