import { getStaffEdit, userGetStaff } from '../tccbCanBo/redux';

export function createQtNckhStaff(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nckh';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin nghiên cứu khoa học bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin nghiên cứu khoa học thành công!', 'info');
                dispatch(getStaffEdit(data.shcc));
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin nghiên cứu khoa học bị lỗi', 'danger'));
    };
}

export function updateQtNckhStaff(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nckh';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin nghiên cứu khoa học bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin nghiên cứu khoa học thành công!', 'info');
                dispatch(getStaffEdit(changes.shcc));
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin nghiên cứu khoa học bị lỗi', 'danger'));
    };
}

export function deleteQtNckhStaff(id, shcc, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nckh';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin nghiên cứu khoa học bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin nghiên cứu khoa học được xóa thành công!', 'info', false, 800);
                if (done) done();
                dispatch(getStaffEdit(shcc));
            }
        }, () => T.notify('Xóa thông tin nghiên cứu khoa học bị lỗi', 'danger'));
    };
}

export function createQtNckhStaffUser(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nckh';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin nghiên cứu khoa học bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin nghiên cứu khoa học thành công!', 'info');
                if (done) done(res);
                dispatch(userGetStaff(data.email));

            }
        }, () => T.notify('Thêm thông tin nghiên cứu khoa học bị lỗi', 'danger'));
    };
}

export function updateQtNckhStaffUser(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nckh';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin nghiên cứu khoa học bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin nghiên cứu khoa học thành công!', 'info');
                dispatch(userGetStaff(changes.email));
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin nghiên cứu khoa học bị lỗi', 'danger'));
    };
}

export function deleteQtNckhStaffUser(id, email, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nckh';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin nghiên cứu khoa học bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin nghiên cứu khoa học được xóa thành công!', 'info', false, 800);
                done && done();
                dispatch(userGetStaff(email));
            }
        }, () => T.notify('Xóa thông tin nghiên cứu khoa học bị lỗi', 'danger'));
    };
}