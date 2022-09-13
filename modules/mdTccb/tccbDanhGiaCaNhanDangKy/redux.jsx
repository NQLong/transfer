// Reducer ------------------------------------------------------------------------------------------------------------
const TccbCaNhanDangKyGetAll = 'TccbCaNhanDangKy:GetAll';
const TccbCaNhanDangKyUpdate = 'TccbCaNhanDangKy:Update';

export default function TccbCaNhanDangKyReducer(state = null, data) {
    switch (data.type) {
        case TccbCaNhanDangKyGetAll:
            return Object.assign({}, state, { items: data.items });
        case TccbCaNhanDangKyUpdate:
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

export function getTccbCaNhanDangKyDanhGiaNamAll(done) {
    return () => {
        const url = '/api/tccb/danh-gia/ca-nhan-dang-ky/danh-gia-nam/all';
        T.get(url, {}, data => {
            if (data.error) {
                T.notify('Lấy danh sách đăng ký bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
            }
        });
    };
}

export function getTccbCaNhanDangKyByYear(nam, done) {
    return dispatch => {
        const url = '/api/tccb/danh-gia/ca-nhan-dang-ky/all-by-year';
        T.get(url, { nam }, data => {
            if (data.error) {
                T.notify('Lấy danh sách đăng ký bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data);
                dispatch({ type: TccbCaNhanDangKyGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

export function createTccbCaNhanDangKy(item, idNhom, done) {
    return dispatch => {
        const url = '/api/tccb/danh-gia/ca-nhan-dang-ky';
        T.post(url, { item, idNhom }, data => {
            if (data.error) {
                T.notify(`Đăng ký bị lỗi: ${data.error.message}`, 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify('Đăng ký thành công!', 'success');
                dispatch(getTccbCaNhanDangKyByYear(data.nam));
                if (done) done(data.item);
            }
        });
    };
}

export function updateTccbCaNhanDangKy(id, changes, idNhom, done) {
    return dispatch => {
        const url = '/api/tccb/danh-gia/ca-nhan-dang-ky';
        T.put(url, { id, changes, idNhom }, data => {
            if (data.error) {
                T.notify(`Đăng ký bị lỗi: ${data.error.message}`, 'danger');
                console.error(`PUT ${url}. ${data.error.message}`);
            } else {
                const notice = data.item.dangKy ? 'Đăng ký thành công!' : 'Huỷ đăng ký thành công!';
                T.notify(notice, 'success');
                dispatch(getTccbCaNhanDangKyByYear(data.nam));
                done && done(data.item);
            }
        }, () => T.notify('Đăng ký bị lỗi!', 'danger'));
    };
}

export function changeTccbCaNhanDangKy(item) {
    return { type: TccbCaNhanDangKyUpdate, item };
}
