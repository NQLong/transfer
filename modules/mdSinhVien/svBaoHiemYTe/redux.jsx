import T from 'view/js/common';

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


export function createSvBaoHiemYTe(data, done) {
    return () => {
        const url = '/api/student/bhyt';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Có lỗi hệ thống! Vui lòng báo để được hỗ trợ', 'danger');
            } else {
                done(result.item);
                T.notify('Đăng ký thành công!', 'danger');
            }
        });
    };
}