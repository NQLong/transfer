import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtHopDongDvtlGetAll = 'QtHopDongDvtl:GetAll';
const QtHopDongDvtlGetPage = 'QtHopDongDvtl:GetPage';
const QtHopDongDvtlGetGroupPage = 'QtHopDongDvtl:GetGroupPage';
const QtHopDongDvtlGetGroupPageMa = 'QtHopDongDvtl:GetGroupPageMa';
const QtHopDongDvtlUpdate = 'QtHopDongDvtl:Update';
const QtHopDongDvtlGet = 'QtHopDongDvtl:Get';

export default function QtHopDongDvtlReducer(state = null, data) {
    switch (data.type) {
        case QtHopDongDvtlGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtHopDongDvtlGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtHopDongDvtlGetGroupPage:
            return Object.assign({}, state, { pageGr: data.page });
        case QtHopDongDvtlGetGroupPageMa:
            return Object.assign({}, state, { pageMa: data.page });
        case QtHopDongDvtlGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtHopDongDvtlUpdate:
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
T.initPage('pageQtHopDongDvtl');
export function getQtHopDongDvtlPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtHopDongDvtl', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/hop-dong-dvtl/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (page.filter) data.page.filter = page.filter;
                done && done(data.page);
                dispatch({ type: QtHopDongDvtlGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger'));
    };
}

export function getQtHopDongDvtlGroupPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtHopDongDvtl', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/hop-dong-dvtl/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hợp đồng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtHopDongDvtlGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getQtHopDongDvtlAll(done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/hop-dong-dvtl/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: QtHopDongDvtlGetAll, items: data.items ? data.items : {} });
            }
        }, () => T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger'));
    };
}

export function getQtHopDongDvtl(id, done) {
    return () => {
        const url = `/api/tccb/qua-trinh/hop-dong-dvtl/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy hợp đồng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getQtHopDongDvtlEdit(id, done) {
    return dispatch => {
        const url = `/api/tccb/qua-trinh/hop-dong-dvtl/edit/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin hợp đồng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data);
                dispatch({ type: QtHopDongDvtlGet, item: data.item });
            }
        }, () => T.notify('Lấy thông tin hợp đồng bị lỗi', 'danger'));
    };
}

export function createQtHopDongDvtl(item, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/hop-dong-dvtl';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo hợp đồng bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo hợp đồng thành công!', 'success');
                dispatch(getQtHopDongDvtlPage());
                if (done) done(data);
            }
        }, () => T.notify('Tạo hợp đồng bị lỗi!', 'danger'));
    };
}

export function deleteQtHopDongDvtl(id, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/hop-dong-dvtl';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa hợp đồng bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('hợp đồng đã xóa thành công!', 'success', false, 800);
                dispatch(getQtHopDongDvtlPage());
            }
            done && done();
        }, () => T.notify('Xóa hợp đồng bị lỗi!', 'danger'));
    };
}

export function updateQtHopDongDvtl(id, changes, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/hop-dong-dvtl';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật hợp đồng bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật hợp đồng thành công!', 'success');
                done && done(data.item);
                dispatch(getQtHopDongDvtl(id));
            }
        }, () => T.notify('Cập nhật hợp đồng bị lỗi!', 'danger'));
    };
}

// export function downloadWord(ma, done) {
//     const url = `/api/tccb/qua-trinh/hop-dong-dvtl-tn/download-word/${ma}`;
//     T.get(url, data => {
//         if (data.error) {
//             T.notify('Tải file word bị lỗi', 'danger');
//             console.error(`GET: ${url}.`, data.error);
//         } else if (done) {
//             done(data.data);
//         }
//     }, error => T.notify('Tải file world bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));

// }

export function suggestSoHopDong(done) {
    return () => {
        const url = '/api/tccb/qua-trinh/hop-dong-dvtl/suggested-shd';
        T.get(url, {}, data => {
            if (data.error) {
                T.notify('Gợi ý số hợp đồng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data);
            }
        }, error => T.notify('Gợi ý số hợp đồng bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}