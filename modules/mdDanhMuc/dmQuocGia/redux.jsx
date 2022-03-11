import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmQuocGiaGetAll = 'DmQuocGia:GetAll';
const DmQuocGiaGetPage = 'DmQuocGia:GetPage';
const DmQuocGiaUpdate = 'DmQuocGia:Update';

export default function DmQuocGiaReducer(state = null, data) {
    switch (data.type) {
        case DmQuocGiaGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmQuocGiaGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmQuocGiaUpdate:
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
                        if (updatedPage.list[i].maCode == updatedItem.maCode) {
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
export const PageName = 'pageDmQuocGia';
T.initPage(PageName);
export function getDmQuocGiaPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/quoc-gia/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách Quốc gia bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmQuocGiaGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách Quốc gia bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmQuocGiaAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/quoc-gia/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách Quốc gia bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmQuocGiaGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách Quốc gia bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmQuocGia(maCode, done) {
    return () => {
        const url = `/api/danh-muc/quoc-gia/item/${maCode}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin Quốc gia bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmQuocGia(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/quoc-gia';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo Quốc gia bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo Quốc gia thành công!', 'success');
                dispatch(getDmQuocGiaPage());
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo Quốc gia bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmQuocGia(maCode, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/quoc-gia';
        T.put(url, { maCode, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin Quốc gia bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin Quốc gia thành công!', 'success');
                done && done(data.item);
                dispatch(getDmQuocGiaPage());
            }
        }, (error) => T.notify('Cập nhật thông tin Quốc gia bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmQuocGia(maCode) {
    return dispatch => {
        maCode;
        const url = '/api/danh-muc/quoc-gia';
        T.delete(url, { maCode }, data => {
            if (data.error) {
                T.notify('Xóa danh mục Quốc gia bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Khoa đã xóa thành công!', 'success', false, 800);
                dispatch(getDmQuocGiaPage());
            }
        }, (error) => T.notify('Xóa Quốc gia bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function changeDmQuocGia(item) {
    return { type: DmQuocGiaUpdate, item };
}

export function createDmQuocGiaByUpload(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/quoc-gia/createFromFile';
        T.post(url, { item }, data => {
            if (data.error) {
                console.error(`POST: ${url}.`, data.error);
            }
            T.notify('Tạo danh mục quốc gia thành công!', 'success');
            dispatch(getDmQuocGiaPage());
            if (done) done(data);

        }, () => T.notify('Tạo danh mục quốc gia bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_DmQuocGia = {
    ajax: true,
    url: '/api/danh-muc/quoc-gia/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.maCode, text: `${item.maCode}: ${item.tenQuocGia}` })) : [] }),
    fetchOne: (maCode, done) => (getDmQuocGia(maCode, item => item && done && done({ id: item.maCode, text: `${item.tenQuocGia.normalizedName()}` })))(),
    getOne: getDmQuocGia,
    processResultOne: response => response && ({ value: response.maCode, text: response.maCode + ': ' + response.tenQuocGia }),
};