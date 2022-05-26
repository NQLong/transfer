import { saveDangKyMoMon } from '../dtDangKyMoMon/redux';

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
                data.chuongTrinhDaoTao = data.chuongTrinhDaoTao.map(item => {
                    item.tenMonHoc = T.parse(item.tenMonHoc).vi;
                    item.maDangKy = id;
                    return item;
                });
                if (!data.danhSachMonMo.length) {
                    data.danhSachMonMo = data.chuongTrinhDaoTao;
                    saveDangKyMoMon(id, data.chuongTrinhDaoTao.map(item => {
                        item.maDangKy = id;
                        return item;
                    }), () => {
                        T.notify('Lấy danh sách dự kiến từ CTĐT các khóa', 'info');
                        dispatch({ type: dtDanhSachMonMoGetCurrent, data });
                        done && done(data);
                    });
                }
                else {
                    dispatch({ type: dtDanhSachMonMoGetCurrent, data });
                    done && done(data);
                }

            }
        });
    };
}

export function createDtDanhSachMonMo(data, done) {
    return dispatch => {
        const url = '/api/dao-tao/danh-sach-mon-mo/current';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
                console.error(result.error.message);
            } else {
                T.notify('Bổ sung thành công', 'success');
                dispatch({ type: dtDanhSachMonMoCreate, item: result.item });
                done && done(result.item);
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
