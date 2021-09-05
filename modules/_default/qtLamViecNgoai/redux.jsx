export function createQtLamViecNgoaiStaff(data, done) {
    return dispatch => {
        const url = '/api/staff/qt-lam-viec-ngoai';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình tham gia làm việc bên ngoài theo lời mời bị lỗi' , 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình tham gia làm việc bên ngoài theo lời mời thành công!', 'info');
                if (done) done(res);
            }
        }, error => T.notify('Thêm thông tin quá trình tham gia làm việc bên ngoài theo lời mời bị lỗi' , 'danger'));
    };
}

export function updateQtLamViecNgoaiStaff(id, changes, done) {
    return dispatch => {
        const url = '/api/staff/qt-lam-viec-ngoai';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình tham gia làm việc bên ngoài theo lời mời bị lỗi' , 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình tham gia làm việc bên ngoài theo lời mời thành công!', 'info');
                if (done) done();
            }
        }, error => T.notify('Cập nhật thông tin quá trình tham gia làm việc bên ngoài theo lời mời bị lỗi' , 'danger'));
    };
}

export function deleteQtLamViecNgoaiStaff(id, done) {
    return dispatch => {
        const url = '/api/staff/qt-lam-viec-ngoai';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình tham gia làm việc bên ngoài theo lời mời bị lỗi' , 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình tham gia làm việc bên ngoài theo lời mời được xóa thành công!', 'info', false, 800);
                if (done) done();
            }
        }, error => T.notify('Xóa thông tin quá trình tham gia làm việc bên ngoài theo lời mời bị lỗi' , 'danger'));
    };
}

export function createQtLamViecNgoaiStaffUser(data, done) {
    return dispatch => {
        const url = '/api/user/staff/qt-lam-viec-ngoai';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình tham gia làm việc bên ngoài theo lời mời bị lỗi' , 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình tham gia làm việc bên ngoài theo lời mời thành công!', 'info');
                if (done) done(res);
            }
        }, error => T.notify('Thêm thông tin quá trình tham gia làm việc bên ngoài theo lời mời bị lỗi' , 'danger'));
    };
}

export function updateQtLamViecNgoaiStaffUser(id, changes, done) {
    return dispatch => {
        const url = '/api/user/staff/qt-lam-viec-ngoai';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình tham gia làm việc bên ngoài theo lời mời bị lỗi' , 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình tham gia làm việc bên ngoài theo lời mời thành công!', 'info');
                if (done) done();
            }
        }, error => T.notify('Cập nhật thông tin quá trình tham gia làm việc bên ngoài theo lời mời bị lỗi' , 'danger'));
    };
}

export function deleteQtLamViecNgoaiStaffUser(id, done) {
    return dispatch => {
        const url = '/api/user/staff/qt-lam-viec-ngoai';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình tham gia làm việc bên ngoài theo lời mời bị lỗi' , 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình tham gia làm việc bên ngoài theo lời mời được xóa thành công!', 'info', false, 800);
                done && done();
            }
        }, error => T.notify('Xóa thông tin quá trình tham gia làm việc bên ngoài theo lời mời bị lỗi' , 'danger'));
    };
}