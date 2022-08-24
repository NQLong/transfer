import T from 'view/js/common';

export function sendSmsViettel(data, done) {
    return () => {
        const url = '/api/sms-service/viettel';
        T.post(url, data, result => {
            if (result.error) {
                T.notify('Lỗi hệ thống', 'danger');
                console.error(result.error);
            } else {
                T.notify('Gửi tin nhắn thành công', 'success');
                done && done();
            }
        });
    };
}