import T from 'view/js/common';

// Actions ------------------------------------------------------------------------------------------------------------
export function getRolesList(nhomRole, done) {
    const url = '/api/list-assign-role';
    T.get(url, { nhomRole }, data => {
        if (data.error) {
            T.notify('Lấy danh sách quyền bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
            console.error(`GET: ${url}.`, data.error);
        } else {
            done && done(data.items);
        }
    }, error => console.error(`GET: ${url}.`, error));
}

export function getAssignRole(nguoiDuocGan, nhomRole, done) {
    const url = `/api/assign-role/${nguoiDuocGan}`;
    T.get(url, { nhomRole }, data => {
        if (data.error) {
            T.notify('Lấy thông tin gán quyền bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
            console.error(`GET: ${url}.`, data.error);
        } else {
            done && done(data.items);
        }
    }, error => console.error(`GET: ${url}.`, error));
}

export function createAssignRole(assignRole, done) {
    const url = `/api/assign-role?nhomRole=${assignRole.nhomRole}`;
    T.post(url, { assignRole }, data => {
        if (data.error) {
            T.notify('Tạo gán quyền bị lỗi!', 'danger');
            console.error(`POST: ${url}. ${data.error}`);
        } else {
            T.notify('Lưu thông tin gán quyền thành công!', 'success');
            done && done(data);
        }
    }, () => T.notify('Tạo gán quyền bị lỗi!', 'danger'));
}

export function updateAssignRole(id, item, done) {
    const url = `/api/assign-role?nhomRole=${item.nhomRole}`;
    T.put(url, { id, item }, data => {
        if (data.error || item == null) {
            T.notify('Cập nhật thông tin gán quyền bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
            console.error(`PUT: ${url}.`, data);
            done && done(data);
        } else {
            T.notify('Cập nhật thông tin gán quyền thành công!', 'success');
            done && done(data);
        }
    }, error => T.notify('Cập nhật thông tin gán quyền bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
}

export function deleteAssignRole(item, done) {
    return () => {
        const url = `/api/assign-role?nhomRole=${item.nhomRole}`;
        T.delete(url, { item }, data => {
            if (data.error) {
                T.notify('Xóa thông tin gán quyền bị lỗi' + (data.error.message && ('<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}`);
                done && done(data);
            } else {
                T.notify('Xóa thông tin gán quyền thành công!', 'success');
                done && done(data);
            }
        }, error => T.notify('Xóa thông tin gán quyền bị lỗi' + (error.message && ('<br>' + error.message)), 'danger')
        );
    };

}