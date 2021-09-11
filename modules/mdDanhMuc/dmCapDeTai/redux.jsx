import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmCapDeTaiGetAll = 'DmCapDeTai:GetAll';
const DmCapDeTaiGetPage = 'DmCapDeTai:GetPage';
const DmCapDeTaiUpdate = 'DmCapDeTai:Update';

export default function DmCapDeTaiReducer(state = null, data) {
    switch (data.type) {
        case DmCapDeTaiGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmCapDeTaiGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmCapDeTaiUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].maCap == updatedItem.maCap) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].maCap == updatedItem.maCap) {
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
T.initPage('pageDmCapDeTai');
export function getDmCapDeTaiPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmCapDeTai', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/cap-de-tai/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách cấp đề tài bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmCapDeTaiGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách cấp đề tài bị lỗi!', 'danger'));
    };
}

export function getDmCapDeTaiAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/cap-de-tai/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách cấp đề tài bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmCapDeTaiGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách cấp đề tài bị lỗi!', 'danger'));
    };
}

export function getDmCapDeTai(maCap, done) {
    return () => {
        const url = `/api/danh-muc/cap-de-tai/item/${maCap}`;
        T.get(url, { maCap }, data => {
            if (data.error) {
                T.notify('Lấy thông tin cấp đề tài bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmCapDeTai(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/cap-de-tai';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo cấp đề tài bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmCapDeTaiAll());
                if (done) done(data);
            }
        }, () => T.notify('Tạo cấp đề tài bị lỗi!', 'danger'));
    };
}

export function deleteDmCapDeTai(maCap, done) {
    return dispatch => {
        const url = '/api/danh-muc/cap-de-tai';
        T.delete(url, { maCap }, data => {
            if (data.error) {
                T.notify('Xóa danh mục cấp đề tài bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmCapDeTaiAll());
                if (done) done(data);
            }
        }, () => T.notify('Xóa cấp đề tài bị lỗi!', 'danger'));
    };
}

export function updateDmCapDeTai(maCap, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/cap-de-tai';
        T.put(url, { maCap, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin cấp đề tài bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin cấp đề tài thành công!', 'success');
                dispatch(getDmCapDeTaiAll());
                if (done) done(data);
            }
        }, () => T.notify('Cập nhật thông tin cấp đề tài bị lỗi!', 'danger'));
    };
}

export function changeDmCapDeTai(item) {
    return { type: DmCapDeTaiUpdate, item };
}

export const SelectAdapter_DmCapDeTai = {
    ajax: true,
    url: '/api/danh-muc/cap-de-tai/page/1/40',
    data: params => ({ condition: params.term }),
    processResults: data => ({ results: data && data.page && data.page.list ? data.page.list.map(item => ({ id: item.maCap, text: `${item.maCap}: ${item.tenCap}` })) : [] }),
    getOne: getDmCapDeTai,
    processResultOne: data => data && ({ value: data.maCap, text: data.maCap + ': ' + data.tenCap }),
};

export const SelectAdapter_DmCapDeTai_DkyTmdt = {
    ajax: true,
    url: '/api/danh-muc/cap-de-tai/tmdt/all',
    data: params => ({ condition: params.term }),
    processResults: data => {
        const list = data && data.item && data.item.rows ? data.item.rows : [];
        return {
            results: list.map(item => ({ id: item.maCap, text: `${item.maCap}: ${item.tenCap}` }))
        };
    },
    getOne: getDmCapDeTai,
    processResultOne: data => data && ({ value: data.maCap, text: data.maCap + ': ' + data.tenCap }),
};

export const SelectAdapter_DmCapDeTaiFilter = {
    ajax: true,
    url: '/api/danh-muc/cap-de-tai/page/1/30',
    data: params => ({ condition: params.term }),
    processResults: data => {
        const list = data && data.page && data.page.list ? data.page.list.map(item => ({ id: item.maCap, text: `${item.maCap}: ${item.tenCap}` })) : [];
        list.unshift({ id: '00', text: 'Chọn tất cả' });
        return { results: list };
    },
    getOne: getDmCapDeTai,
    processResultOne: data => data && ({ value: data.maCap, text: data.maCap + ': ' + data.tenCap }),
};

