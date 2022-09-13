// Reducer ------------------------------------------------------------------------------------------------------------
const getAll = 'FwSmsParameter:GetAll';

export default function FwSmsParameterReducer(state = null, data) {
    switch (data.type) {
        case getAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getAllSmsParameter(done) {
    return dispatch => {
        const url = '/api/sms/parameter-sms/all';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy tham số', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: getAll, items: result.items });
                done && done(result.items);
            }
        });
    };
}

export function createFwSmsParameter(data, done) {
    return dispatch => {
        const url = '/api/sms/parameter-sms';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Tạo mục đích bị lỗi', 'danger');
                console.error(`POST: ${url}.`, result.error);
            } else {
                T.notify('Tạo mới thành công!', 'success');
                dispatch(getAllSmsParameter());
                if (result) done(result);
            }
        }, () => T.notify('Tạo mục đích bị lỗi!', 'danger'));
    };
}

export function deleteFwSmsParameter(id) {
    return dispatch => {
        const url = '/api/sms/parameter-sms';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa thành công!', 'success', false, 800);
                dispatch(getAllSmsParameter());
            }
        }, () => T.notify('Xóa bị lỗi!', 'danger'));
    };
}

export function updateFwSmsParameter(id, changes, done) {
    return dispatch => {
        const url = '/api/sms/parameter-sms';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thành công!', 'success');
                dispatch(getAllSmsParameter());
                if (done) done();
            }
        }, () => T.notify('Cập nhật bị lỗi!', 'danger'));
    };
}

export function getFwSmsParameter(id, done) {
    return () => {
        const url = '/api/sms/parameter-sms';
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy tham số SMS bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_FwSmsParameter = ({
    ajax: true,
    url: '/api/sms/parameter-sms/get-list',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.id, text: item.chuThich, ten: item.ten })) : [] }),
    fetchOne: (id, done) => (getFwSmsParameter(id, item => done && done({ id: item.id, text: item.chuThich })))()
});