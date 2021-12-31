import { getStaffEdit } from '../tccbCanBo/redux';

export function createTrinhDoNNStaff(data, done) {
    return dispatch => {
        const url = '/api/staff/trinh-do-nn';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin trình độ ngoại ngữ bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin trình độ ngoại ngữ thành công!', 'info');
                if (done) done();
                dispatch(getStaffEdit(res.item.shcc));
            }
        }, () => T.notify('Thêm thông tin trình độ ngoại ngữ bị lỗi', 'danger'));
    };
}

export function updateTrinhDoNNStaff(id, changes, done) {
    return dispatch => {
        const url = '/api/staff/trinh-do-nn';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin trình độ ngoại ngữ bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin trình độ ngoại ngữ thành công!', 'info');
                if (done) done();
                dispatch(getStaffEdit(data.item.shcc));
            }
        }, () => T.notify('Cập nhật thông tin trình độ ngoại ngữ bị lỗi', 'danger'));
    };
}

export function deleteTrinhDoNNStaff(id, done) {
    return () => {
        const url = '/api/staff/trinh-do-nn';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin trình độ ngoại ngữ bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin trình độ ngoại ngữ được xóa thành công!', 'info', false, 800);
                if (done) done();
            }
        }, () => T.notify('Xóa thông tin trình độ ngoại ngữ bị lỗi', 'danger'));
    };
}

export function createTrinhDoNNStaffUser(data, done) {
    return () => {
        const url = '/api/user/staff/trinh-do-nn';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin trình độ ngoại ngữ bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin trình độ ngoại ngữ thành công!', 'info');
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin trình độ ngoại ngữ bị lỗi', 'danger'));
    };
}

export function updateTrinhDoNNStaffUser(id, changes, done) {
    return () => {
        const url = '/api/user/staff/trinh-do-nn';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin trình độ ngoại ngữ bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin trình độ ngoại ngữ thành công!', 'info');
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin trình độ ngoại ngữ bị lỗi', 'danger'));
    };
}

export function deleteTrinhDoNNStaffUser(id, done) {
    return () => {
        const url = '/api/user/staff/trinh-do-nn';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin trình độ ngoại ngữ bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin trình độ ngoại ngữ được xóa thành công!', 'info', false, 800);
                done && done();
            }
        }, () => T.notify('Xóa thông tin trình độ ngoại ngữ bị lỗi', 'danger'));
    };
}