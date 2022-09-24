import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TccbDanhGiaHoiDongDonViGetAll = 'TccbDanhGiaHoiDongDonVi:GetAll';
const TccbDanhGiaHoiDongDonViUpdate = 'TccbDanhGiaHoiDongDonVi:Update';

export default function TccbDanhGiaHoiDongDonViReducer(state = null, data) {
    switch (data.type) {
        case TccbDanhGiaHoiDongDonViGetAll:
            return Object.assign({}, state, { items: data.items });
        case TccbDanhGiaHoiDongDonViUpdate:
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
export function getTccbDanhGiaHoiDongDonViAllByYear(nam, done) {
    return dispatch => {
        const url = '/api/tccb/danh-gia-hoi-dong-don-vi/all-by-year';
        T.get(url, { nam }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hội đồng trường bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch({ type: TccbDanhGiaHoiDongDonViGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

export function getTccbDanhGiaHoiDongDonVi(id, done) {
    return () => {
        const url = `/api/tccb/danh-gia-hoi-dong-don-vi/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thành viên bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.item);
            }
        });
    };
}

export function createTccbDanhGiaHoiDongDonVi(item, done) {
    return () => {
        const url = '/api/tccb/danh-gia-hoi-dong-don-vi';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify(`Thêm thành viên bị lỗi: ${data.error.message}`, 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify('Thêm thành viên thành công!', 'success');
                if (done) done(data.item);
            }
        });
    };
}

export function deleteTccbDanhGiaHoiDongDonVi(id, done) {
    return () => {
        const url = '/api/tccb/danh-gia-hoi-dong-don-vi';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xoá thành viên bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xoá thành viên thành công!', 'success', false, 800);
                done && done();
            }
        }, () => T.notify('Xóa thành viên bị lỗi!', 'danger'));
    };
}

export function updateTccbDanhGiaHoiDongDonVi(id, changes, done) {
    return () => {
        const url = '/api/tccb/danh-gia-hoi-dong-don-vi';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify(`Cập nhật thành viên bị lỗi: ${data.error.message}`, 'danger');
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật thành viên thành công!', 'success');
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật thành viên bị lỗi!', 'danger'));
    };
}

export function changeTccbDanhGiaHoiDongDonVi(item) {
    return { type: TccbDanhGiaHoiDongDonViUpdate, item };
}
