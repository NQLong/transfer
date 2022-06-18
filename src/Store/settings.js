import T from '@/Utils/common';
import crypto from 'crypto-js';


export const login = async (data) => {
    let string = `${data.cmnd}|${data.secretCode}`.replace(/\s +/g, '');
    let checksum = crypto.MD5(string).toString();
    const response = await T.post('/api/sign-in-app', { data, checksum });
    return response;
}

export const checkQr = async (settings, data) => {
    if (settings.user) {
        let { cmnd, secretCode } = settings.user;
        let string = `${cmnd}|${secretCode}`.replace(/\s +/g, '');
        let checksum = crypto.MD5(string).toString();
        const response = await T.get(`/api/check-qr-code?content=${data}&checksum=${checksum}`);
        return response;
    }
}

export const updateHoSo = async (settings, data, hopLe, notLatest) => {
    if (settings.user) {
        let { cmnd, secretCode } = settings.user;
        let string = `${cmnd}|${secretCode}`.replace(/\s +/g, '');
        let checksum = crypto.MD5(string).toString();

        const response = await T.put('/api/update-tinh-trang-ho-so', { checksum, content: data, options: { hopLe, notLatest } });

        if (response.error) T.alert(response.error);
        else T.alert(response.success);
        return response;
    }

}

// Reducer ===================================================================================================
export default function settingReducer(state = {}, data) {
    switch (data.type) {
        case 'system:UpdateState':
            return data.state;
        default:
            return state;
    }
}