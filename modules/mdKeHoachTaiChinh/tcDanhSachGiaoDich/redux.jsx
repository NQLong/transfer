import T from 'view/js/common';

const TcTongGiaoDichGetPage = 'TcTongGiaoDich:GetPage';
const TcTongGiaoDichGetListNganHang = 'TcTongGiaoDich:GetListNganHang';

export default function tcGiaoDich(state = null, data) {
    switch (data.type) {
        case TcTongGiaoDichGetPage:
            return Object.assign({}, state, { page: data.page });
        case TcTongGiaoDichGetListNganHang:
            return Object.assign({}, state, { nganHang: data.nganHang });
        default:
            return state;
    }
}

// Actions ----------------------------------------------------------------------------------------------------
T.initPage('pageTcTongGiaoDich');
export function getTongGiaoDichPage(pageNumber, pageSize, pageCondition, pageFilter, done) {
    const page = T.updatePage('pageTcTongGiaoDich', pageNumber, pageSize, pageCondition, pageFilter);
    return dispatch => {
        const url = `/api/finance/danh-sach-giao-dich/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: pageCondition, filter: pageFilter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách học phí bị lỗi!', 'danger');
                console.error(`GET ${url}.`, data.error);
            } else {
                dispatch({ type: TcTongGiaoDichGetPage, page: data.page });
                if (done) done(data.page);
            }
        });
    };
}

export function getListNganHang(done) {
    return dispatch => {
        const url = '/api/finance/danh-sach-giao-dich/list-ngan-hang';
        T.get(url, res => {
            if (res.error) {
                T.notify('Lấy danh sách ngân hàng lỗi', 'danger');
                console.error(`GET: ${url}.`, res.error);
            }
            else {
                dispatch({ type: TcTongGiaoDichGetListNganHang, nganHang: res.items });
                done && done(res.items);
            }
        }, () => T.notify('Lấy danh sách ngân hàng lỗi', 'danger'));
    };
}

export function createGiaoDich(data, done){
    return dispatch => {
        const url = '/api/finance/danh-sach-giao-dich';
        T.post(url, data, res => {
            if (res.error) {
                T.notify('Tạo giao dịch lỗi. ' + (res.error.message && typeof res.error.message === 'string' ? res.error.message : ''), 'danger');
                console.error(`POST: ${url}.`, res.error);
            }
            else {
                T.notify('Tạo giao dịch thành công', 'success');
                dispatch(getTongGiaoDichPage());
                done && done(res.items);
            }
        }, () => T.notify('Tạo giao dịch lỗi', 'danger'));
    };
}