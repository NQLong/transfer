import { getStaffEdit, userGetStaff } from '../tccbCanBo/redux';

export function createQtHuongDanLVStaff(data, done, isEdit = null) {
    return dispatch => {
        const url = '/api/qua-trinh/hdlv';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình hướng dẫn luận văn thành công!', 'info');
                isEdit ? (done && done()) : (done && done(res));
                isEdit && dispatch(getStaffEdit(data.shcc));
            }
        }, () => T.notify('Thêm thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger'));
    };
}

export function updateQtHuongDanLVStaff(id, changes, done, isEdit = null) {
    return dispatch => {
        const url = '/api/qua-trinh/hdlv';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình hướng dẫn luận văn thành công!', 'info');
                isEdit ? (done && done()) : (done && done(data.item));
                isEdit && dispatch(getStaffEdit(changes.shcc));
            }
        }, () => T.notify('Cập nhật thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger'));
    };
}

export function deleteQtHuongDanLVStaff(id, isEdit, shcc = null) {
    return dispatch => {
        const url = '/api/qua-trinh/hdlv';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình hướng dẫn luận văn được xóa thành công!', 'info', false, 800);
                isEdit && dispatch(getStaffEdit(shcc));
            }
        }, () => T.notify('Xóa thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger'));
    };
}

export function createQtHuongDanLVStaffUser(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/hdlv';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình hướng dẫn luận văn thành công!', 'info');
                if (done) done(res);
                dispatch(userGetStaff(data.email));
            }
        }, () => T.notify('Thêm thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger'));
    };
}

export function updateQtHuongDanLVStaffUser(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/hdlv';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình hướng dẫn luận văn thành công!', 'info');
                if (done) done();
                dispatch(userGetStaff(changes.email));
            }
        }, () => T.notify('Cập nhật thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger'));
    };
}

export function deleteQtHuongDanLVStaffUser(id, email, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/hdlv';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình hướng dẫn luận văn được xóa thành công!', 'info', false, 800);
                done && done();
                dispatch(userGetStaff(email));
            }
        }, () => T.notify('Xóa thông tin quá trình hướng dẫn luận văn bị lỗi', 'danger'));
    };
}