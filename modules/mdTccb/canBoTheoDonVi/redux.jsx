import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const canBoTheoDonViGetAll = 'canBoTheoDonVi:GetAll';

export default function canBoTheoDonViReducer(state = null, data) {
    switch (data.type) {
        case canBoTheoDonViGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageNhanSuDonVi');
export function getNhanSuDonVi(maDonVi, done) {
    const page = T.updatePage('pageNhanSuDonVi', maDonVi);
    return dispatch => {
        const url = '/api/staff/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách cán bộ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.maDonVi) data.page.maDonVi = page.maDonVi;
                if (done) done(data.items);
                dispatch({ type: canBoTheoDonViGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách cán bộ bị lỗi!', 'danger'));
    };
}