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

