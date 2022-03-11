import { getStaffEdit, userGetStaff } from '../tccbCanBo/redux';

export function createToChucKhacStaff(data, done) {
    return dispatch => {
        const url = '/api/staff/to-chuc-khac';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin tổ chức bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin tổ chức thành công!', 'info');
                if (done) done();
                dispatch(getStaffEdit(res.item.shcc));
            }
        }, () => T.notify('Thêm thông tin tổ chức bị lỗi', 'danger'));
    };
}

export function updateToChucKhacStaff(ma, changes, done) {
    return dispatch => {
        const url = '/api/staff/to-chuc-khac';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin tổ chức bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin tổ chức thành công!', 'info');
                if (done) done();
                dispatch(getStaffEdit(data.item.shcc));
            }
        }, () => T.notify('Cập nhật thông tin tổ chức bị lỗi', 'danger'));
    };
}

export function deleteToChucKhacStaff(ma, done) {
    return () => {
        const url = '/api/staff/to-chuc-khac';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa thông tin tổ chức bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin tổ chức được xóa thành công!', 'info', false, 800);
                if (done) done();
            }
        }, () => T.notify('Xóa thông tin tổ chức bị lỗi', 'danger'));
    };
}

export function createToChucKhacStaffUser(data, done) {
    return dispatch => {
        const url = '/api/user/staff/to-chuc-khac';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin tổ chức bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin tổ chức thành công!', 'info');
                dispatch(userGetStaff(data.email));
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin tổ chức bị lỗi', 'danger'));
    };
}

export function updateToChucKhacStaffUser(ma, changes, done) {
    return dispatch => {
        const url = '/api/user/staff/to-chuc-khac';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin tổ chức bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin tổ chức thành công!', 'info');
                dispatch(userGetStaff(changes.email));
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin tổ chức bị lỗi', 'danger'));
    };
}

export function deleteToChucKhacStaffUser(ma, done) {
    return () => {
        const url = '/api/user/staff/to-chuc-khac';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa thông tin tổ chức bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin tổ chức được xóa thành công!', 'info', false, 800);
                done && done();
            }
        }, () => T.notify('Xóa thông tin tổ chức bị lỗi', 'danger'));
    };
}