
import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TcHocPhiGetPage = 'TcHocPhi:GetPage';
const TcHocPhiGet = 'TcHocPhi:Get';
const TcHocPhiAll = 'TcHocPhi:All';

const TcHocPhiUpdate = 'TcHocPhi:Update';
const TcHocPhiGetHuongDan = 'TcHocPhi:GetHuongDan';

export default function dtThoiKhoaBieuReducer(state = null, data) {
    switch (data.type) {
        case TcHocPhiGetPage:
            return Object.assign({}, state, { page: data.page });
        case TcHocPhiGet:
            return Object.assign({}, state, { data: data.result });
        case TcHocPhiAll:
            return Object.assign({}, state, { dataAll: data.result });
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
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].mssv == updatedItem.mssv) {
                            updatedItem['hoTenSinhVien'] = updatedPage.list[i]['hoTenSinhVien'];
                            updatedPage.list[i] = updatedItem;
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
export function getTcHocPhiPage(pageNumber, pageSize, pageCondition, pageFilter, done) {
    const page = T.updatePage('pageTcHocPhi', pageNumber, pageSize, pageCondition, pageFilter);
    return dispatch => {
        const url = `/api/finance/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: pageCondition, filter: pageFilter }, data => {
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

export function createMultipleHocPhi(data, done) {
    return dispatch => {
        const url = '/api/finance/hoc-phi/multiple';
        T.post(url, { data }, (data) => {
            if (!data.error) {
                dispatch({ type: TcHocPhiUpdate, item: data.item });
                done && done();
            } else {
                T.notify('Lưu danh sách học phí có lỗi', 'danger');
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

export function getAllHocPhiStudent(mssv, done) {
    return dispatch => {
        const url = '/api/finance/user/get-all-hoc-phi';
        T.get(url, { mssv }, result => {
            if (result.error) {
                T.notify('Lỗi khi lấy thông tin học phí!', 'danger');
                console.error(result.error);
            } else {
                done && done(result);
                dispatch({ type: TcHocPhiAll, result });
            }
        });
    };
}
export function getHocPhi(mssv, done) {
    return dispatch => {
        const url = '/api/finance/user/hoc-phi';
        T.get(url, { mssv }, result => {
            if (result.error) {
                T.notify('Lỗi khi lấy thông tin học phí!', 'danger');
                console.error(result.error);
            } else {
                done && done(result);
                dispatch({ type: TcHocPhiGet, result });
            }
        });
    };
}

export function vnPayGoToTransaction(bank, done) {
    return () => {
        T.get(`/api/vnpay/start-thanh-toan/${bank}`, (result) => {
            if (result.error) {
                T.notify('Thanh toán bằng VNPAY thất bại!', 'danger');
                console.error(result.error);
            } else {
                done(result);
            }
        });
    };
}

export function createInvoice(mssv, hocKy, namHoc, done, onError) {
    return () => {
        const url = '/api/finance/invoice';
        T.post(url, { mssv, hocKy, namHoc }, res => {
            if (res.error) {
                T.notify('Tạo hóa đơn lỗi', 'danger');
                console.error(`GET: ${url}.`, res.error);
                onError && onError();
            }
            else {
                T.notify('Tạo hóa đơn thành công', 'success');
                // dispatch(getTongGiaoDichPage());
                done && done(res.item);
            }
        }, () => T.notify('Tạo hóa đơn lỗi', 'danger'));
    };
}

export function createInvoiceList(data, done, onError) {
    return () => {
        const url = '/api/finance/invoice/list';
        T.post(url, data, res => {
            if (res.error) {
                T.notify('Tạo hóa đơn lỗi', 'danger');
                console.error(`POST: ${url}.`, res.error);
                onError && onError();
            }
            else {
                T.notify('Tạo hóa đơn thành công', 'success');
                done && done(res.result);
            }
        }, () => T.notify('Tạo hóa đơn lỗi', 'danger'));
    };
}