import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TcSettingAll = 'TcSettingAll';
const TcSettingUpdate = 'TcSettingUpdate';

export default function TcSettingReducer(state = null, data) {
    switch (data.type) {
        case TcSettingAll:
            return Object.assign({}, state, { items: data.items });

        case TcSettingUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].mssv == updatedItem.mssv) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                return Object.assign({}, state, { items: updatedItems });
            } else {
                return null;
            }

        default:
            return state;
    }
}

// Actions ----------------------------------------------------------------------------------------------------
export function getTcSettingAll(done) {
    return dispatch => {
        const url = '/api/finance/setting/all';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy thống tin cấu hình bị lỗi', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: TcSettingAll, items: result.items });
                done && done(result.items);
            }
        }, () => T.notify('Lấy thông tin cấu hình bị lỗi!', 'danger'));
    };
}

export function getTcSetting(key, done) {
    return dispatch => {
        const url = '/api/finance/setting';
        T.get(url, { key }, result => {
            if (result.error) {
                T.notify('Lấy thống tin cấu hình bị lỗi', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: TcSettingUpdate, item: result.item });
                done && done(result.item);
            }
        }, () => T.notify('Lấy thông tin cấu hình bị lỗi!', 'danger'));
    };
}

export function updateTcSetting(changes, done) {
    return dispatch => {
        const url = '/api/finance/setting';
        T.put(url, { changes }, result => {
            if (result.error) {
                T.notify('Cập nhật thống tin cấu hình bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${result.error}`);
                done && done(result.error);
            } else {
                T.notify('Cập nhật thông tin cấu hình thành công!', 'success');
                dispatch({ type: TcSettingUpdate, item: result.item });
                done && done(result.item);
            }
        }, () => T.notify('Cập nhật thông tin cấu hình bị lỗi!', 'danger'));
    };
}

export function deleteTcSetting(key, done) {
    return dispatch => {
        const url = '/api/finance/setting';
        T.delete(url, { key }, result => {
            if (result.error) {
                T.notify('Xóa thống tin cấu hình bị lỗi!', 'danger');
                console.error(`DELETE ${url}. ${result.error}`);
                done && done(result.error);
            } else {
                T.notify('Xóa thông tin cấu hình thành công!', 'success');
                dispatch(getTcSettingAll());
                done && done();
            }
        }, () => T.notify('Xóa thông tin cấu hình bị lỗi!', 'danger'));
    };
}