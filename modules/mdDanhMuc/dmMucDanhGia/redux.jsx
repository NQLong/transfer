import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmMucDanhGiaGetAll = 'DmMucDanhGia:GetAll';
const DmMucDanhGiaGetPage = 'DmMucDanhGia:GetPage';
const DmMucDanhGiaUpdate = 'DmMucDanhGia:Update';

export default function DmMucDanhGiaReducer(state = null, data) {
    switch (data.type) {
        case DmMucDanhGiaGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmMucDanhGiaGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmMucDanhGiaUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].ma == updatedItem.ma) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].ma == updatedItem.ma) {
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
T.initPage('pageDmMucDanhGia');

export function getDmMucDanhGiaAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/muc-danh-gia/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách mức đánh giá bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmMucDanhGiaGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách mức đánh giá bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmMucDanhGiaPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmMucDanhGia', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/muc-danh-gia/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách mức đánh giá bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmMucDanhGiaGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách mức đánh giá bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmMucDanhGia(ma, done) {
    console.log(ma);
    return () => {
        const url = `/api/danh-muc/muc-danh-gia/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin mức đánh giá bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function createDmMucDanhGia(item, done) {
    return dispatch => {

        const url = '/api/danh-muc/muc-danh-gia';
        T.post(url, { item }, data => {
            if (data.error) {
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mức đánh giá thành công!', 'success');
                dispatch(getDmMucDanhGiaAll());
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo mức đánh giá bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmMucDanhGia(ma) {
    return dispatch => {
        const url = '/api/danh-muc/muc-danh-gia';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa mức đánh giá  bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('mức đánh giá đã xóa thành công!', 'success', false, 800);
                dispatch(getDmMucDanhGiaAll());
            }
        }, (error) => T.notify('Xóa mức đánh giá bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmMucDanhGia(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/muc-danh-gia';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật mức đánh giá bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật mức đánh giá thành công!', 'success');
                dispatch(getDmMucDanhGiaAll());
            }
        }, (error) => T.notify('Cập nhật mức đánh giá bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function changeDmMucDanhGia(item) {
    return { type: DmMucDanhGiaUpdate, item };
}
export const SelectAdapter_DmMucDanhGiaAll = {
    ajax: true,
    url: '/api/danh-muc/muc-danh-gia/all',
    data: params => ({ condition: params.term, kichHoat: 1 }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDmMucDanhGia(ma, item => item && done && done({ id: item.ma, text: item.ten })))(),
};