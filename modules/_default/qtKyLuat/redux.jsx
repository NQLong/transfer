export function createQtKyLuatStaff(data, done) {
    return dispatch => {
        const url = '/api/staff/qt-ky-luat';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình kỷ luật bị lỗi' , 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình kỷ luật thành công!', 'info');
                if (done) done(res);
            }
        }, error => T.notify('Thêm thông tin quá trình kỷ luật bị lỗi' , 'danger'));
    }
}

export function updateQtKyLuatStaff(id, changes, done) {
    return dispatch => {
        const url = '/api/staff/qt-ky-luat';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình kỷ luật bị lỗi' , 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình kỷ luật thành công!', 'info');
                if (done) done();
            }
        }, error => T.notify('Cập nhật thông tin quá trình kỷ luật bị lỗi' , 'danger'));
    }
}

export function deleteQtKyLuatStaff(id, done) {
    return dispatch => {
        const url = '/api/staff/qt-ky-luat';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình kỷ luật bị lỗi' , 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình kỷ luật được xóa thành công!', 'info', false, 800);
                if (done) done();
            }
        }, error => T.notify('Xóa thông tin quá trình kỷ luật bị lỗi' , 'danger'));
    }
}

export function createQtKyLuatStaffUser(data, done) {
    return dispatch => {
        const url = '/api/user/staff/qt-ky-luat';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình kỷ luật bị lỗi' , 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình kỷ luật thành công!', 'info');
                if (done) done(res);
            }
        }, error => T.notify('Thêm thông tin quá trình kỷ luật bị lỗi' , 'danger'));
    }
}

export function updateQtKyLuatStaffUser(id, changes, done) {
    return dispatch => {
        const url = '/api/user/staff/qt-ky-luat';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình kỷ luật bị lỗi' , 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình kỷ luật thành công!', 'info');
                if (done) done();
            }
        }, error => T.notify('Cập nhật thông tin quá trình kỷ luật bị lỗi' , 'danger'));
    }
}

export function deleteQtKyLuatStaffUser(id, done) {
    return dispatch => {
        const url = '/api/user/staff/qt-ky-luat';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình kỷ luật bị lỗi' , 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình kỷ luật được xóa thành công!', 'info', false, 800);
                done && done()
            }
        }, error => T.notify('Xóa thông tin quá trình kỷ luật bị lỗi' , 'danger'));
    }
}