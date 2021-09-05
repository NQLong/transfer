export function createQTHTCTStaff(data, done) {
    return dispatch => {
        const url = '/api/staff/qt-htct';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình học tập, công tác bị lỗi' , 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình học tập, công tác thành công!', 'info');
                if (done) done(res);
            }
        }, error => T.notify('Thêm thông tin quá trình học tập, công tác bị lỗi' , 'danger'));
    };
}

export function updateQTHTCTStaff(id, changes, done) {
    return dispatch => {
        const url = '/api/staff/qt-htct';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình học tập, công tác bị lỗi' , 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình học tập, công tác thành công!', 'info');
                if (done) done();
            }
        }, error => T.notify('Cập nhật thông tin quá trình học tập, công tác bị lỗi' , 'danger'));
    };
}

export function deleteQTHTCTStaff(id, done) {
    return dispatch => {
        const url = '/api/staff/qt-htct';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình học tập, công tác bị lỗi' , 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình học tập, công tác được xóa thành công!', 'info', false, 800);
                if (done) done();
            }
        }, error => T.notify('Xóa thông tin quá trình học tập, công tác bị lỗi' , 'danger'));
    };
}

export function createQTHTCTStaffUser(data, done) {
    return dispatch => {
        const url = '/api/user/staff/qt-htct';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình học tập, công tác bị lỗi' , 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình học tập, công tác thành công!', 'info');
                if (done) done(res);
            }
        }, error => T.notify('Thêm thông tin quá trình học tập, công tác bị lỗi' , 'danger'));
    };
}

export function updateQTHTCTStaffUser(id, changes, done) {
    return dispatch => {
        const url = '/api/user/staff/qt-htct';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình học tập, công tác bị lỗi' , 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình học tập, công tác thành công!', 'info');
                if (done) done();
            }
        }, error => T.notify('Cập nhật thông tin quá trình học tập, công tác bị lỗi' , 'danger'));
    };
}

export function deleteQTHTCTStaffUser(id, done) {
    return dispatch => {
        const url = '/api/user/staff/qt-htct';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình học tập, công tác bị lỗi' , 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình học tập, công tác được xóa thành công!', 'info', false, 800);
                done && done();
            }
        }, error => T.notify('Xóa thông tin quá trình học tập, công tác bị lỗi' , 'danger'));
    };
}