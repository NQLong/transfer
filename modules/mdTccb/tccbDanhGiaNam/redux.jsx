import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TccbDanhGiaNamGetAll = 'TccbDanhGiaNam:GetAll';
const TccbDanhGiaNamGetPage = 'TccbDanhGiaNam:GetPage';
const TccbDanhGiaNamUpdate = 'TccbDanhGiaNam:Update';

export default function TccbDanhGiaNamReducer(state = null, data) {
    switch (data.type) {
        case TccbDanhGiaNamGetAll:
            return Object.assign({}, state, { items: data.items });
        case TccbDanhGiaNamGetPage:
            return Object.assign({}, state, { page: data.page });
        case TccbDanhGiaNamUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].id == updatedItem.id) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].id == updatedItem.id) {
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
export function getTccbDanhGiaNamAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }
    return dispatch => {
        const url = '/api/tccb/danh-gia/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách đánh giá năm bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch({ type: TccbDanhGiaNamGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

T.initPage('pageTccbDanhGiaNam');
export function getTccbDanhGiaNamPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageTccbDanhGiaNam', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/tccb/danh-gia/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: pageCondition?.searchTerm }, data => {
            if (data.error) {
                T.notify('Lấy danh sách đánh giá năm bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: TccbDanhGiaNamGetPage, page: data.page });
            }
        });
    };
}

export function getTccbDanhGiaNam(id, done) {
    return () => {
        const url = `/api/tccb/danh-gia/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy đánh giá năm bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.item);
            }
        });
    };
}

export function createTccbDanhGiaNam(item, done) {
    return dispatch => {
        const url = '/api/tccb/danh-gia';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify(`Tạo mới bị lỗi: ${data.error.message}`, 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify('Tạo đánh giá năm thành công!', 'success');
                data.warning && T.notify(data.warning.message, 'warning');
                dispatch(getTccbDanhGiaNamPage());
                if (done) done(data.item);
            }
        });
    };
}

export function deleteTccbDanhGiaNam(id, done) {
    return dispatch => {
        const url = '/api/tccb/danh-gia';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify(`Xóa đánh giá năm bị lỗi: ${data.error.message}`, 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Đánh giá năm đã xóa thành công!', 'success', false, 800);
                dispatch(getTccbDanhGiaNamPage());
                done && done();
            }
        }, () => T.notify('Xóa đánh giá năm bị lỗi!', 'danger'));
    };
}

export function updateTccbDanhGiaNam(id, changes, done) {
    return dispatch => {
        const url = '/api/tccb/danh-gia';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật đánh giá năm bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật thông tin đánh giá năm thành công!', 'success');
                dispatch(getTccbDanhGiaNamPage());
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật thông tin đánh giá năm bị lỗi!', 'danger'));
    };
}

export function createTccbDanhGiaNamClone(id, changes, done) {
    return dispatch => {
        const url = '/api/tccb/danh-gia/clone';
        T.post(url, { id, newItem: changes }, data => {
            if (data.error) {
                T.notify(`Sao chép đánh giá năm bị lỗi: ${data.error?.message}`, 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                T.notify('Sao chép thông tin đánh giá năm thành công!', 'success');
                dispatch(getTccbDanhGiaNamPage());
                done && done(data.item);
            }
        }, () => T.notify('Sao chép thông tin đánh giá năm bị lỗi!', 'danger'));
    };
}

export function changeTccbDanhGiaNam(item) {
    return { type: TccbDanhGiaNamUpdate, item };
}
