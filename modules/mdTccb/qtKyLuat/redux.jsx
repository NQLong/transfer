export function createQtKyLuatStaff(data, done) {
    return () => {
        const url = '/api/qua-trinh/ky-luat';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình kỷ luật bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình kỷ luật thành công!', 'info');
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin quá trình kỷ luật bị lỗi', 'danger'));
    };
}

export function updateQtKyLuatStaff(id, changes, done) {
    return () => {
        const url = '/api/qua-trinh/ky-luat';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình kỷ luật bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình kỷ luật thành công!', 'info');
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin quá trình kỷ luật bị lỗi', 'danger'));
    };
}

export function deleteQtKyLuatStaff(id, done) {
    return () => {
        const url = '/api/qua-trinh/ky-luat';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình kỷ luật bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình kỷ luật được xóa thành công!', 'info', false, 800);
                if (done) done();
            }
        }, () => T.notify('Xóa thông tin quá trình kỷ luật bị lỗi', 'danger'));
    };
}

export function createQtKyLuatStaffUser(data, done) {
    return () => {
        const url = '/api/user/qua-trinh/ky-luat';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình kỷ luật bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình kỷ luật thành công!', 'info');
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin quá trình kỷ luật bị lỗi', 'danger'));
    };
}

export function updateQtKyLuatStaffUser(id, changes, done) {
    return () => {
        const url = '/api/user/qua-trinh/ky-luat';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình kỷ luật bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình kỷ luật thành công!', 'info');
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin quá trình kỷ luật bị lỗi', 'danger'));
    };
}

export function deleteQtKyLuatStaffUser(id, done) {
    return () => {
        const url = '/api/user/qua-trinh/ky-luat';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình kỷ luật bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình kỷ luật được xóa thành công!', 'info', false, 800);
                done && done();
            }
        }, () => T.notify('Xóa thông tin quá trình kỷ luật bị lỗi', 'danger'));
    };
}