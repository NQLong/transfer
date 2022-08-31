import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TccbTyLeDiemGetAll = 'TccbTyLeDiem:GetAll';
const TccbTyLeDiemUpdate = 'TccbTyLeDiem:Update';

export default function TccbTyLeDiemReducer(state = null, data) {
    switch (data.type) {
        case TccbTyLeDiemGetAll:
            return Object.assign({}, state, { items: data.items });
        case TccbTyLeDiemUpdate:
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
export function getTccbTyLeDiemAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }
    return dispatch => {
        const url = '/api/tccb/ty-le-diem/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách tỷ lệ điểm bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch({ type: TccbTyLeDiemGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

export function getTccbTyLeDiem(id, done) {
    return () => {
        const url = `/api/tccb/ty-le-diem/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy mục tỷ lệ điểm bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.item);
            }
        });
    };
}

export function createTccbTyLeDiem(item, done) {
    return dispatch => {
        const url = '/api/tccb/ty-le-diem';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify(`Tạo mới bị lỗi: ${data.error.message}`, 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify('Tạo mới tỷ lệ điểm thành công!', 'success');
                data.warning && T.notify(data.warning.message, 'warning');
                dispatch(getTccbTyLeDiemAll());
                if (done) done(data.item);
            }
        });
    };
}

export function deleteTccbTyLeDiem(id, done) {
    return dispatch => {
        const url = '/api/tccb/ty-le-diem';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa tỷ lệ điểm bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xoá tỷ lệ điểm thành công!', 'success', false, 800);
                dispatch(getTccbTyLeDiemAll());
                done && done();
            }
        }, () => T.notify('Xóa tỷ lệ điểm bị lỗi!', 'danger'));
    };
}

export function updateTccbTyLeDiem(id, changes, done) {
    return dispatch => {
        const url = '/api/tccb/ty-le-diem';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật tỷ lệ điểm bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật tỷ lệ điểm thành công!', 'success');
                dispatch(getTccbTyLeDiemAll());
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật tỷ lệ điểm bị lỗi!', 'danger'));
    };
}

export function changeTccbTyLeDiem(item) {
    return { type: TccbTyLeDiemUpdate, item };
}
