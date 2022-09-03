export function getAllDtSettings(done) {
    return () => {
        const url = '/api/dao-tao/settings/all';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy thống tin cấu hình bị lỗi', 'danger');
                console.error(result.error);
            } else {
                done && done(result.items);
            }
        }, () => T.notify('Lấy thông tin cấu hình bị lỗi!', 'danger'));
    };
}

export function getDtSettingsKeys(keys, done) {
    return () => {
        const url = '/api/dao-tao/settings/keys';
        T.get(url, { keys }, result => {
            if (result.error) {
                T.notify('Lấy thống tin cấu hình bị lỗi', 'danger');
                console.error(result.error);
            } else {
                done && done(result.items);
            }
        }, () => T.notify('Lấy thông tin cấu hình bị lỗi!', 'danger'));
    };
}

export function updateDtSettingsKeys(changes, done) {
    return () => {
        const url = '/api/dao-tao/settings';
        T.put(url, { changes }, result => {
            if (result.error) {
                T.notify('Cập nhật cấu hình bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật cấu hình thành công', 'success');
                done && done();
            }
        }, () => T.notify('Lấy thông tin cấu hình bị lỗi!', 'danger'));
    };
}