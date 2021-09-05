export function createQtNuocNgoaiStaff(data, done) {
    return dispatch => {
        const url = '/api/staff/qt-nuoc-ngoai';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình đi nước ngoài bị lỗi' , 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình đi nước ngoài thành công!', 'info');
                if (done) done(res);
            }
        }, error => T.notify('Thêm thông tin quá trình đi nước ngoài bị lỗi' , 'danger'));
    };
}

export function updateQtNuocNgoaiStaff(id, changes, done) {
    return dispatch => {
        const url = '/api/staff/qt-nuoc-ngoai';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình đi nước ngoài bị lỗi' , 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình đi nước ngoài thành công!', 'info');
                if (done) done();
            }
        }, error => T.notify('Cập nhật thông tin quá trình đi nước ngoài bị lỗi' , 'danger'));
    };
}

export function deleteQtNuocNgoaiStaff(id, done) {
    return dispatch => {
        const url = '/api/staff/qt-nuoc-ngoai';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình đi nước ngoài bị lỗi' , 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình đi nước ngoài được xóa thành công!', 'info', false, 800);
                if (done) done();
            }
        }, error => T.notify('Xóa thông tin quá trình đi nước ngoài bị lỗi' , 'danger'));
    };
}

export function createQtNuocNgoaiStaffUser(data, done) {
    return dispatch => {
        const url = '/api/user/staff/qt-nuoc-ngoai';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình đi nước ngoài bị lỗi' , 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình đi nước ngoài thành công!', 'info');
                if (done) done(res);
            }
        }, error => T.notify('Thêm thông tin quá trình đi nước ngoài bị lỗi' , 'danger'));
    };
}

export function updateQtNuocNgoaiStaffUser(id, changes, done) {
    return dispatch => {
        const url = '/api/user/staff/qt-nuoc-ngoai';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình đi nước ngoài bị lỗi' , 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình đi nước ngoài thành công!', 'info');
                if (done) done();
            }
        }, error => T.notify('Cập nhật thông tin quá trình đi nước ngoài bị lỗi' , 'danger'));
    };
}

export function deleteQtNuocNgoaiStaffUser(id, done) {
    return dispatch => {
        const url = '/api/user/staff/qt-nuoc-ngoai';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình đi nước ngoài bị lỗi' , 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình đi nước ngoài được xóa thành công!', 'info', false, 800);
                done && done();
            }
        }, error => T.notify('Xóa thông tin quá trình đi nước ngoài bị lỗi' , 'danger'));
    };
}