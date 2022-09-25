import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TccbDanhGiaPDDVGetPage = 'TccbDanhGiaPDDV:GetPage';
const TccbDanhGiaPDDVUpdate = 'TccbDanhGiaPDDV:Update';

export default function TccbDanhGiaPDDVReducer(state = null, data) {
    switch (data.type) {
        case TccbDanhGiaPDDVGetPage:
            return Object.assign({}, state, { page: data.page });
        case TccbDanhGiaPDDVUpdate:
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
export function getTccbDanhGiaPheDuyetDonViAllNam(done) {
    return () => {
        const url = '/api/tccb/danh-gia-phe-duyet-don-vi/all-nam';
        T.get(url, {}, data => {
            if (data.error) {
                T.notify('Lấy danh sách năm đánh giá bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
            }
        });
    };
}

T.initPage('pageTccbDanhGiaPDDV');
export function getTccbDanhGiaPDDVPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageTccbDanhGiaPDDV', pageNumber, pageSize, pageCondition);
    const route = T.routeMatcher('/user/tccb/danh-gia-phe-duyet-don-vi/:nam');
    const nam = parseInt(route.parse(window.location.pathname)?.nam);
    return dispatch => {
        const url = `/api/tccb/danh-gia-phe-duyet-don-vi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { nam, condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách phê duyệt bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: TccbDanhGiaPDDVGetPage, page: data.page });
            }
        });
    };
}

export function updateTccbDanhGiaPDDV(id, approvedDonVi, done) {
    const route = T.routeMatcher('/user/tccb/danh-gia-phe-duyet-don-vi/:nam');
    const nam = parseInt(route.parse(window.location.pathname)?.nam);
    return dispatch => {
        const url = '/api/tccb/danh-gia-phe-duyet-don-vi';
        T.put(url, { id, approvedDonVi, nam }, data => {
            if (data.error) {
                T.notify(`Phê duyệt bị lỗi: ${data.error.message}`, 'danger');
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                if (done) done(data.item);
                const message = data.item.approvedDonVi == 'Đồng ý' ? 'Đồng ý phê duyệt thành công!' : 'Không đồng ý phê duyệt thành công';
                T.notify(message, 'success');
                dispatch(getTccbDanhGiaPDDVPage());
            }
        });
    };
}
