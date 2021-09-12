export function createQtGiaiThuongStaff(data, done) {
    return () => {
        const url = '/api/staff/qt-giai-thuong';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình giải thưởng bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình giải thưởng thành công!', 'info');
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin quá trình giải thưởng bị lỗi', 'danger'));
    };
}

export function updateQtGiaiThuongStaff(id, changes, done) {
    return () => {
        const url = '/api/staff/qt-giai-thuong';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình giải thưởng bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình giải thưởng thành công!', 'info');
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin quá trình giải thưởng bị lỗi', 'danger'));
    };
}

export function deleteQtGiaiThuongStaff(id, done) {
    return () => {
        const url = '/api/staff/qt-giai-thuong';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình giải thưởng bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình giải thưởng được xóa thành công!', 'info', false, 800);
                if (done) done();
            }
        }, () => T.notify('Xóa thông tin quá trình giải thưởng bị lỗi', 'danger'));
    };
}

export function createQtGiaiThuongStaffUser(data, done) {
    return () => {
        const url = '/api/user/staff/qt-giai-thuong';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình giải thưởng bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình giải thưởng thành công!', 'info');
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin quá trình giải thưởng bị lỗi', 'danger'));
    };
}

export function updateQtGiaiThuongStaffUser(id, changes, done) {
    return () => {
        const url = '/api/user/staff/qt-giai-thuong';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình giải thưởng bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình giải thưởng thành công!', 'info');
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin quá trình giải thưởng bị lỗi', 'danger'));
    };
}

export function deleteQtGiaiThuongStaffUser(id, done) {
    return () => {
        const url = '/api/user/staff/qt-giai-thuong';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình giải thưởng bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình giải thưởng được xóa thành công!', 'info', false, 800);
                done && done();
            }
        }, () => T.notify('Xóa thông tin quá trình giải thưởng bị lỗi', 'danger'));
    };
}