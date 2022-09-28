import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const svSdhGetPage = 'svSdh:GetPage';
const svSdhUpdate = 'svSdh:Update';
const svSdhUserGet = 'svSdh:UserGet';
const svSdhGetEditPage = 'svSdh:GetEditPage';

export default function svSdhReducer(state = null, data) {
    switch (data.type) {
        case svSdhGetPage:
            return Object.assign({}, state, { page: data.page });
        case svSdhUserGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case svSdhGetEditPage:
            return Object.assign({}, state, { items: data.items });
        case svSdhUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i]._id == updatedItem._id) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i]._id == updatedItem._id) {
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

//ACTIONS--------------------------------------------------------------------------------------------------

//Admin -----------------------------------------------------------------------------------------------------
T.initPage('pageSvSdhAdmin');
export function getSvSdhPage(pageNumber, pageSize, pageCondition, filter, sortTerm, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageSvSdhAdmin', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/sv-sdh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter, sortTerm }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sinh viên sau đại học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: svSdhGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách sinh viên sau đại học bị lỗi!', 'danger'));
    };
}

export function getSvSdhAdmin(mssv, done) {
    return dispatch => {
        const url = `/api/sv-sdh/item/${mssv}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin sinh viên sau đại học không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
                dispatch({ type: svSdhUserGet, item: data.item });
            }
        });
    };
}

export function updateSvSdhAdmin(mssv, changes, done) {
    return dispatch => {
        const url = '/api/sv-sdh';
        T.put(url, { mssv, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật thành công!', 'success');
                done && done(data.item);
                dispatch({ type: svSdhUserGet, item: data.item });
            }
        });
    };
}

export function deleteSvSdhAdmin(mssv, done) {
    return dispatch => {
        const url = '/api/sv-sdh';
        T.delete(url, { mssv }, data => {
            if (data.error) {
                T.notify('Xoá sinh viên sau đại học không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done();
                dispatch({ type: svSdhGetPage });
            }
        });
    };
}

export function createSvSdhMutiple(data, done) {
    return (dispatch) => {
        const url = '/api/sv-sdh/multiple';
        T.post(url, { data }, (data) => {
            if (data.errors && data.errors.length > 0) {
                T.notify('Tạo mới sinh viên sau đại học lỗi', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                if (done) done();
                dispatch(getSvSdhPage());
            }
        });
    };
}

export const SelectAdapter_FwSvSdh = {
    ajax: true,
    url: '/api/sv-sdh/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.mssv, text: `${item.mssv}: ${item.ho} ${item.ten}` })) : [] }),
    fetchOne: (mssv, done) => (getSvSdhAdmin(mssv, item => done && done({ id: item.mssv, text: `${item.mssv}: ${item.ho} ${item.ten}` })))(),
};

