import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SdhDmKhoiKienThucGetPage = 'SdhDmKhoiKienThuc:GetPage';
const SdhDmKhoiKienThucUpdate = 'SdhDmKhoiKienThuc:Update';

export default function SdhDmKhoiKienThucReducer(state = null, data) {
    switch (data.type) {
        case SdhDmKhoiKienThucGetPage:
            return Object.assign({}, state, { page: data.page });
        case SdhDmKhoiKienThucUpdate:
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
T.initPage('pageSdhDmKhoiKienThuc');

export function getSdhDmKhoiKienThucPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageSdhDmKhoiKienThuc', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/sau-dai-hoc/khoi-kien-thuc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách khối kiến thức bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: SdhDmKhoiKienThucGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách khối kiến thức bị lỗi!', 'danger'));
    };
}

export function getSdhDmKhoiKienThuc(ma, done) {
    return () => {
        const url = `/api/sau-dai-hoc/khoi-kien-thuc/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin khối kiến thức bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createSdhDmKhoiKienThuc(item, done) {
    return dispatch => {
        const url = '/api/sau-dai-hoc/khoi-kien-thuc';
        T.post(url, { data: item }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo khối kiến thức bị lỗi', 'danger');
                console.error(`POST: ${url}.`, data.error);
                if (done) done(data.error);
            } else {
                T.notify('Tạo mới thông tin khối kiến thức thành công!', 'success');
                dispatch(getSdhDmKhoiKienThucPage());
                if (done) done(data);
            }
        }, () => T.notify('Tạo khối kiến thức bị lỗi!', 'danger'));
    };
}

export function deleteSdhDmKhoiKienThuc(ma) {
    return dispatch => {
        const url = '/api/sau-dai-hoc/khoi-kien-thuc';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục khối kiến thức bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getSdhDmKhoiKienThucPage());
            }
        }, () => T.notify('Xóa khối kiến thức bị lỗi!', 'danger'));
    };
}

export function updateSdhDmKhoiKienThuc(id, changes, done) {
    return dispatch => {
        const url = '/api/sau-dai-hoc/khoi-kien-thuc';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật thông tin khối kiến thức bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin khối kiến thức thành công!', 'success');
                dispatch(getSdhDmKhoiKienThucPage());
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin khối kiến thức bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_SdhDmKhoiKienThucAll = (khoiCha = null) => {
    return {
        ajax: true,
        url: '/api/sau-dai-hoc/khoi-kien-thuc/all',
        data: params => ({ condition: params.term, khoiCha }),
        processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.ten, khoiCha: item.khoiCha })) : [] }),
        fetchOne: (ma, done) => (getSdhDmKhoiKienThuc(ma, item => done && done({ id: item.ma, text: item.ten })))()
    };
};