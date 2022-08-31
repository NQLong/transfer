import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TccbKhungDanhGiaCanBoGetAll = 'TccbKhungDanhGiaCanBo:GetAll';
const TccbKhungDanhGiaCanBoUpdate = 'TccbKhungDanhGiaCanBo:Update';

export default function TccbKhungDanhGiaCanBoReducer(state = null, data) {
    switch (data.type) {
        case TccbKhungDanhGiaCanBoGetAll:
            return Object.assign({}, state, { items: data.items });
        case TccbKhungDanhGiaCanBoUpdate:
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
export function getTccbKhungDanhGiaCanBoAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }
    return dispatch => {
        const url = '/api/tccb/danh-gia/cau-truc-khung-danh-gia-can-bo/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách cấu trúc khung đánh giá cán bộ bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch({ type: TccbKhungDanhGiaCanBoGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

export function getTccbKhungDanhGiaCanBo(id, done) {
    return () => {
        const url = `/api/tccb/danh-gia/cau-truc-khung-danh-gia-can-bo/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy cấu trúc khung đánh giá cán bộ bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.item);
            }
        });
    };
}

export function createTccbKhungDanhGiaCanBo(item, done) {
    return dispatch => {
        const url = '/api/tccb/danh-gia/cau-truc-khung-danh-gia-can-bo';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify(`Tạo mới bị lỗi: ${data.error.message}`, 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify('Tạo cấu trúc khung đánh giá cán bộ thành công!', 'success');
                data.warning && T.notify(data.warning.message, 'warning');
                dispatch(getTccbKhungDanhGiaCanBoAll());
                if (done) done(data.item);
            }
        });
    };
}

export function deleteTccbKhungDanhGiaCanBo(id, done) {
    return dispatch => {
        const url = '/api/tccb/danh-gia/cau-truc-khung-danh-gia-can-bo';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa cấu trúc khung đánh giá cán bộ bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Cấu trúc khung đánh giá cán bộ đã xóa thành công!', 'success', false, 800);
                dispatch(getTccbKhungDanhGiaCanBoAll());
                done && done();
            }
        }, () => T.notify('Xóa cấu trúc khung đánh giá cán bộ bị lỗi!', 'danger'));
    };
}

export function updateTccbKhungDanhGiaCanBo(id, changes, done) {
    return dispatch => {
        const url = '/api/tccb/danh-gia/cau-truc-khung-danh-gia-can-bo';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật cấu trúc khung đánh giá cán bộ bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật thông tin cấu trúc khung đánh giá cán bộ thành công!', 'success');
                dispatch(getTccbKhungDanhGiaCanBoAll());
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật thông tin cấu trúc khung đánh giá cán bộ bị lỗi!', 'danger'));
    };
}

export function changeTccbKhungDanhGiaCanBo(item) {
    return { type: TccbKhungDanhGiaCanBoUpdate, item };
}

export function updateTccbKhungDanhGiaCanBoThuTu(id, thuTu, nam, done) {
    return (dispatch) => {
        const url = '/api/tccb/danh-gia/cau-truc-khung-danh-gia-can-bo/thu-tu';
        T.put(url, { id, thuTu, nam }, (data) => {
            if (data.error) {
                T.notify('Thay đổi thứ tự bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Thay đổi thứ tự thành công!', 'success');
                dispatch(getTccbKhungDanhGiaCanBoAll(undefined, undefined, { nam }));
                done && done();
            }
        },
            () => T.notify('Thay đổi thứ tự bị lỗi!', 'danger')
        );
    };
}