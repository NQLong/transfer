import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TccbNhomDanhGiaNhiemVuGetAll = 'TccbNhomDanhGiaNhiemVu:GetAll';
const TccbNhomDanhGiaNhiemVuGetPage = 'TccbNhomDanhGiaNhiemVu:GetPage';
const TccbNhomDanhGiaNhiemVuUpdate = 'TccbNhomDanhGiaNhiemVu:Update';

export default function TccbNhomDanhGiaNhiemVuReducer(state = null, data) {
    switch (data.type) {
        case TccbNhomDanhGiaNhiemVuGetAll:
            return Object.assign({}, state, { items: data.items });
        case TccbNhomDanhGiaNhiemVuGetPage:
            return Object.assign({}, state, { page: data.page });
        case TccbNhomDanhGiaNhiemVuUpdate:
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
export function getTccbNhomDanhGiaNhiemVuAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }
    return dispatch => {
        const url = '/api/tccb/danh-gia/nhom-danh-gia-nhiem-vu/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nhóm đánh giá bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch({ type: TccbNhomDanhGiaNhiemVuGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

T.initPage('pageTccbNhomDanhGiaNhiemVu');
export function getTccbNhomDanhGiaNhiemVuPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageTccbNhomDanhGiaNhiemVu', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/tccb/danh-gia/nhom-danh-gia-nhiem-vu/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: pageCondition?.searchTerm }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nhóm đánh giá bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: TccbNhomDanhGiaNhiemVuGetPage, page: data.page });
            }
        });
    };
}

export function getTccbNhomDanhGiaNhiemVu(id, done) {
    return () => {
        const url = `/api/tccb/danh-gia/nhom-danh-gia-nhiem-vu/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy nhóm đánh giá bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.item);
            }
        });
    };
}

export function createTccbNhomDanhGiaNhiemVu(item, done) {
    return dispatch => {
        const url = '/api/tccb/danh-gia/nhom-danh-gia-nhiem-vu';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify(`Tạo mới bị lỗi: ${data.error.message}`, 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify('Tạo nhóm đánh giá thành công!', 'success');
                data.warning && T.notify(data.warning.message, 'warning');
                dispatch(getTccbNhomDanhGiaNhiemVuPage());
                if (done) done(data.item);
            }
        });
    };
}

export function deleteTccbNhomDanhGiaNhiemVu(id, done) {
    return dispatch => {
        const url = '/api/tccb/danh-gia/nhom-danh-gia-nhiem-vu';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify(`Xóa nhóm đánh giá bị lỗi: ${data.error.message}`, 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Nhóm đánh giá đã xóa thành công!', 'success', false, 800);
                dispatch(getTccbNhomDanhGiaNhiemVuPage());
                done && done();
            }
        }, () => T.notify('Xóa nhóm đánh giá bị lỗi!', 'danger'));
    };
}

export function updateTccbNhomDanhGiaNhiemVu(id, changes, done) {
    return dispatch => {
        const url = '/api/tccb/danh-gia/nhom-danh-gia-nhiem-vu';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật nhóm đánh giá bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật thông tin nhóm đánh giá thành công!', 'success');
                dispatch(getTccbNhomDanhGiaNhiemVuPage());
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật thông tin nhóm đánh giá bị lỗi!', 'danger'));
    };
}

export function changeTccbNhomDanhGiaNhiemVu(item) {
    return { type: TccbNhomDanhGiaNhiemVuUpdate, item };
}

export const SelectAdapter_NhomDanhGiaNhiemVu = (nam) => ({
    ajax: true,
    data: (params) => ({ condition: { searchText: params.term, nam } }),
    url: '/api/tccb/danh-gia/nhom-danh-gia-nhiem-vu/all',
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.id, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getTccbNhomDanhGiaNhiemVu(ma, item => done && done({ id: item.id, text: item.ten })))(),
});

export function updateTccbNhomDanhGiaNhiemVuThuTu(id, thuTu, nam, done) {
    return () => {
        const url = '/api/tccb/danh-gia/nhom-danh-gia-nhiem-vu/thu-tu';
        T.put(url, { id, thuTu, nam }, (data) => {
            if (data.error) {
                T.notify('Thay đổi thứ tự bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Thay đổi thứ tự thành công!', 'success');
                done && done();
            }
        },
            () => T.notify('Thay đổi thứ tự bị lỗi!', 'danger')
        );
    };
}