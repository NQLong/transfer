import T from 'view/js/common';

const SubMenuGetAll = 'SubMenu:GetAll';
export default function subMenuReducer(state = null, data) {
    switch (data.type) {
        case SubMenuGetAll:
            return data.items;
        default:
            return state;
    }
}

export function getAllSubMenu(done) {
    return dispatch => {
        const url = '/api/submenu/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy menu phụ bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data.items);
                dispatch({ type: SubMenuGetAll, items: data.items });
            }
        }, () => T.notify('Lấy menu phụ bị lỗi!', 'danger'));
    };
}

export function createSubMenu(submenu, done) {
    return () => {
        const url = '/api/submenu';
        T.post(url, { submenu }, data => {
            if (data.error) {
                T.notify('Tạo menu phụ bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                //dispatch(getAllSubMenu());
                done && done(data);
            }
        }, () => T.notify('Tạo menu phụ bị lỗi!', 'danger'));
    };
}

export function updateSubMenu(id, changes, done) {
    return dispatch => {
        const url = '/api/submenu';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật menu phụ bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật menu phụ thành công!', 'success');
                dispatch(getAllSubMenu());
                done && done();
            }
        }, () => T.notify('Cập nhật menu phụ bị lỗi!', 'danger'));
    };
}

export function deleteSubMenu(id) {
    return dispatch => {
        const url = '/api/submenu';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa menu phụ bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Xóa menu phụ thành công!', 'error', false, 800);
                dispatch(getAllSubMenu());
            }
        }, () => T.notify('Xóa menu phụ bị lỗi!', 'danger'));
    };
}

export function swapSubMenu(id, priority, done) {
    return dispatch => {
        const url = '/api/submenu/swap';
        T.put(url, { id, priority }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự việc làm bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Thay đổi thứ tự việc làm thành công!', 'success');
                dispatch(getAllSubMenu());
            }
            done && done();
        }, () => T.notify('Thay đổi thứ tự việc làm bị lỗi!', 'danger'));
    };
}