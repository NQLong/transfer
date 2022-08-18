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
                let updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedPage.list) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].id == updatedItem.id) {
                            updatedPage.list.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                return Object.assign({}, state, { page: updatedPage });
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
export function getDtThoiKhoaBieuPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtThoiKhoaBieu', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/dao-tao/thoi-khoa-bieu/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
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

export function createDtThoiKhoaBieu(item, settings, done) {
    return dispatch => {
        const cookie = T.updatePage('pageDtThoiKhoaBieu');
        const { pageNumber, pageSize, pageCondition, filter } = cookie;
        const url = '/api/dao-tao/thoi-khoa-bieu/multiple';
        T.post(url, { item, settings }, data => {
            if (data.error) {
                T.notify('Tạo thời khoá biểu bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify('Tạo thời khoá biểu thành công!', 'success');
                dispatch(getDtThoiKhoaBieuPage(pageNumber, pageSize, pageCondition, filter));
                if (done) done();
            }
        });
    };
}

export function createDtThoiKhoaBieuMultiple(data, settings, done) {
    return dispatch => {
        const cookie = T.updatePage('pageDtThoiKhoaBieu');
        const { pageNumber, pageSize, pageCondition, filter } = cookie;
        const url = '/api/dao-tao/thoi-khoa-bieu/create-multiple';
        T.post(url, { data, settings }, data => {
            if (data.error) {
                T.notify('Tạo lớp bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
                done && done();
            } else {
                T.notify('Tạo lớp thành công!', 'success');
                dispatch(getDtThoiKhoaBieuPage(pageNumber, pageSize, pageCondition, filter));
                if (done) done();
            }
        });
    };
}
export function deleteDtThoiKhoaBieu(id, done) {
    return dispatch => {
        const cookie = T.updatePage('pageDtThoiKhoaBieu');
        const { pageNumber, pageSize, pageCondition, filter } = cookie;
        const url = '/api/dao-tao/thoi-khoa-bieu';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thời khoá biểu bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Thời khoá biểu đã xóa thành công!', 'success', false, 800);
                dispatch(getDtThoiKhoaBieuPage(pageNumber, pageSize, pageCondition, filter));
                done && done();
            }
        }, () => T.notify('Xóa thời khoá biểu bị lỗi!', 'danger'));
    };
}

export function updateDtThoiKhoaBieu(id, changes, done) {
    return dispatch => {
        const cookie = T.updatePage('pageDtThoiKhoaBieu');
        const { pageNumber, pageSize, pageCondition, filter } = cookie;
        const url = '/api/dao-tao/thoi-khoa-bieu';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.alert(`Lỗi: ${data.error.message}`, 'error', false, 2000);
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data);
            } else {
                dispatch(getDtThoiKhoaBieuPage(pageNumber, pageSize, pageCondition, filter));
                done && done(data);
            }
        }, () => T.notify('Cập nhật thông tin thời khoá biểu bị lỗi!', 'danger'));
    };
}

export function updateDtThoiKhoaBieuCondition(condition, changes, done) {
    return dispatch => {
        const cookie = T.updatePage('pageDtThoiKhoaBieu');
        const { pageNumber, pageSize, pageCondition, filter } = cookie;
        const url = '/api/dao-tao/thoi-khoa-bieu-condition';
        T.put(url, { condition, changes }, data => {
            if (data.error) {
                T.alert(`Lỗi: ${data.error.message}`, 'error', false, 2000);
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data);
            } else {
                // T.notify('Điều chỉnh thành công!', 'success');
                dispatch(getDtThoiKhoaBieuPage(pageNumber, pageSize, pageCondition, filter));
                done && done(data);
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

export function autoGenSched(config, listConfig, done) {
    return dispatch => {
        T.post('/api/dao-tao/gen-schedule', { config, listConfig }, result => {
            if (result.error) {
                T.notify(`Lỗi sinh thời khoá biểu: ${result.error.message}`, 'danger');
            } else {
                T.alert('Sinh thời khoá biểu thành công', 'success', false);
                dispatch(getDtThoiKhoaBieuPage());
                done && done(result);
            }
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