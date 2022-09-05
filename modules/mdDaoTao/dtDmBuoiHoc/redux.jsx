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
                T.notify(data.error.message || 'Tạo buổi học bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
                if (done) done(data.error);
            } else {
                T.notify('Tạo mới thông tin buổi học thành công!', 'success');
                dispatch(getDtDmBuoiHocAll());
                done && done();
            }
        }, () => T.notify('Tạo buổi học bị lỗi!', 'danger'));
    };
}

export function deleteDtDmBuoiHoc(id) {
    return dispatch => {
        const url = '/api/dao-tao/buoi-hoc';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa buổi học bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Đã xóa buổi học thành công!', 'success', false, 800);
                dispatch(getDtDmBuoiHocAll());
            }
        }, () => T.notify('Xóa buổi học bị lỗi!', 'danger'));
    };
}

export function updateDtDmBuoiHoc(id, changes, done) {
    return dispatch => {
        const url = '/api/dao-tao/buoi-hoc';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật thông tin buổi học bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin buổi học thành công!', 'success');
                dispatch(getDtDmBuoiHocAll());
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin buổi học bị lỗi!', 'danger'));
    };
}

export function getItemDtDmBuoiHoc(id, done) {
    return () => {
        const url = `/api/dao-tao/buoi-hoc/item/${id}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy buổi học', 'danger');
                console.error(result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}
export const SelectAdapter_DtDmBuoiHoc = {
    ajax: true,
    url: '/api/dao-tao/buoi-hoc/all',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.id, text: item.ten })) : [] }),
    fetchOne: (id, done) => (getItemDtDmBuoiHoc(id, item => item && done && done({ id: item.id, text: item.ten })))(),
};

