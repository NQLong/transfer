import { getStaffEdit } from './redux';

export function createQuanHeCanBo(data, shcc, done) {
    return dispatch => {
        const url = '/api/staff/quan-he';
        T.post(url, { data, shcc }, res => {
            if (res.error) {
                T.notify('Thêm thông tin người thân bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin người thân thành công!', 'success');
                if (done) done(res.item);
                dispatch(getStaffEdit(res.item.shcc));
            }
        }, () => T.notify('Thêm thông tin người thân bị lỗi', 'danger'));
    };
}

export function updateQuanHeCanBo(id, changes, shcc, done) {
    return dispatch => {
        const url = '/api/staff/quan-he';
        T.put(url, { id, changes, shcc }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin người thân bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin người thân thành công!', 'success');
                done && done();
                dispatch(getStaffEdit(data.item.shcc));
            }
        }, () => T.notify('Cập nhật thông tin người thân bị lỗi', 'danger'));
    };
}

export function deleteQuanHeCanBo(id, shcc) {
    return dispatch => {
        const url = '/api/staff/quan-he';
        T.delete(url, { id, shcc }, data => {
            if (data.error) {
                T.notify('Xóa thông tin người thân bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin người thân được xóa thành công!', 'success', false, 800);
                dispatch(getStaffEdit(shcc));
            }
        }, () => T.notify('Xóa thông tin người thân bị lỗi', 'danger'));
    };
}
//#endregion quanHeCanBo