export function getTuoiNghiHuu(phai, ngaySinh, done) {
    return () => {
        const url = '/api/danh-muc/nghi-huu/get-nghi-huu';
        T.get(url, { phai, ngaySinh }, result => {
            if (result.error) {
                T.notify('Tính tuổi nghỉ hưu lỗi' + (result.error.message && (':<br>' + result.error.message)), 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                if (done) done(result.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}