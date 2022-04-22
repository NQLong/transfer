export function getDanhSachMonMo(condition, done) {
    return () => {
        const url = '/api/dao-tao/danh-sach-mon-mo/all';
        T.get(url, { yearth: condition?.yearth, id: condition?.id }, data => {
            if (data.error) {
                T.notify('Lỗi lấy danh sách môn mở', 'danger');
                console.error(data.error.message);
            } else {
                done && done(data.item);
            }
        });
    };
}