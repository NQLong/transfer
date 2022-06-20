
import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TcHocPhiGetPage = 'TcHocPhi:GetPage';
const TcHocPhiUpdate = 'TcHocPhi:Update';
const TcHocPhiGetHuongDan = 'TcHocPhi:GetHuongDan';

export default function dtThoiKhoaBieuReducer(state = null, data) {
    switch (data.type) {
        case TcHocPhiGetPage:
            return Object.assign({}, state, { page: data.page });
        case TcHocPhiGetHuongDan:
            return Object.assign({}, state, { hocPhiHuongDan: data.result });
        case TcHocPhiUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].mssv == updatedItem.mssv) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    if (updatedItem.isDelete) updatedPage.list = updatedPage.list.filter(item => item.mssv != updatedItem.mssv);
                    else for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].mssv == updatedItem.mssv) {
                            updatedItem['hoTenSinhVien'] = updatedPage.list[i]['hoTenSinhVien'];
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

// Actions ----------------------------------------------------------------------------------------------------
T.initPage('pageTcHocPhi');
export function getTcHocPhiPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageTcHocPhi', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/finance/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: pageCondition?.searchTerm, settings: pageCondition?.settings }, data => {
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

export function uploadDsHocPhi(upload, done) {
    return () => {
        const url = '/api/finance/hoc-phi/upload';
        T.post(url, { upload }, (data) => {
            if (!data.error) {
                done && done();
            } else {
                T.notify('Upload danh sách học phí có lỗi ' + (data.error.item ? `tại ${data.error.item}` : ''), 'danger');
            }
        });
    };
}

export function updateHocPhi(item, changes, done) {
    return dispatch => {
        const url = '/api/finance/hoc-phi';
        T.put(url, { item, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật học phí bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin học phí thành công!', 'success');
                dispatch({ type: TcHocPhiUpdate, item: data.item });
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin học phí bị lỗi!', 'danger'));
    };
}

export function getTcHocPhiHuongDan(done) {
    return dispatch => {
        const url = '/api/finance/huong-dan-dong-hoc-phi';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy các hướng dẫn đóng học phí bị lỗi', 'danger');
                console.error(result.error);
            }
            else {
                dispatch({ type: TcHocPhiGetHuongDan, result: result?.hocPhiHuongDan });
                done && done(result);
            }
        });
    };
}

export function vnPayGoToTransaction(done) {
    return () => {
        T.get('/api/vnpay/start-thanh-toan', (result) => {
            if (result.error) {
                T.notify('Thanh toán bằng VNPAY thất bại!', 'danger');
                console.error(result.error);
            } else {
                done(result);
            }
        });
    };
}