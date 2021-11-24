export function createQtHuongDanLVStaff(data, done) {
    return () => {
        const url = '/api/qua-trinh/hdlv';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình hướng dẫn luận văn thành công!', 'info');
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger'));
    };
}

export function updateQtHuongDanLVStaff(id, changes, done) {
    return () => {
        const url = '/api/qua-trinh/hdlv';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình hướng dẫn luận văn thành công!', 'info');
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger'));
    };
}

export function deleteQtHuongDanLVStaff(id, done) {
    return () => {
        const url = '/api/qua-trinh/hdlv';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình hướng dẫn luận văn được xóa thành công!', 'info', false, 800);
                if (done) done();
            }
        }, () => T.notify('Xóa thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger'));
    };
}

export function createQtHuongDanLVStaffUser(data, done) {
    return () => {
        const url = '/api/user/qua-trinh/hdlv';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình hướng dẫn luận văn thành công!', 'info');
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger'));
    };
}

export function updateQtHuongDanLVStaffUser(id, changes, done) {
    return () => {
        const url = '/api/user/qua-trinh/hdlv';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình hướng dẫn luận văn thành công!', 'info');
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger'));
    };
}

export function deleteQtHuongDanLVStaffUser(id, done) {
    return () => {
        const url = '/api/user/qua-trinh/hdlv';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình hướng dẫn luận văn được xóa thành công!', 'info', false, 800);
                done && done();
            }
        }, () => T.notify('Xóa thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger'));
    };
}