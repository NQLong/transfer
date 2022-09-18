import T from 'view/js/common';

const SvBHYTAll = 'SvBHYT:GetAll';
export default function svBaoHiemYTeReducer(state = null, data) {
    switch (data.type) {
        case SvBHYTAll:
            return Object.assign({}, state, { items: data.items, dataChuHo: data.dataChuHo, dataThanhVien: data.dataThanhVien });
        default:
            return state;
    }

}
export function getAllSvBaoHiemYTe(namHoc, done) {
    return dispatch => {
        const url = '/api/student/bhyt/all';
        T.get(url, { filter: { namHoc } }, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu BHYT lỗi', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: SvBHYTAll, items: result.items, dataChuHo: result.dataChuHo, dataThanhVien: result.dataThanhVien });
                done && done();
            }
        });
    };
}
export function getSvBaoHiemYTe(done) {
    return () => {
        const url = '/api/student/bhyt';
        T.get(url, result => {
            if (result.error) {
                T.notify('Có lỗi hệ thống! Vui lòng báo để được hỗ trợ', 'danger');
            } else {
                done(result.item);
            }
        });
    };
}

export function getMssvBaoHiemYTe(data, done) {
    return () => {
        const url = '/api/student/bhyt';
        T.get(url, data, result => {
            if (result.error) {
                T.notify('Có lỗi hệ thống! Vui lòng báo để được hỗ trợ', 'danger');
            } else {
                done(result.item);
            }
        });
    };
}


export function createMssvBaoHiemYTe(data, done) {
    return () => {
        const url = '/api/student/admin/bhyt';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Có lỗi hệ thống! Vui lòng báo để được hỗ trợ', 'danger');
            } else {
                done(result.item);
                T.notify('Đăng ký thành công!', 'success');
            }
        });
    };
}

export function createSvBaoHiemYTe(data, done) {
    return () => {
        const url = '/api/student/bhyt';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Có lỗi hệ thống! Vui lòng báo để được hỗ trợ', 'danger');
            } else {
                done(result.item);
                T.notify('Đăng ký thành công!', 'success');
            }
        });
    };
}

export function updateSvBaoHiemYTeBhyt(changes, done) {
    return () => {
        const url = '/api/student/bhyt';
        T.put(url, { changes }, result => {
            if (result.error) {
                T.notify(`${result.error?.message || 'Lỗi hệ thống. Vui lòng liên hệ để được hỗ trợ!'}`, 'danger');
            } else {
                T.notify('Cập nhật thành công!', 'success');
                done();
            }
        });
    };
}

