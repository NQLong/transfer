import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtChuanDauRaAll = 'DtChuanDauRa:GetAll';

export default function DtChuanDauRaReducer(state = null, data) {
    switch (data.type) {
        case DtChuanDauRaAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getDtChuanDauRaAll(done) {
    return dispatch => {
        const url = '/api/dao-tao/chuan-dau-ra/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: DtChuanDauRaAll, items: data.items });
                if (done) done(data);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDtChuanDauRa(item, done) {
    return dispatch => {
        const url = '/api/dao-tao/chuan-dau-ra';
        T.post(url, { data: item }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo chuẩn đầu ra bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
                if (done) done(data.error);
            } else {
                T.notify('Tạo mới thông tin chuẩn đầu ra thành công!', 'success');
                dispatch(getDtChuanDauRaAll());
                done && done();
            }
        }, () => T.notify('Tạo chuẩn đầu ra bị lỗi!', 'danger'));
    };
}

export function deleteDtChuanDauRa(id) {
    return dispatch => {
        const url = '/api/dao-tao/chuan-dau-ra';
        T.delete(url, { id: id }, data => {
            if (data.error) {
                T.notify('Xóa chuẩn đầu ra bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Đã xóa chuẩn đầu ra thành công!', 'success', false, 800);
                dispatch(getDtChuanDauRaAll());
            }
        }, () => T.notify('Xóa chuẩn đầu ra bị lỗi!', 'danger'));
    };
}

export function updateDtChuanDauRa(id, changes, done) {
    return dispatch => {
        const url = '/api/dao-tao/chuan-dau-ra';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật thông tin chuẩn đầu ra bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin chuẩn đầu ra thành công!', 'success');
                dispatch(getDtChuanDauRaAll());
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin chuẩn đầu ra bị lỗi!', 'danger'));
    };
}

