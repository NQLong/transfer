import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtDmThuAll = 'DtDmThu:GetAll';

export default function DtDmThuReducer(state = null, data) {
    switch (data.type) {
        case DtDmThuAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getDtDmThuAll(done) {
    return dispatch => {
        const url = '/api/dao-tao/thu/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: DtDmThuAll, items: data.items });
                if (done) done(data);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDtDmThu(item, done) {
    return dispatch => {
        const url = '/api/dao-tao/thu';
        T.post(url, { data: item }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo thứ bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
                if (done) done(data.error);
            } else {
                T.notify('Tạo mới thông tin thứ thành công!', 'success');
                dispatch(getDtDmThuAll());
                done && done();
            }
        }, () => T.notify('Tạo thứ bị lỗi!', 'danger'));
    };
}

export function deleteDtDmThu(ma) {
    return dispatch => {
        const url = '/api/dao-tao/thu';
        T.delete(url, { ma: ma }, data => {
            if (data.error) {
                T.notify('Xóa thứ bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Đã xóa thứ thành công!', 'success', false, 800);
                dispatch(getDtDmThuAll());
            }
        }, () => T.notify('Xóa thứ bị lỗi!', 'danger'));
    };
}

export function updateDtDmThu(ma, changes, done) {
    return dispatch => {
        const url = '/api/dao-tao/thu';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật thông tin thứ bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin thứ thành công!', 'success');
                dispatch(getDtDmThuAll());
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin thứ bị lỗi!', 'danger'));
    };
}

