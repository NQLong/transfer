import T from 'view/js/common';

const TccbThongTinDonViPage = 'TccbThongTinDonViPage:GetPage';

export default function TccbDanhGiaNamReducer(state = null, data) {
    switch (data.type) {
        case TccbThongTinDonViPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

T.initPage('pageTccbThongTinDonVi');
export function getTccbThongTinDonViPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageTccbThongTinDonVi', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/tccb/danh-gia/don-vi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách đơn vị trường đại học bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: TccbThongTinDonViPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách đơn vị trường đại học bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getTccbThongTinDangKyDonVi(nam, maDonVi, done) {
    return () => {
        const url = '/api/tccb/danh-gia/don-vi/';
        T.get(url, { nam, ma: maDonVi }, data => {
            if (data.error) {
                T.notify('Lấy thông tin bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items, data.donVi);
            }
        });
    };
}
