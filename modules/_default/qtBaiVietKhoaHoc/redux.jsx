export function createQtBaiVietKhoaHocStaff(data, done) {
    return () => {
        const url = '/api/staff/qt-bai-viet-khoa-hoc';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình bài viết khoa học bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình bài viết khoa học thành công!', 'info');
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin quá trình bài viết khoa học bị lỗi', 'danger'));
    };
}

export function updateQtBaiVietKhoaHocStaff(id, changes, done) {
    return () => {
        const url = '/api/staff/qt-bai-viet-khoa-hoc';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình bài viết khoa học bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình bài viết khoa học thành công!', 'info');
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin quá trình bài viết khoa học bị lỗi', 'danger'));
    };
}

export function deleteQtBaiVietKhoaHocStaff(id, done) {
    return () => {
        const url = '/api/staff/qt-bai-viet-khoa-hoc';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình bài viết khoa học bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình bài viết khoa học được xóa thành công!', 'info', false, 800);
                if (done) done();
            }
        }, () => T.notify('Xóa thông tin quá trình bài viết khoa học bị lỗi', 'danger'));
    };
}

export function createQtBaiVietKhoaHocStaffUser(data, done) {
    return () => {
        const url = '/api/user/staff/qt-bai-viet-khoa-hoc';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình bài viết khoa học bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình bài viết khoa học thành công!', 'info');
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin quá trình bài viết khoa học bị lỗi', 'danger'));
    };
}

export function updateQtBaiVietKhoaHocStaffUser(id, changes, done) {
    return () => {
        const url = '/api/user/staff/qt-bai-viet-khoa-hoc';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình bài viết khoa học bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình bài viết khoa học thành công!', 'info');
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin quá trình bài viết khoa học bị lỗi', 'danger'));
    };
}

export function deleteQtBaiVietKhoaHocStaffUser(id, done) {
    return () => {
        const url = '/api/user/staff/qt-bai-viet-khoa-hoc';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình bài viết khoa học bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình bài viết khoa học được xóa thành công!', 'info', false, 800);
                done && done();
            }
        }, () => T.notify('Xóa thông tin quá trình bài viết khoa học bị lỗi', 'danger'));
    };
}