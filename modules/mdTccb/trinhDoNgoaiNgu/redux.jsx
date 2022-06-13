import { getStaffEdit } from '../tccbCanBo/redux';

export function createTrinhDoNNStaff(data, done) {
    return dispatch => {
        const url = '/api/staff/trinh-do-nn';
        T.post(url, { data, shcc: data.shcc }, res => {
            if (res.error) {
                T.notify('Thêm thông tin trình độ ngoại ngữ bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin trình độ ngoại ngữ thành công!', 'success');
                if (done) done();
                dispatch(getStaffEdit(res.item.shcc));
            }
        }, () => T.notify('Thêm thông tin trình độ ngoại ngữ bị lỗi', 'danger'));
    };
}

export function updateTrinhDoNNStaff(id, changes, done) {
    return dispatch => {
        const url = '/api/staff/trinh-do-nn';
        T.put(url, { id, changes, shcc: changes.shcc }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin trình độ ngoại ngữ bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin trình độ ngoại ngữ thành công!', 'success');
                if (done) done();
                dispatch(getStaffEdit(data.item.shcc));
            }
        }, () => T.notify('Cập nhật thông tin trình độ ngoại ngữ bị lỗi', 'danger'));
    };
}

export function deleteTrinhDoNNStaff(id, shcc, done) {
    return dispatch => {
        const url = '/api/staff/trinh-do-nn';
        T.delete(url, { id, shcc }, data => {
            if (data.error) {
                T.notify('Xóa thông tin trình độ ngoại ngữ bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin trình độ ngoại ngữ được xóa thành công!', 'success', false, 800);
                dispatch(getStaffEdit(shcc));
                if (done) done();
            }
        }, () => T.notify('Xóa thông tin trình độ ngoại ngữ bị lỗi', 'danger'));
    };
}