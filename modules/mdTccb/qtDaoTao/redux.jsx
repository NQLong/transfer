export function createQtDaoTaoStaff(data, done) {
    return () => {
        const url = '/api/qua-trinh/dao-tao';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình đào tạo bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình đào tạo thành công!', 'info');
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin quá trình đào tạo bị lỗi', 'danger'));
    };
}

export function updateQtDaoTaoStaff(id, changes, done) {
    return () => {
        const url = '/api/qua-trinh/dao-tao';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình đào tạo bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình đào tạo thành công!', 'info');
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin quá trình đào tạo bị lỗi', 'danger'));
    };
}

export function deleteQtDaoTaoStaff(id, done) {
    return () => {
        const url = '/api/qua-trinh/dao-tao';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình đào tạo bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình đào tạo được xóa thành công!', 'info', false, 800);
                if (done) done();
            }
        }, () => T.notify('Xóa thông tin quá trình đào tạo bị lỗi', 'danger'));
    };
}

export function createQtDaoTaoStaffUser(data, done) {
    return () => {
        const url = '/api/user/qua-trinh/dao-tao';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình đào tạo bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình đào tạo thành công!', 'info');
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin quá trình đào tạo bị lỗi', 'danger'));
    };
}

export function updateQtDaoTaoStaffUser(id, changes, done) {
    return () => {
        const url = '/api/user/qua-trinh/dao-tao';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình đào tạo bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình đào tạo thành công!', 'info');
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin quá trình đào tạo bị lỗi', 'danger'));
    };
}

export function deleteQtDaoTaoStaffUser(id, done) {
    return () => {
        const url = '/api/user/qua-trinh/dao-tao';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình đào tạo bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình đào tạo được xóa thành công!', 'info', false, 800);
                done && done();
            }
        }, () => T.notify('Xóa thông tin quá trình đào tạo bị lỗi', 'danger'));
    };
}