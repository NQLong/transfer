import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtThoiKhoaBieuGetAll = 'DtThoiKhoaBieu:GetAll';
const DtThoiKhoaBieuGetPage = 'DtThoiKhoaBieu:GetPage';
const DtThoiKhoaBieuUpdate = 'DtThoiKhoaBieu:Update';

export default function dtThoiKhoaBieuReducer(state = null, data) {
    switch (data.type) {
        case DtThoiKhoaBieuGetAll:
            return Object.assign({}, state, { items: data.items });
        case DtThoiKhoaBieuGetPage:
            return Object.assign({}, state, { page: data.page });
        case DtThoiKhoaBieuUpdate:
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
export function getDtThoiKhoaBieuAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }
    return dispatch => {
        const url = '/api/dao-tao/thoi-khoa-bieu/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách thời khoá biểu bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch({ type: DtThoiKhoaBieuGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

T.initPage('pageDtThoiKhoaBieu');
export function getDtThoiKhoaBieuPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDtThoiKhoaBieu', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/dao-tao/thoi-khoa-bieu/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách thời khoá biểu bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: DtThoiKhoaBieuGetPage, page: data.page });
                if (done) done(data.page);
            }
        });
    };
}

export function createDtThoiKhoaBieu(item, done) {
    return () => {
        const url = '/api/dao-tao/thoi-khoa-bieu';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo thời khoá biểu bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify('Tạo thời khoá biểu thành công!', 'success');
                if (done) done();
            }
        });
    };
}

export function deleteDtThoiKhoaBieu(id, done) {
    return () => {
        const url = '/api/dao-tao/thoi-khoa-bieu';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thời khoá biểu bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Thời khoá biểu đã xóa thành công!', 'success', false, 800);
                done && done();
            }
        }, () => T.notify('Xóa thời khoá biểu bị lỗi!', 'danger'));
    };
}

export function updateDtThoiKhoaBieu(id, changes, done) {
    return dispatch => {
        const url = '/api/dao-tao/thoi-khoa-bieu';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.alert(`Lỗi: ${data.error.message}`, 'error', false, 2000);
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data);
            } else {
                T.notify('Điều chỉnh thành công!', 'success');
                dispatch({ type: DtThoiKhoaBieuUpdate, item: data.item });
                done && done(data);
            }
        }, () => T.notify('Cập nhật thông tin thời khoá biểu bị lỗi!', 'danger'));
    };
}

export function updateDtThoiKhoaBieuCondition(condition, changes, done) {
    return () => {
        const url = '/api/dao-tao/thoi-khoa-bieu-condition';
        T.put(url, { condition, changes }, data => {
            if (data.error) {
                T.alert(`Lỗi: ${data.error.message}`, 'error', false, 2000);
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data);
            } else {
                T.notify('Điều chỉnh thành công!', 'success');
                done && done(data);
                // dispatch({ type: DtThoiKhoaBieuUpdate, item: data.item });
            }
        }, () => T.notify('Cập nhật thông tin thời khoá biểu bị lỗi!', 'danger'));
    };
}

export function initSchedule(ngayBatDau, done) {
    return () => {
        T.get('/api/dao-tao/init-schedule', { ngayBatDau }, data => {
            done && done(data);
        });
    };
}

export function changeDtThoiKhoaBieu(item) {
    return { type: DtThoiKhoaBieuUpdate, item };
}

export function getDtLichDayHoc(phong, done) {
    return () => {
        T.get('/api/dao-tao/get-schedule/', { phong }, data => {
            if (data.error) {
                T.notify(`Lỗi: ${data.error.message}`, 'danger');
                console.error(data.error.message);
            } else {
                done && done(data);
            }
        });
    };
}