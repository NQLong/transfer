import T from '@/Utils/common';

export const HcthChuKyGet = 'HcthChuKy:Get';
export default function chuKyReducer(state = {}, data) {
    switch (data.type) {
        case HcthChuKyGet:
            return Object.assign({}, state, { signature: data.signature });
        default:
            return state;
    }
};

export function getSignature(done) {
    return dispatch => {
        const url = '/api/hcth/chu-ky';
        T.get(url).then(res=> {
            console.log(res);
            if (res.error) {
                T.alert('Lấy chữ ký thất bại', 'danger');
                console.error(`GET: ${url}.`, res.error);
            } else {
                dispatch({ type: HcthChuKyGet, signature: res.item });
                done && done(res.item);
            }
        }).catch(() => T.notify('Lấy khóa thất bại', 'danger'));
    };
}
