export function createDtThoiGianPhanCong(data, done) {
    return () => {
        const url = '/api/dao-tao/thoi-gian-phan-cong';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Tạo mới thời gian phân công bị lỗi', 'danger');
                console.error(data.error);
            } else {
                T.notify('Tạo mới thành công', 'success');
                done && done(data);
            }
        });
    };
}