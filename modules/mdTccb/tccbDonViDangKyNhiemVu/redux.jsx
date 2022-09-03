import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TccbDonViDangKyNhiemVuGetAll = 'TccbDonViDangKyNhiemVu:GetAll';
// const TccbDonViDangKyNhiemVuGetPage = 'TccbDonViDangKyNhiemVu:GetPage';
const TccbDonViDangKyNhiemVuUpdate = 'TccbDonViDangKyNhiemVu:Update';

export default function TccbDonViDangKyNhiemVuReducer(state = null, data) {
    switch (data.type) {
        case TccbDonViDangKyNhiemVuGetAll:
            return Object.assign({}, state, { items: data.items });
        // case TccbDonViDangKyNhiemVuGetPage:
        //     return Object.assign({}, state, { page: data.page });
        case TccbDonViDangKyNhiemVuUpdate:
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
export function getTccbDonViDangKyNhiemVuAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }
    return dispatch => {
        const url = '/api/tccb/danh-gia/don-vi-dang-ky-nhiem-vu/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách đăng ký bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch({ type: TccbDonViDangKyNhiemVuGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

export function getTccbDonViDangKyNhiemVuDanhGiaNamAll(done) {
    return () => {
        const url = '/api/tccb/danh-gia/don-vi-dang-ky-nhiem-vu/danh-gia-nam/all';
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

export function getTccbDonViDangKyNhiemVuByYear(nam, done) {
    return () => {
        const url = '/api/tccb/danh-gia/don-vi-dang-ky-nhiem-vu/all/by-year';
        T.get(url, { nam }, data => {
            if (data.error) {
                T.notify('Lấy danh sách đăng ký bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data);
            }
        });
    };
}

// T.initPage('pageTccbDonViDangKyNhiemVu');
// export function getTccbDonViDangKyNhiemVuPage(pageNumber, pageSize, pageCondition, done) {
//     const page = T.updatePage('pageTccbDonViDangKyNhiemVu', pageNumber, pageSize, pageCondition);
//     return dispatch => {
//         const url = `/api/tccb/danh-gia/don-vi-dang-ky-nhiem-vu/page/${page.pageNumber}/${page.pageSize}`;
//         T.get(url, { searchTerm: pageCondition?.searchTerm }, data => {
//             if (data.error) {
//                 T.notify('Lấy danh sách đăng ký bị lỗi!', 'danger');
//                 console.error(`GET ${url}. ${data.error}`);
//             } else {
//                 if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
//                 dispatch({ type: TccbDonViDangKyNhiemVuGetPage, page: data.page });
//             }
//         });
//     };
// }

export function getTccbDonViDangKyNhiemVu(id, done) {
    return () => {
        const url = `/api/tccb/danh-gia/don-vi-dang-ky-nhiem-vu/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy đăng ký bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.item);
            }
        });
    };
}

export function createTccbDonViDangKyNhiemVu(item, done) {
    return dispatch => {
        const url = '/api/tccb/danh-gia/don-vi-dang-ky-nhiem-vu';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify(`Tạo mới bị lỗi: ${data.error.message}`, 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify('Đăng ký thành công!', 'success');
                data.warning && T.notify(data.warning.message, 'warning');
                dispatch(getTccbDonViDangKyNhiemVuAll());
                if (done) done(data.item);
            }
        });
    };
}

export function deleteTccbDonViDangKyNhiemVu(id, done) {
    return dispatch => {
        const url = '/api/tccb/danh-gia/don-vi-dang-ky-nhiem-vu';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa đăng ký bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xoá đăng ký thành công!', 'success', false, 800);
                dispatch(getTccbDonViDangKyNhiemVuAll());
                done && done();
            }
        }, () => T.notify('Xóa đăng ký bị lỗi!', 'danger'));
    };
}

export function updateTccbDonViDangKyNhiemVu(id, changes, done) {
    return dispatch => {
        const url = '/api/tccb/danh-gia/don-vi-dang-ky-nhiem-vu';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật đăng ký bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật đăng ký thành công!', 'success');
                dispatch(getTccbDonViDangKyNhiemVuAll());
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật đăng ký bị lỗi!', 'danger'));
    };
}

export function changeTccbDonViDangKyNhiemVu(item) {
    return { type: TccbDonViDangKyNhiemVuUpdate, item };
}
