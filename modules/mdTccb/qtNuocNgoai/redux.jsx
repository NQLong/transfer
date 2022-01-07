import { getStaffEdit, userGetStaff } from '../tccbCanBo/redux';
export function createQtNuocNgoaiStaff(data, done, isStaffEdit = null) {
    return dispatch => {
        const url = '/api/qua-trinh/nuoc-ngoai';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình đi nước ngoài bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình đi nước ngoài thành công!', 'info');
                isStaffEdit && dispatch(getStaffEdit(data.shcc));
                isStaffEdit ? (done && done()) : (done && done(data));
            }
        }, () => T.notify('Thêm thông tin quá trình đi nước ngoài bị lỗi', 'danger'));
    };
}

export function updateQtNuocNgoaiStaff(id, changes, done, isStaffEdit = null) {
    return dispatch => {
        const url = '/api/qua-trinh/nuoc-ngoai';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình đi nước ngoài bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình đi nước ngoài thành công!', 'info');
                isStaffEdit ? (done && done()) : (done && done(data.item));
                isStaffEdit && dispatch(getStaffEdit(data.item.shcc));
            }
        }, () => T.notify('Cập nhật thông tin quá trình đi nước ngoài bị lỗi', 'danger'));
    };
}

export function deleteQtNuocNgoaiStaff(id, isStaffEdit, shcc = null) {
    return dispatch => {
        const url = '/api/qua-trinh/nuoc-ngoai';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình đi nước ngoài bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình đi nước ngoài được xóa thành công!', 'info', false, 800);
                isStaffEdit && dispatch(getStaffEdit(shcc));
            }
        }, () => T.notify('Xóa thông tin quá trình đi nước ngoài bị lỗi', 'danger'));
    };
}

export function createQtNuocNgoaiStaffUser(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nuoc-ngoai';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình đi nước ngoài bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình đi nước ngoài thành công!', 'info');
                if (done) done(data);
                dispatch(userGetStaff(data.email));
            }
        }, () => T.notify('Thêm thông tin quá trình đi nước ngoài bị lỗi', 'danger'));
    };
}

export function updateQtNuocNgoaiStaffUser(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nuoc-ngoai';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình đi nước ngoài bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình đi nước ngoài thành công!', 'info');
                if (done) done();
                dispatch(userGetStaff(changes.email));
            }
        }, () => T.notify('Cập nhật thông tin quá trình đi nước ngoài bị lỗi', 'danger'));
    };
}

export function deleteQtNuocNgoaiStaffUser(id, email, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nuoc-ngoai';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình đi nước ngoài bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình đi nước ngoài được xóa thành công!', 'info', false, 800);
                done && done();
                dispatch(userGetStaff(email));
            }
        }, () => T.notify('Xóa thông tin quá trình đi nước ngoài bị lỗi', 'danger'));
    };
}