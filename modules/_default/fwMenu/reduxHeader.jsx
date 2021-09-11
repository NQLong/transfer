const HeaderGet = 'Header:Get';
export default function headerReducer(state = null, data) {
    switch (data.type) {
        case HeaderGet:
            return data.item;
        default:
            return state;
    }
}

// Actions -------------------------------------------------------------------------------------------------------------

export function getHeader(done) {
    return dispatch => {
        const url = '/api/header';
        T.get(url, data => {
            if (data.result) {
                dispatch({ type: HeaderGet, item: data.result });
                done && done(data.result);
            }
            else
                T.notify('Lấy header bị lỗi!', 'danger');
        }, () => T.notify('Lấy header bị lỗi!', 'danger'));
    };
}

export function updateHeader(changes, done) {
    return dispatch => {
        const url = '/api/header';
        T.put(url, { changes }, data => {
            if (data.error) {
                T.notify('Cập nhật header bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else {
                dispatch(getHeader());
                T.notify('Cập nhật header thành công', 'success');
                if (done) done(data);
            }
        }, () => T.notify('Cập nhật header bị lỗi!', 'danger'));
    };
}