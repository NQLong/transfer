import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const FwSmsDmPurposeGetPage = 'FwSmsDmPurpose:GetPage';
const FwSmsDmPurposeUpdate = 'FwSmsDmPurpose:Update';

export default function FwSmsDmPurposeReducer(state = null, data) {
    switch (data.type) {
        case FwSmsDmPurposeGetPage:
            return Object.assign({}, state, { page: data.page });
        case FwSmsDmPurposeUpdate:
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
T.initPage('pageFwSmsDmPurpose');

export function getFwSmsDmPurposePage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageFwSmsDmPurpose', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/sms/purpose/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: FwSmsDmPurposeGetPage, page: data.page });
                if (done) done(data.page);
            }
        }, () => T.notify('Lấy danh sách bị lỗi!', 'danger'));
    };
}

export function getListPurposeByShcc(done) {
    return () => {
        const url = '/api/sms/purpose/get-purpose';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy thông tin bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result.list);
            }
        });
    };
}

export function getFwSmsDmPurpose(id, done) {
    return () => {
        const url = `/api/sms/purpose/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createFwSmsDmPurpose(data, done) {
    return dispatch => {
        const url = '/api/sms/purpose';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo mục đích bị lỗi', 'danger');
                console.error(`POST: ${url}.`, data.error);
                if (done) done(data.error);
            } else {
                T.notify('Tạo mới thành công!', 'success');
                dispatch(getFwSmsDmPurposePage());
                if (done) done(data);
            }
        }, () => T.notify('Tạo mục đích bị lỗi!', 'danger'));
    };
}

export function deleteFwSmsDmPurpose(id) {
    return dispatch => {
        const url = '/api/sms/purpose';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa danh mục bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getFwSmsDmPurposePage());
            }
        }, () => T.notify('Xóa bị lỗi!', 'danger'));
    };
}

export function updateFwSmsDmPurpose(id, changes, done) {
    return dispatch => {
        const url = '/api/sms/purpose';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thành công!', 'success');
                dispatch(getFwSmsDmPurposePage());
                if (done) done();
            }
        }, () => T.notify('Cập nhật bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_FwSmsDmPurpose = () => {
    return {
        ajax: true,
        url: '/api/sms/purpose/page/1/50',
        data: params => ({ condition: params.term }),
        processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.id, text: item.ten, })) : [] }),
        fetchOne: (id, done) => (getFwSmsDmPurpose(id, item => done && done({ id: item.id, text: item.ten })))()
    };
};