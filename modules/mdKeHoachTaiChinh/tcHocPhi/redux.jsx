import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TcHocPhiGetPage = 'TcHocPhi:GetPage';

export default function dtThoiKhoaBieuReducer(state = null, data) {
    switch (data.type) {
        case TcHocPhiGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ----------------------------------------------------------------------------------------------------
T.initPage('pageTcHocPhi');
export function getTcHocPhiPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageTcHocPhi', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/finance/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách học phí bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: TcHocPhiGetPage, page: data.page });
                if (done) done(data.page);
            }
        });
    };
}

export function getTcHocPhiTransactionByMssv(mssv, done) {
    return () => {
        const url = `/api/finance/hoc-phi-transactions/${mssv}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy các đợt thanh toán của sinh viên bị lỗi', 'danger');
                console.error(result.error);
            }
            else {
                done(result);
            }
        });
    };
}