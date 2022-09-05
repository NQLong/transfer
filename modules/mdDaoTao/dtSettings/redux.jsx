// Reducer ------------------------------------------------------------------------------------------------------------
const DtSettingsKey = 'DtSettingsKey';
const DtTkbConfig = 'DtTkbConfig';

export default function DtSettingsReducer(state = null, data) {
    switch (data.type) {
        case DtSettingsKey:
            return Object.assign({}, state, { dtSettings: data.items });
        case DtTkbConfig:
            return Object.assign({}, state, data.items);
        default:
            return state;
    }
}

export function getAllDtSettings(done) {
    return () => {
        const url = '/api/dao-tao/settings/all';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy thống tin cấu hình bị lỗi', 'danger');
                console.error(result.error);
            } else {
                done && done(result.items);
            }
        }, () => T.notify('Lấy thông tin cấu hình bị lỗi!', 'danger'));
    };
}

export function getDtSettingsKeys(keys, done) {
    return dispatch => {
        const url = '/api/dao-tao/settings/keys';
        T.get(url, { keys }, result => {
            if (result.error) {
                T.notify('Lấy thống tin cấu hình bị lỗi', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: DtSettingsKey, items: result.items });
                done && done(result.items);
            }
        }, () => T.notify('Lấy thông tin cấu hình bị lỗi!', 'danger'));
    };
}

export function getScheduleSettings(done) {
    return dispatch => {
        const url = '/api/dao-tao/settings/schedule-settings';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy cấu hình thời khoá biểu bị lỗi', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: DtTkbConfig, items: result.items });
                done && done(result.items);
            }
        });
    };
}

export function updateDtSettingsKeys(changes, done) {
    return () => {
        const url = '/api/dao-tao/settings';
        T.put(url, { changes }, result => {
            if (result.error) {
                T.notify('Cập nhật cấu hình bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật cấu hình thành công', 'success');
                done && done();
            }
        }, () => T.notify('Lấy thông tin cấu hình bị lỗi!', 'danger'));
    };
}