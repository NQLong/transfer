export function getSvSettingKeys() {
    let keys = [], callback = null;
    for (const key of arguments) {
        if (typeof key != 'function') keys.push(key);
        else callback = key;
    }
    return () => {
        const url = '/api/students/setting/keys';
        T.get(url, { keys }, result => {
            if (result.error) {
                T.notify('Lấy thống tin cấu hình bị lỗi', 'danger');
                console.error(result.error);
            } else {
                callback && callback(result.items);
            }
        }, () => T.notify('Lấy thông tin cấu hình bị lỗi!', 'danger'));
    };
}

export function GetDashboard(done) {
    return () => {
        const url = '/api/students/dashboard';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi!', 'danger');
            } else {
                done && done(result);
            }
        });
    };
}

export function updatSvSettingKeys(changes, done) {
    return () => {
        const url = '/api/students/setting';
        T.put(url, { changes }, result => {
            if (result.error) {
                T.notify('Cập nhật thống tin cấu hình bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${result.error}`);
                done && done(result.error);
            } else {
                T.notify('Cập nhật thông tin cấu hình thành công!', 'success');
                done && done(result.item);
            }
        }, () => T.notify('Cập nhật thông tin cấu hình bị lỗi!', 'danger'));
    };
}

export function checkSinhVienNhapHoc(mssv, done) {
    return () => {
        const url = '/api/ctsv/nhap-hoc/check-svnh-data';
        T.post(url, { mssv }, data => {
            if (data.error) {
                T.notify('Hồ sơ không hợp lệ!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.dataNhapHoc);
            }
        }, () => T.notify('Kiểm tra thống tin sinh viên bị lỗi!', 'danger'));
    };
}

export function setSinhVienNhapHoc(data, done) {
    return () => {
        const url = '/api/ctsv/nhap-hoc/set-svnh-data';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Cập nhật thống tin nhập học sinh viên bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thống tin nhập học sinh viên thành công!', 'success');
                done && done(data.dataNhapHoc);
            }
        }, () => T.notify('Cập nhật thống tin nhập học sinh viên bị lỗi!', 'danger'));
    };
}