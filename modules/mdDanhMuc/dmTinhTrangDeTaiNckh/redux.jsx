import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmTinhTrangDeTaiNckhGetAll = 'DmTinhTrangDeTaiNckh:GetAll';
const DmTinhTrangDeTaiNckhGetPage = 'DmTinhTrangDeTaiNckh:GetPage';
const DmTinhTrangDeTaiNckhUpdate = 'DmTinhTrangDeTaiNckh:Update';

export default function DmTinhTrangDeTaiNckhReducer(state = null, data) {
    switch (data.type) {
        case DmTinhTrangDeTaiNckhGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmTinhTrangDeTaiNckhGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmTinhTrangDeTaiNckhUpdate:
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
T.initPage('pageDmTinhTrangDeTaiNckh');
export function getDmTinhTrangDeTaiNckhPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmTinhTrangDeTaiNckh', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/tinh-trang-de-tai-nckh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách tình trạng đề tài NCKH bị lỗ!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmTinhTrangDeTaiNckhGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách tình trạng đề tài NCKH bị lỗi!', 'danger'));
    };
}

export function getDmTinhTrangDeTaiNckhAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/tinh-trang-de-tai-nckh/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách tình trạng đề tài NCKH bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmTinhTrangDeTaiNckhGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách tình trạng đề tài NCKH bị lỗi!', 'danger'));
    };
}

export function getDmTinhTrangDeTaiNckh(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/tinh-trang-de-tai-nckh/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin tình trạng đề tài NCKH bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmTinhTrangDeTaiNckh(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/tinh-trang-de-tai-nckh';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo tình trạng đề tài NCKH bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmTinhTrangDeTaiNckhAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo tình trạng đề tài NCKH bị lỗi!', 'danger'));
    };
}

export function deleteDmTinhTrangDeTaiNckh(ma) {
    return dispatch => {
        const url = '/api/danh-muc/tinh-trang-de-tai-nckh';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục tình trạng đề tài NCKH bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmTinhTrangDeTaiNckhAll());
            }
        }, error => T.notify('Xóa tình trạng đề tài NCKH bị lỗi!', 'danger'));
    };
}

export function updateDmTinhTrangDeTaiNckh(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/tinh-trang-de-tai-nckh';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin tình trạng đề tài NCKH bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin tình trạng đề tài NCKH thành công!', 'success');
                dispatch(getDmTinhTrangDeTaiNckhAll());
            }
        }, error => T.notify('Cập nhật thông tin tình trạng đề tài NCKH bị lỗi!', 'danger'));
    };
}

export function changeDmTinhTrangDeTaiNckh(item) {
    return { type: DmTinhTrangDeTaiNckhUpdate, item };
}

export const SelectAdapter_DmTinhTrangDeTaiNckh = {
    ajax: true,
    url: '/api/danh-muc/tinh-trang-de-tai-nckh/page/1/30',
    data: params => ({ condition: params.term }),
    processResults: data => ({ results: data && data.page && data.page.list ? data.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    getOne: getDmTinhTrangDeTaiNckh,
    processResultOne: data => (data ? { value: data.ma, text: data.ma + ': ' + data.ten } : {})
};

export const SelectAdapter_DmTinhTrangDeTaiNckhFilter = {
    ajax: true,
    url: '/api/danh-muc/tinh-trang-de-tai-nckh/page/1/30',
    data: params => ({ condition: params.term }),
    processResults: data => {
        const results = data && data.page && data.page.list ? data.page.list.map(item => ({ id: item.ma, text: `${item.ma}: ${item.ten}` })) : [];
        results.unshift({ id: '00', text: 'Chọn tất cả' });
        return { results };
    },
    getOne: getDmTinhTrangDeTaiNckh,
    processResultOne: data => (data ? { value: data.ma, text: data.ma + ': ' + data.ten } : {})
};