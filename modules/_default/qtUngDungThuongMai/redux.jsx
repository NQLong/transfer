export function createQtUngDungThuongMaiStaff(data, done) {
    return dispatch => {
        const url = '/api/staff/qt-ung-dung-tm';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình ứng dụng thực tiễn và thương mại hóa kết quả nghiên cứu bị lỗi' , 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình ứng dụng thực tiễn và thương mại hóa kết quả nghiên cứu thành công!', 'info');
                if (done) done(res);
            }
        }, error => T.notify('Thêm thông tin quá trình ứng dụng thực tiễn và thương mại hóa kết quả nghiên cứu bị lỗi' , 'danger'));
    }
}

export function updateQtUngDungThuongMaiStaff(id, changes, done) {
    return dispatch => {
        const url = '/api/staff/qt-ung-dung-tm';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình ứng dụng thực tiễn và thương mại hóa kết quả nghiên cứu bị lỗi' , 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình ứng dụng thực tiễn và thương mại hóa kết quả nghiên cứu thành công!', 'info');
                if (done) done();
            }
        }, error => T.notify('Cập nhật thông tin quá trình ứng dụng thực tiễn và thương mại hóa kết quả nghiên cứu bị lỗi' , 'danger'));
    }
}

export function deleteQtUngDungThuongMaiStaff(id, done) {
    return dispatch => {
        const url = '/api/staff/qt-ung-dung-tm';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình ứng dụng thực tiễn và thương mại hóa kết quả nghiên cứu bị lỗi' , 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình ứng dụng thực tiễn và thương mại hóa kết quả nghiên cứu được xóa thành công!', 'info', false, 800);
                if (done) done();
            }
        }, error => T.notify('Xóa thông tin quá trình ứng dụng thực tiễn và thương mại hóa kết quả nghiên cứu bị lỗi' , 'danger'));
    }
}

export function createQtUngDungThuongMaiStaffUser(data, done) {
    return dispatch => {
        const url = '/api/user/staff/qt-ung-dung-tm';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình ứng dụng thực tiễn và thương mại hóa kết quả nghiên cứu bị lỗi' , 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình ứng dụng thực tiễn và thương mại hóa kết quả nghiên cứu thành công!', 'info');
                if (done) done(res);
            }
        }, error => T.notify('Thêm thông tin quá trình ứng dụng thực tiễn và thương mại hóa kết quả nghiên cứu bị lỗi' , 'danger'));
    }
}

export function updateQtUngDungThuongMaiStaffUser(id, changes, done) {
    return dispatch => {
        const url = '/api/user/staff/qt-ung-dung-tm';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình ứng dụng thực tiễn và thương mại hóa kết quả nghiên cứu bị lỗi' , 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình ứng dụng thực tiễn và thương mại hóa kết quả nghiên cứu thành công!', 'info');
                if (done) done();
            }
        }, error => T.notify('Cập nhật thông tin quá trình ứng dụng thực tiễn và thương mại hóa kết quả nghiên cứu bị lỗi' , 'danger'));
    }
}

export function deleteQtUngDungThuongMaiStaffUser(id, done) {
    return dispatch => {
        const url = '/api/user/staff/qt-ung-dung-tm';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình ứng dụng thực tiễn và thương mại hóa kết quả nghiên cứu bị lỗi' , 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình ứng dụng thực tiễn và thương mại hóa kết quả nghiên cứu được xóa thành công!', 'info', false, 800);
                done && done()
            }
        }, error => T.notify('Xóa thông tin quá trình ứng dụng thực tiễn và thương mại hóa kết quả nghiên cứu bị lỗi' , 'danger'));
    }
}