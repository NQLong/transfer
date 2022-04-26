export function getDanhSachMonMo(condition, done) {
    return () => {
        const url = '/api/dao-tao/danh-sach-mon-mo/all';
        T.get(url, { yearth: condition?.yearth, id: condition?.id }, data => {
            if (data.error) {
                T.notify(`Lỗi: ${data.error.message}`, 'danger');
                console.error(data.error.message);
            } else if (data.warning) {
                T.notify(`Cảnh báo: ${data.warning}`, 'warning');
                console.warn(data.warning);
                done && done(data.item);
            } else {
                done && done(data.item);
            }
        });
    };
}