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
T.initPage('pageCanBoTheoDonVi');
export function getCanBoTheoDonViAll(maDonVi, done) {
    const page = T.updatePage('pageCanBoTheoDonVi', maDonVi);
    return dispatch => {
        const url = `/api/staff/${maDonVi}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách cán bộ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.maDonVi) data.page.maDonVi = page.maDonVi;
                if (done) done(data.item);
                dispatch({ type: canBoTheoDonViGetAll, items: data.item });
            }
        }, () => T.notify('Lấy danh sách cán bộ bị lỗi!', 'danger'));
    };
}