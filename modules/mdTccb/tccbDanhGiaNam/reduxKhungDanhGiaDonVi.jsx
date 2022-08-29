import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TccbKhungDanhGiaDonViGetAll = 'TccbKhungDanhGiaDonVi:GetAll';
const TccbKhungDanhGiaDonViUpdate = 'TccbKhungDanhGiaDonVi:Update';

export default function TccbKhungDanhGiaDonViReducer(state = null, data) {
    switch (data.type) {
        case TccbKhungDanhGiaDonViGetAll:
            return Object.assign({}, state, { items: data.items });
        case TccbKhungDanhGiaDonViUpdate:
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
export function getTccbKhungDanhGiaDonViAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }
    return dispatch => {
        const url = '/api/tccb/danh-gia/cau-truc-khung-danh-gia-don-vi/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách cấu trúc khung đánh giá đơn vi bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch({ type: TccbKhungDanhGiaDonViGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

export function getTccbKhungDanhGiaDonVi(id, done) {
    return () => {
        const url = `/api/tccb/danh-gia/cau-truc-khung-danh-gia-don-vi/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy cấu trúc khung đánh giá đơn vi bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.item);
            }
        });
    };
}

export function createTccbKhungDanhGiaDonVi(item, done) {
    return dispatch => {
        const url = '/api/tccb/danh-gia/cau-truc-khung-danh-gia-don-vi';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify(`Tạo mới bị lỗi: ${data.error.message}`, 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify('Tạo cấu trúc khung đánh giá đơn vi thành công!', 'success');
                data.warning && T.notify(data.warning.message, 'warning');
                dispatch(getTccbKhungDanhGiaDonViAll());
                if (done) done(data.item);
            }
        });
    };
}

export function deleteTccbKhungDanhGiaDonVi(id, done) {
    return dispatch => {
        const url = '/api/tccb/danh-gia/cau-truc-khung-danh-gia-don-vi';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa cấu trúc khung đánh giá đơn vi bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Cấu trúc khung đánh giá đơn vi đã xóa thành công!', 'success', false, 800);
                dispatch(getTccbKhungDanhGiaDonViAll());
                done && done();
            }
        }, () => T.notify('Xóa cấu trúc khung đánh giá đơn vi bị lỗi!', 'danger'));
    };
}

export function updateTccbKhungDanhGiaDonVi(id, changes, done) {
    return dispatch => {
        const url = '/api/tccb/danh-gia/cau-truc-khung-danh-gia-don-vi';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật cấu trúc khung đánh giá đơn vi bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật thông tin cấu trúc khung đánh giá đơn vi thành công!', 'success');
                dispatch(getTccbKhungDanhGiaDonViAll());
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật thông tin cấu trúc khung đánh giá đơn vi bị lỗi!', 'danger'));
    };
}

export function updateTccbKhungDanhGiaDonViThuTu(changes, done) {
    return dispatch => {
        const url = '/api/tccb/danh-gia/cau-truc-khung-danh-gia-don-vi/thu-tu';
        T.put(url, { changes }, data => {
            if (data.error) {
                T.notify('Thay đổi vị trí bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật menu thành công!', 'success');
                dispatch(getTccbKhungDanhGiaDonViAll());
                done && done();
            }
        }, () => T.notify('Thay đổi vị trí bị lỗi!', 'danger'));
    };
}

export function changeTccbKhungDanhGiaDonVi(item) {
    return { type: TccbKhungDanhGiaDonViUpdate, item };
}
