import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TccbDanhGiaPDTGetPage = 'TccbDanhGiaPDT:GetPage';
const TccbDanhGiaPDTUpdate = 'TccbDanhGiaPDT:Update';

export default function TccbDanhGiaPDTReducer(state = null, data) {
    switch (data.type) {
        case TccbDanhGiaPDTGetPage:
            return Object.assign({}, state, { page: data.page });
        case TccbDanhGiaPDTUpdate:
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
export function getTccbDanhGiaPheDuyetTruongAllNam(done) {
    return () => {
        const url = '/api/tccb/danh-gia-phe-duyet-truong/all-nam';
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

T.initPage('pageTccbDanhGiaPDT');
export function getTccbDanhGiaPDTPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageTccbDanhGiaPDT', pageNumber, pageSize, pageCondition);
    const route = T.routeMatcher('/user/tccb/danh-gia-phe-duyet-truong/:nam');
    const nam = parseInt(route.parse(window.location.pathname)?.nam);
    return dispatch => {
        const url = `/api/tccb/danh-gia-phe-duyet-truong/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { nam, condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách phê duyệt bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: TccbDanhGiaPDTGetPage, page: data.page });
            }
        });
    };
}

export function updateTccbDanhGiaPDT(id, approvedTruong, done) {
    const route = T.routeMatcher('/user/tccb/danh-gia-phe-duyet-truong/:nam');
    const nam = parseInt(route.parse(window.location.pathname)?.nam);
    return dispatch => {
        const url = '/api/tccb/danh-gia-phe-duyet-truong';
        T.put(url, { id, approvedTruong, nam }, data => {
            if (data.error) {
                T.notify(`Phê duyệt bị lỗi: ${data.error.message}`, 'danger');
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                if (done) done(data.item);
                T.notify('Phê duyệt thành công', 'success');
                dispatch(getTccbDanhGiaPDTPage());
            }
        });
    };
}
