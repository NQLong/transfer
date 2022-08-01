import T from 'view/js/common';

const TcInvoiceGetPage = 'TcInvoice:GetPage';

export default function tcInvoiceReducer(state = null, data) {
    switch (data.type) {
        case TcInvoiceGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ----------------------------------------------------------------------------------------------------
T.initPage('pageTcInvoice');
export function getInvoicePage(pageNumber, pageSize, pageCondition, pageFilter, done) {
    const page = T.updatePage('pageTcInvoice', pageNumber, pageSize, pageCondition, pageFilter);
    return dispatch => {
        const url = `/api/finance/invoice/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: pageCondition, filter: pageFilter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hóa đơn bị lỗi!', 'danger');
                console.error(`GET ${url}.`, data.error);
            } else {
                dispatch({ type: TcInvoiceGetPage, page: data.page });
                if (done) done(data.page);
            }
        });
    };
}