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