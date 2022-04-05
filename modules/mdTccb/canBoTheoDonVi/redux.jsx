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
export function getNhanSuDonVi(listDonVi, done) {
    T.updatePage('pageNhanSuDonVi');
    return dispatch => {
        const url = '/api/nhan-su-don-vi';
        T.get(url, { listDonVi }, data => {
            if (data.error) {
                T.notify('Lấy danh sách cán bộ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: canBoTheoDonViGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách cán bộ bị lỗi!', 'danger'));
    };
}