export function createQtKyYeuStaff(data, done) {
    return dispatch => {
        const url = '/api/staff/qt-ky-yeu';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin kỷ yếu hội nghị, hội thảo bị lỗi' , 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin kỷ yếu hội nghị, hội thảo thành công!', 'info');
                if (done) done(res);
            }
        }, error => T.notify('Thêm thông tin kỷ yếu hội nghị, hội thảo bị lỗi' , 'danger'));
    }
}

export function updateQtKyYeuStaff(id, changes, done) {
    return dispatch => {
        const url = '/api/staff/qt-ky-yeu';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin kỷ yếu hội nghị, hội thảo bị lỗi' , 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin kỷ yếu hội nghị, hội thảo thành công!', 'info');
                if (done) done();
            }
        }, error => T.notify('Cập nhật thông tin kỷ yếu hội nghị, hội thảo bị lỗi' , 'danger'));
    }
}

export function deleteQtKyYeuStaff(id, done) {
    return dispatch => {
        const url = '/api/staff/qt-ky-yeu';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin kỷ yếu hội nghị, hội thảo bị lỗi' , 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin kỷ yếu hội nghị, hội thảo được xóa thành công!', 'info', false, 800);
                if (done) done();
            }
        }, error => T.notify('Xóa thông tin kỷ yếu hội nghị, hội thảo bị lỗi' , 'danger'));
    }
}

export function createQtKyYeuStaffUser(data, done) {
    return dispatch => {
        const url = '/api/user/staff/qt-ky-yeu';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin kỷ yếu hội nghị, hội thảo bị lỗi' , 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin kỷ yếu hội nghị, hội thảo thành công!', 'info');
                if (done) done(res);
            }
        }, error => T.notify('Thêm thông tin kỷ yếu hội nghị, hội thảo bị lỗi' , 'danger'));
    }
}

export function updateQtKyYeuStaffUser(id, changes, done) {
    return dispatch => {
        const url = '/api/user/staff/qt-ky-yeu';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin kỷ yếu hội nghị, hội thảo bị lỗi' , 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin kỷ yếu hội nghị, hội thảo thành công!', 'info');
                if (done) done();
            }
        }, error => T.notify('Cập nhật thông tin kỷ yếu hội nghị, hội thảo bị lỗi' , 'danger'));
    }
}

export function deleteQtKyYeuStaffUser(id, done) {
    return dispatch => {
        const url = '/api/user/staff/qt-ky-yeu';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin kỷ yếu hội nghị, hội thảo bị lỗi' , 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin kỷ yếu hội nghị, hội thảo được xóa thành công!', 'info', false, 800);
                done && done()
            }
        }, error => T.notify('Xóa thông tin kỷ yếu hội nghị, hội thảo bị lỗi' , 'danger'));
    }
}