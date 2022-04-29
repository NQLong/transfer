import { getStaffEdit } from '../tccbCanBo/redux';

export function createToChucKhacStaff(data, done) {
    return dispatch => {
        const url = '/api/staff/to-chuc-khac';
        T.post(url, { data, shcc: data.shcc }, res => {
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
        T.put(url, { ma, changes, shcc: changes.shcc }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin tổ chức bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin tổ chức thành công!', 'success');
                dispatch(getStaffEdit(data.item.shcc));
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin tổ chức bị lỗi', 'danger'));
    };
}

export function deleteToChucKhacStaff(ma, shcc, done) {
    return dispatch => {
        const url = '/api/staff/to-chuc-khac';
        T.delete(url, { ma, shcc }, data => {
            if (data.error) {
                T.notify('Xóa thông tin tổ chức bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin tổ chức được xóa thành công!', 'success', false, 800);
                dispatch(getStaffEdit(shcc));
                if (done) done();
            }
        }, () => T.notify('Xóa thông tin tổ chức bị lỗi', 'danger'));
    };
}