import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtDmBuoiHocAll = 'DtDmBuoiHoc:GetAll';

export default function DtDmBuoiHocReducer(state = null, data) {
    switch (data.type) {
        case DtDmBuoiHocAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getDtDmBuoiHocAll(done) {
    return dispatch => {
        const url = '/api/dao-tao/buoi-hoc/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: DtDmBuoiHocAll, items: data.items });
                if (done) done(data);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDtDmBuoiHoc(item, done) {
    return dispatch => {
        const url = '/api/dao-tao/buoi-hoc';
        T.post(url, { data: item }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo Buổi Học bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
                if (done) done(data.error);
            } else {
                T.notify('Tạo mới thông tin Buổi Học thành công!', 'success');
                dispatch(getDtDmBuoiHocAll());
                done && done();
            }
        }, () => T.notify('Tạo Buổi Học bị lỗi!', 'danger'));
    };
}

export function deleteDtDmBuoiHoc(id) {
    return dispatch => {
        const url = '/api/dao-tao/buoi-hoc';
        T.delete(url, { id: id }, data => {
            if (data.error) {
                T.notify('Xóa Buổi Học bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Đã xóa Buổi Học thành công!', 'success', false, 800);
                dispatch(getDtDmBuoiHocAll());
            }
        }, () => T.notify('Xóa Buổi Học bị lỗi!', 'danger'));
    };
}

export function updateDtDmBuoiHoc(id, changes, done) {
    return dispatch => {
        const url = '/api/dao-tao/buoi-hoc';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật thông tin Buổi Học bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin Buổi Học thành công!', 'success');
                dispatch(getDtDmBuoiHocAll());
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin Buổi Học bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_DtDmBuoiHoc = {
    ajax: true,
    url: '/api/dao-tao/buoi-hoc/all',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (id, done) => (getDtDmBuoiHocAll(id, item => item && done && done({ id: item.id, text: item.ten })))(),
};

