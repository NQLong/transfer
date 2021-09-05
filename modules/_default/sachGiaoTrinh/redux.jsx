export function createSachGTStaff(data, done) {
    return dispatch => {
        const url = '/api/staff/sach-giao-trinh';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin sách, giáo trình bị lỗi' , 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin sách, giáo trình thành công!', 'info');
                if (done) done(res);
            }
        }, error => T.notify('Thêm thông tin sách, giáo trình bị lỗi' , 'danger'));
    };
}

export function updateSachGTStaff(id, changes, done) {
    return dispatch => {
        const url = '/api/staff/sach-giao-trinh';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin sách, giáo trình bị lỗi' , 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin sách, giáo trình thành công!', 'info');
                if (done) done();
            }
        }, error => T.notify('Cập nhật thông tin sách, giáo trình bị lỗi' , 'danger'));
    };
}

export function deleteSachGTStaff(id, done) {
    return dispatch => {
        const url = '/api/staff/sach-giao-trinh';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin sách, giáo trình bị lỗi' , 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin sách, giáo trình được xóa thành công!', 'info', false, 800);
                if (done) done();
            }
        }, error => T.notify('Xóa thông tin sách, giáo trình bị lỗi' , 'danger'));
    };
}

export function createSachGTStaffUser(data, done) {
    return dispatch => {
        const url = '/api/user/staff/sach-giao-trinh';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin sách, giáo trình bị lỗi' , 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin sách, giáo trình thành công!', 'info');
                if (done) done(res);
            }
        }, error => T.notify('Thêm thông tin sách, giáo trình bị lỗi' , 'danger'));
    };
}

export function updateSachGTStaffUser(id, changes, done) {
    return dispatch => {
        const url = '/api/user/staff/sach-giao-trinh';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin sách, giáo trình bị lỗi' , 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin sách, giáo trình thành công!', 'info');
                if (done) done();
            }
        }, error => T.notify('Cập nhật thông tin sách, giáo trình bị lỗi' , 'danger'));
    };
}

export function deleteSachGTStaffUser(id, done) {
    return dispatch => {
        const url = '/api/user/staff/sach-giao-trinh';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin sách, giáo trình bị lỗi' , 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin sách, giáo trình được xóa thành công!', 'info', false, 800);
                done && done();
            }
        }, error => T.notify('Xóa thông tin sách, giáo trình bị lỗi' , 'danger'));
    };
}