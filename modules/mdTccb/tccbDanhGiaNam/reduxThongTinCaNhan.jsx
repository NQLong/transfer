import T from 'view/js/common';

const TccbThongTinCaNhanPage = 'TccbThongTinCaNhanPage:GetPage';

export default function TccbDanhGiaNamReducer(state = null, data) {
    switch (data.type) {
        case TccbThongTinCaNhanPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

T.initPage('pageTccbThongTinCaNhan');
export function getTccbThongTinCaNhanPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageTccbThongTinCaNhan', pageNumber, pageSize, pageCondition);
    const route = T.routeMatcher('/user/tccb/danh-gia-ca-nhan/:nam');
    const nam = parseInt(route.parse(window.location.pathname)?.nam);
    return dispatch => {
        const url = `/api/tccb/danh-gia-ca-nhan/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, nam }, data => {
            if (data.error) {
                T.notify('Lấy danh sách đăng ký cá nhân bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: TccbThongTinCaNhanPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách đăng ký cá nhân bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}