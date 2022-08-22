import T from 'view/js/common';

export function checkSinhVienNhapHoc(mssv, done) {
    return () => {
        const url = '/api/ctsv/nhap-hoc/check-svnh-data';
        T.post(url, { mssv }, data => {
            if (data.error) {
                T.notify(`${data.error.message || 'Lỗi hệ thống'}`, 'danger');
            }
            else done(data);
        }, () => T.notify('Kiểm tra thống tin sinh viên bị lỗi!', 'danger'));
    };
}

export function setSinhVienNhapHoc(data, done) {
    return () => {
        const url = '/api/ctsv/nhap-hoc/set-svnh-data';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify(`${data.error.message || 'Lỗi hệ thống'}`, 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                // T.notify('Cập nhật thống tin nhập học sinh viên thành công!', 'success');
                done && done(data.dataNhapHoc);
            }
        }, () => T.notify('Cập nhật thống tin nhập học sinh viên bị lỗi!', 'danger'));
    };
}

export function createCauHinhNhapHoc(data, done) {
    return () => {
        const url = '/api/ctsv/cau-hinh-nhap-hoc';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Lưu cấu hình bị lỗi!', 'danger');
                console.error(`GET ${url}. ${result.error}`);
            } else {
                done && done(result);
            }
        });
    };
}

export function getCauHinhNhapHoc(done) {
    return () => {
        const url = '/api/ctsv/cau-hinh-nhap-hoc';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy cấu hình bị lỗi!', 'danger');
                console.error(`GET ${url}. ${result.error}`);
            } else {
                done && done(result.item);
            }
        });
    };
}