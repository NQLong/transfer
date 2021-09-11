export function createQtNckhStaff(data, done) {
    return () => {
        const url = '/api/staff/qt-nckh';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình nghiên cứu khoa học bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình nghiên cứu khoa học thành công!', 'info');
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin quá trình nghiên cứu khoa học bị lỗi', 'danger'));
    };
}

export function updateQtNckhStaff(id, changes, done) {
    return () => {
        const url = '/api/staff/qt-nckh';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình nghiên cứu khoa học bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình nghiên cứu khoa học thành công!', 'info');
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin quá trình nghiên cứu khoa học bị lỗi', 'danger'));
    };
}

export function deleteQtNckhStaff(id, done) {
    return () => {
        const url = '/api/staff/qt-nckh';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình nghiên cứu khoa học bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình nghiên cứu khoa học được xóa thành công!', 'info', false, 800);
                if (done) done();
            }
        }, () => T.notify('Xóa thông tin quá trình nghiên cứu khoa học bị lỗi', 'danger'));
    };
}

export function createQtNckhStaffUser(data, done) {
    return () => {
        const url = '/api/user/staff/qt-nckh';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình nghiên cứu khoa học bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình nghiên cứu khoa học thành công!', 'info');
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin quá trình nghiên cứu khoa học bị lỗi', 'danger'));
    };
}

export function updateQtNckhStaffUser(id, changes, done) {
    return () => {
        const url = '/api/user/staff/qt-nckh';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình nghiên cứu khoa học bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình nghiên cứu khoa học thành công!', 'info');
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin quá trình nghiên cứu khoa học bị lỗi', 'danger'));
    };
}

export function deleteQtNckhStaffUser(id, done) {
    return () => {
        const url = '/api/user/staff/qt-nckh';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình nghiên cứu khoa học bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình nghiên cứu khoa học được xóa thành công!', 'info', false, 800);
                done && done();
            }
        }, () => T.notify('Xóa thông tin quá trình nghiên cứu khoa học bị lỗi', 'danger'));
    };
}