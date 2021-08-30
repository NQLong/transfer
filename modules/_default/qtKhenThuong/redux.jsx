export function createQtKhenThuongStaff(data, done) {
    return dispatch => {
        const url = '/api/staff/qt-khen-thuong';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình khen thưởng bị lỗi' , 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình khen thưởng thành công!', 'info');
                if (done) done(res);
            }
        }, error => T.notify('Thêm thông tin quá trình khen thưởng bị lỗi' , 'danger'));
    }
}

export function updateQtKhenThuongStaff(id, changes, done) {
    return dispatch => {
        const url = '/api/staff/qt-khen-thuong';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình khen thưởng bị lỗi' , 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình khen thưởng thành công!', 'info');
                if (done) done();
            }
        }, error => T.notify('Cập nhật thông tin quá trình khen thưởng bị lỗi' , 'danger'));
    }
}

export function deleteQtKhenThuongStaff(id, done) {
    return dispatch => {
        const url = '/api/staff/qt-khen-thuong';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình khen thưởng bị lỗi' , 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình khen thưởng được xóa thành công!', 'info', false, 800);
                if (done) done();
            }
        }, error => T.notify('Xóa thông tin quá trình khen thưởng bị lỗi' , 'danger'));
    }
}

export function createQtKhenThuongStaffUser(data, done) {
    return dispatch => {
        const url = '/api/user/staff/qt-khen-thuong';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình khen thưởng bị lỗi' , 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình khen thưởng thành công!', 'info');
                if (done) done(res);
            }
        }, error => T.notify('Thêm thông tin quá trình khen thưởng bị lỗi' , 'danger'));
    }
}

export function updateQtKhenThuongStaffUser(id, changes, done) {
    return dispatch => {
        const url = '/api/user/staff/qt-khen-thuong';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình khen thưởng bị lỗi' , 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình khen thưởng thành công!', 'info');
                if (done) done();
            }
        }, error => T.notify('Cập nhật thông tin quá trình khen thưởng bị lỗi' , 'danger'));
    }
}

export function deleteQtKhenThuongStaffUser(id, done) {
    return dispatch => {
        const url = '/api/user/staff/qt-khen-thuong';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình khen thưởng bị lỗi' , 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình khen thưởng được xóa thành công!', 'info', false, 800);
                done && done()
            }
        }, error => T.notify('Xóa thông tin quá trình khen thưởng bị lỗi' , 'danger'));
    }
}