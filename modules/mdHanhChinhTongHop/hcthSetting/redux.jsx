import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const HcthSettingAll = 'HcthSettingAll';
const HcthSettingUpdate = 'HcthSettingUpdate';

export default function HcthSettingReducer(state = null, data) {
    switch (data.type) {
        case HcthSettingAll:
            return Object.assign({}, state, { items: data.items });

        case HcthSettingUpdate:
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
export function getHcthSettingAll(done) {
    return dispatch => {
        const url = '/api/hcth/setting/all';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy thống tin cấu hình bị lỗi', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: HcthSettingAll, items: result.items });
                done && done(result.items);
            }
        }, () => T.notify('Lấy thông tin cấu hình bị lỗi!', 'danger'));
    };
}

export function getHcthSetting(key, done) {
    return dispatch => {
        const url = '/api/hcth/setting';
        T.get(url, { key }, result => {
            if (result.error) {
                T.notify('Lấy thống tin cấu hình bị lỗi', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: HcthSettingUpdate, item: result.item });
                done && done(result.item);
            }
        }, () => T.notify('Lấy thông tin cấu hình bị lỗi!', 'danger'));
    };
}

export function updateHcthSetting(changes, done) {
    return dispatch => {
        const url = '/api/hcth/setting';
        T.put(url, { changes }, result => {
            if (result.error) {
                T.notify('Cập nhật thống tin cấu hình bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${result.error}`);
                done && done(result.error);
            } else {
                T.notify('Cập nhật thông tin cấu hình thành công!', 'success');
                dispatch({ type: HcthSettingUpdate, item: result.item });
                done && done(result.item);
            }
        }, () => T.notify('Cập nhật thông tin cấu hình bị lỗi!', 'danger'));
    };
}

export function deleteHcthSetting(key, done) {
    return dispatch => {
        const url = '/api/hcth/setting';
        T.delete(url, { key }, result => {
            if (result.error) {
                T.notify('Xóa thống tin cấu hình bị lỗi!', 'danger');
                console.error(`DELETE ${url}. ${result.error}`);
                done && done(result.error);
            } else {
                T.notify('Xóa thông tin cấu hình thành công!', 'success');
                dispatch(getHcthSettingAll());
                done && done();
            }
        }, () => T.notify('Xóa thông tin cấu hình bị lỗi!', 'danger'));
    };
}