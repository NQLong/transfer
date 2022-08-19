import T from 'view/js/common';

export const HcthRequestGetUserRequest = 'HcthRequest:GetUserRequest';
export const HcthRequestGetRequest = 'HcthRequest:GetRequest';
export const HcthRequestGetKey = 'HcthRequest:GetKey';
export const HcthRequestGetSignature = 'HcthRequest:GetSignature';

export default function hcthYeuCauTaoKhoa(state = null, data) {
    switch (data.type) {
        case HcthRequestGetUserRequest:
            return Object.assign({}, state, { userPage: data.page });
        case HcthRequestGetRequest:
            return Object.assign({}, state, { page: data.page });
        case HcthRequestGetKey:
            return Object.assign({}, state, { key: data.key });
        case HcthRequestGetSignature:
            return Object.assign({}, state, { signature: data.signature });
        default:
            return state;
    }
}


// Actions ----------------------------------------------------------------------------------------------------
T.initPage('pageHcthUserRequest');
export function getUserRequest(pageNumber, pageSize, pageCondition, pageFilter, done) {
    const page = T.updatePage('pageHcthUserRequest', pageNumber, pageSize, pageCondition, pageFilter);
    return dispatch => {
        const url = `/api/hcth/yeu-cau-tao-khoa/user/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: pageCondition, filter: pageFilter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách yêu cầu bị lỗi!', 'danger');
                console.error(`GET ${url}.`, data.error);
            } else {
                dispatch({ type: HcthRequestGetUserRequest, page: data.page });
                if (done) done(data.page);
            }
        });
    };
}

T.initPage('pageHcthRequest');
export function getRequest(pageNumber, pageSize, pageCondition, pageFilter, done) {
    const page = T.updatePage('pageHcthRequest', pageNumber, pageSize, pageCondition, pageFilter);
    return dispatch => {
        const url = `/api/hcth/yeu-cau-tao-khoa/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: pageCondition, filter: pageFilter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách yêu cầu bị lỗi!', 'danger');
                console.error(`GET ${url}.`, data.error);
            } else {
                dispatch({ type: HcthRequestGetRequest, page: data.page });
                if (done) done(data.page);
            }
        });
    };
}

export function createRequest(data, done) {
    const url = '/api/hcth/yeu-cau-tao-khoa';
    return () => {
        T.post(url, data, (res) => {
            if (res.error) {
                T.notify('Tạo yêu cầu thất bại. ' + (res.error.message && typeof res.error.message === 'string' ? res.error.message : ''), 'danger');
                console.error(`POST: ${url}`, res.error);
            } else {
                T.notify('Tạo yêu cầu mới thành công', 'success');
                done && done();
            }
        }, () => T.notify('Tạo yêu cầu thất bại', 'danger'));
    };
}

export function updateStatus(id, status, done) {
    return (dispatch) => {
        const url = `/api/hcth/yeu-cau-tao-khoa/trang-thai/${id}`;
        T.put(url, { trangThai: status }, res => {
            if (res.error) {
                T.notify('Cập nhật yêu cầu thất bại', 'danger');
                console.error(`Put: ${url}.`, res.error);
            } else {
                T.notify('Cập nhật yêu cầu thành công', 'success');
                dispatch(getRequest());
                done && done();
            }
        }, () => T.notify('Cập nhật yêu cầu thất bại', 'danger'));
    };
}

export function getKey(done) {
    return (dispatch) => {
        const url = '/api/hcth/khoa/user';
        T.get(url, res => {
            if (res.error) {
                T.notify('Lấy khóa thất bại', 'danger');
                console.error(`GET: ${url}.`, res.error);
            } else {
                T.notify('Lấy khóa thành công', 'success');
                dispatch({ type: HcthRequestGetKey, key: res.item });
                done && done(res.item);
            }
        }, () => T.notify('Lấy khóa thất bại', 'danger'));
    };
}

export function downloadKey(data, done) {
    return () => {
        const url = '/api/hcth/khoa/user/download';
        T.post(url, data, res => {
            if (res.error) {
                T.notify('Tải khóa thất bại', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                T.notify('Khóa được gửi thành công đến email của bạn', 'success');
                done && done();
            }
        }, () => T.notify('Tải khóa thất bại', 'danger'));
    };
}

export function createSignatureImg(shcc, dataUrl, done) {
    return (dispatch) => {
        const url = '/api/hcth/chu-ky';
        T.post(url, { shcc, dataUrl }, res => {
            if (res.error) {
                T.notify('Tạo chữ ký lỗi', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                T.notify('Tạo chữ ký thành công', 'success');
                dispatch(getSignature());
                done && done();
            }
        }, () => T.notify('Tạo chữ ký lỗi', 'danger'));
    };
}

export function getSignature(done) {
    return dispatch => {
        const url = '/api/hcth/chu-ky';
        T.get(url, res => {
            if (res.error) {
                T.notify('Lấy chữ ký thất bại', 'danger');
                console.error(`GET: ${url}.`, res.error);
            } else {
                T.notify('Lấy chữ ký thành công', 'success');
                dispatch({ type: HcthRequestGetSignature, signature: res.item });
                done && done(res.item);
            }
        }, () => T.notify('Lấy khóa thất bại', 'danger'));
    };
}
