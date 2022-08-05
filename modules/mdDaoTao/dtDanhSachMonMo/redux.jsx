// import { saveDangKyMoMon } from '../dtDangKyMoMon/redux';

// Reducer ------------------------------------------------------------------------------------------------------------
const dtDanhSachMonMoGetCurrent = 'dtDanhSachMoMon:GetCurrent';
const dtDanhSachMonMoCreate = 'dtDanhSachMoMon:Create';
const dtDanhSachMonMoDelete = 'dtDanhSachMoMon:Delete';

export default function dashboardTccbReducer(state = null, data) {
    switch (data.type) {
        case dtDanhSachMonMoGetCurrent:
            {
                let { chuongTrinhDaoTao, danhSachMonMo, thoiGianMoMon, thongTinKhoaNganh } = data.data;
                return Object.assign({}, state, { chuongTrinhDaoTao, danhSachMonMo, thoiGianMoMon, thongTinKhoaNganh });
            }
        case dtDanhSachMonMoCreate:
            if (state) {
                let danhSachMonMoCurrent = state.danhSachMonMo,
                    createdMon = data.item;
                danhSachMonMoCurrent && createdMon.id && danhSachMonMoCurrent.unshift(createdMon);
                return Object.assign({}, state, { danhSachMonMo: danhSachMonMoCurrent });
            } else {
                return null;
            }
        case dtDanhSachMonMoDelete:
            if (state) {
                let danhSachMonMoCurrent = state.danhSachMonMo,
                    deletedItem = data.item;
                if (danhSachMonMoCurrent && deletedItem.id) danhSachMonMoCurrent = danhSachMonMoCurrent.filter(item => item.id != deletedItem.id);
                return Object.assign({}, state, { danhSachMonMo: danhSachMonMoCurrent });
            } else return null;
        default:
            return state;
    }
}

export function getDtDanhSachMonMoCurrent(id, done) {
    return dispatch => {
        const url = '/api/dao-tao/danh-sach-mon-mo/current';
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify(`Lỗi: ${data.error.message}`, 'danger');
                console.error(data.error.message);
            }
            else {
                dispatch({ type: dtDanhSachMonMoGetCurrent, data });
                done && done(data);
            }
        });
    };
}

export function createDtDanhSachMonMo(maNganh, data, settings, done) {
    return dispatch => {
        const url = '/api/dao-tao/danh-sach-mon-mo';
        T.post(url, { data, maNganh, ...settings }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
                console.error(result.error.message);
            } else {
                T.notify('Bổ sung thành công', 'success');
                dispatch(getDtDanhSachMonMoCurrent(settings.maDangKy));
                done && done();
            }
        });
    };
}

export function deleteDtDanhSachMonMo(id, done) {
    return dispatch => {
        const url = '/api/dao-tao/danh-sach-mon-mo/current';
        T.delete(url, { id }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
                console.error(`GET ${url}. ${result.error.message}`);
            }
            else {
                T.notify('Xóa thành công', 'success');
                dispatch({ type: dtDanhSachMonMoDelete, item: { id } });
                done && done(result);
            }
        });
    };
}
