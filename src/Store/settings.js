import T from '@/Utils/common';
import crypto from 'crypto-js';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

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

export function getState(done) {
    return dispatch => {
        const url = '/api/state'
        T.get(url).then(res => {
            if (res.error) {
                alert('Lấy thông tin hệ thống thất bại');
                console.error('GET: ', url, res.error);
            } else
                dispatch({ type: 'system:UpdateState', state: res });
            done && done();
        }).catch(() => {
            alert('Lấy thông tin hệ thống thất bại')
        })
    }
}

export function signOut(done) {
    return dispatch => {
        T.post('/logout').catch(error => console.error('Lỗi đăng xuất', error)).finally(() => {
            dispatch({ type: 'system:UpdateState', state: null });
            Promise.all([
                T.storage.clear(),
                T.clearCookie(),
                GoogleSignin.signOut()
            ]).catch((error) => console.error('Lỗi đăng xuất', error)).finally(() => done && done());
        });
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

export function getDmDonVi(ma, done) {
    return () => {
        const url = `/api/danh-muc/don-vi/item/${ma}`;
        T.get(url, { ma }).then(data => {
            if (data.error) {
                T.alert('Lỗi','Lấy thông tin đơn vị trường đại học bị lỗi');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }).catch(error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function switchUser(personId, done) {
    return (dispatch) => {
        const url = '/api/debug/switch-user';
        T.post(url, { personId }).then(data => {
            if (data.error) {
                T.alert('Lỗi', data.error.message);
            } else {
                T.cookie('personId', personId);
                dispatch(getState());
                done && done();
            }
        }).catch((error) => {
            console.error(error);
            T.alert('Lỗi', 'Switch user has some errors!');
        });
    };
}

export const SelectAdapter_DmDonVi = {
    url: '/api/danh-muc/don-vi/page/1/50',
    data: params => ({ condition: params.term, kichHoat: 1 }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten, preShcc: item.preShcc })) : [] }),
    fetchOne: (id, done) => (getDmDonVi(id, item => item && done && done({ id: item.ma, text: item.ten })))(),
};

export function getStaff(shcc, done) {
    return () => {
        const url = `/api/staff/item/${shcc}`;
        T.get(url, data).then(data => {
            if (data.error) {
                T.alert('Lỗi', 'Lấy thông tin cán bộ bị lỗi');
                console.error(`GET: ${url}.`, data.error);
            }
            else if (done) {
                done(data);
            }
        }).catch(error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export const SelectAdapter_FwCanBo = {
    url: '/api/staff/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({
        results: response && response.page && response.page.list ? response.page.list.map(item => ({
            id: item.shcc, text: `${item.shcc}: ${(item.ho + ' ' + item.ten).normalizedName()}`, ngayBatDauCongTac: item.ngayBatDauCongTac, data: {
                phai: item.phai,
                ngaySinh: item.ngaySinh,
                hocVi: item.hocVi,
                chucDanh: item.chucDanh,
            }
        })) : []
    }),
    getOne: getStaff,
    fetchOne: (shcc, done) => (getStaff(shcc, ({ item }) => done && done({ id: item.shcc, text: `${item.shcc}: ${(item.ho + ' ' + item.ten).normalizedName()}`, ngayBatDauCongTac: item.ngayBatDauCongTac })))(),
    processResultOne: response => response && response.item && ({ value: response.item.shcc, text: `${response.item.shcc}: ${(response.item.ho + ' ' + response.item.ten).normalizedName()}` }),
};

