//actions
export function send(data, done) {
    return () => {
        const url = '/api/finance/mail';
        T.post(url, data, (res) => {
            if (res.error) {
                T.notify('Lỗi ' + (res.error.message || res.error || ''), 'danger');
                console.error('POST: ' + url, res.error);
            }
            else {
                T.notify('Thành công', 'success');
                done && done();
            }
        }, () => T.notify('Lỗi ', 'danger'));
    };
}