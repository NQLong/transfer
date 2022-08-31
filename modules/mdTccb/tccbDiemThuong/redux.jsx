import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TccbDiemThuongGetAll = 'TccbDiemThuong:GetAll';
const TccbDiemThuongUpdate = 'TccbDiemThuong:Update';

export default function TccbDiemThuongReducer(state = null, data) {
    switch (data.type) {
        case TccbDiemThuongGetAll:
            return Object.assign({}, state, { items: data.items });
        case TccbDiemThuongUpdate:
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
export function getTccbDiemThuongAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }
    return dispatch => {
        const url = '/api/tccb/diem-thuong/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách điểm thưởng bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch({ type: TccbDiemThuongGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

export function getTccbDiemThuong(id, done) {
    return () => {
        const url = `/api/tccb/diem-thuong/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy mục điểm thưởng bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.item);
            }
        });
    };
}

export function createTccbDiemThuong(item, done) {
    return dispatch => {
        const url = '/api/tccb/diem-thuong';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify(`Tạo mới bị lỗi: ${data.error.message}`, 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify('Tạo mới điểm thưởng thành công!', 'success');
                data.warning && T.notify(data.warning.message, 'warning');
                dispatch(getTccbDiemThuongAll());
                if (done) done(data.item);
            }
        });
    };
}

export function deleteTccbDiemThuong(id, done) {
    return dispatch => {
        const url = '/api/tccb/diem-thuong';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa điểm thưởng bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xoá điểm thưởng thành công!', 'success', false, 800);
                dispatch(getTccbDiemThuongAll());
                done && done();
            }
        }, () => T.notify('Xóa điểm thưởng bị lỗi!', 'danger'));
    };
}

export function updateTccbDiemThuong(id, changes, done) {
    return dispatch => {
        const url = '/api/tccb/diem-thuong';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật điểm thưởng bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật điểm thưởng thành công!', 'success');
                dispatch(getTccbDiemThuongAll());
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật điểm thưởng bị lỗi!', 'danger'));
    };
}

export function changeTccbDiemThuong(item) {
    return { type: TccbDiemThuongUpdate, item };
}
