export function createQtBangPhatMinhStaff(data, done) {
    return () => {
        const url = '/api/staff/qt-bang-phat-minh';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình bằng phát minh bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình bằng phát minh thành công!', 'info');
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin quá trình bằng phát minh bị lỗi', 'danger'));
    };
}

export function updateQtBangPhatMinhStaff(id, changes, done) {
    return () => {
        const url = '/api/staff/qt-bang-phat-minh';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình bằng phát minh bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình bằng phát minh thành công!', 'info');
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin quá trình bằng phát minh bị lỗi', 'danger'));
    };
}

export function deleteQtBangPhatMinhStaff(id, done) {
    return () => {
        const url = '/api/staff/qt-bang-phat-minh';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình bằng phát minh bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình bằng phát minh được xóa thành công!', 'info', false, 800);
                if (done) done();
            }
        }, () => T.notify('Xóa thông tin quá trình bằng phát minh bị lỗi', 'danger'));
    };
}

export function createQtBangPhatMinhStaffUser(data, done) {
    return () => {
        const url = '/api/user/staff/qt-bang-phat-minh';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình bằng phát minh bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình bằng phát minh thành công!', 'info');
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin quá trình bằng phát minh bị lỗi', 'danger'));
    };
}

export function updateQtBangPhatMinhStaffUser(id, changes, done) {
    return () => {
        const url = '/api/user/staff/qt-bang-phat-minh';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình bằng phát minh bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình bằng phát minh thành công!', 'info');
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin quá trình bằng phát minh bị lỗi', 'danger'));
    };
}

export function deleteQtBangPhatMinhStaffUser(id, done) {
    return () => {
        const url = '/api/user/staff/qt-bang-phat-minh';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình bằng phát minh bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình bằng phát minh được xóa thành công!', 'info', false, 800);
                done && done();
            }
        }, () => T.notify('Xóa thông tin quá trình bằng phát minh bị lỗi', 'danger'));
    };
}