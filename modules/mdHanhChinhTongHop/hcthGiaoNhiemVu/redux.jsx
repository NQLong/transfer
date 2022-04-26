import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const HcthGiaoNhiemVuGetAll = 'HcthGiaoNhiemVu:GetAll';
const HcthGiaoNhiemVuGetPage = 'HcthGiaoNhiemVu:GetPage';
const HcthGiaoNhiemVuSearchPage = 'HcthGiaoNhiemVu:SearchPage';
const HcthGiaoNhiemVuGet = 'HcthGiaoNhiemVu:Get';
const HcthGiaoNhiemVuGetPhanHoi = 'HcthGiaoNhiemVu:GetPhanHoi';
const HcthGiaoNhiemVuGetLienKet = 'HcthGiaoNhiemVu:GetLienKet';
const HcthGiaoNhiemVuUpdateLienKet = 'HcthGiaoNhiemVu:UpdateLienKet';
const HcthGiaoNhiemVuGetCanBoNhan = 'HcthGiaoNhiemVu:GetCanBoNhan';

export default function HcthGiaoNhiemVuReducer(state = null, data) {
    switch (data.type) {
        case HcthGiaoNhiemVuGet:
            return Object.assign({}, state, { item: data.item });
        case HcthGiaoNhiemVuGetAll:
            return Object.assign({}, state, { items: data.items });
        case HcthGiaoNhiemVuGetPage:
            return Object.assign({}, state, { page: data.page });
        case HcthGiaoNhiemVuGetPhanHoi:
            return Object.assign({}, state, { item: { ...(state.item || {}), phanHoi: data.phanHoi } });
        case HcthGiaoNhiemVuGetLienKet:
            return Object.assign({}, state, { item: { ...(state.item || {}), lienKet: data.lienKet } });
        case HcthGiaoNhiemVuGetCanBoNhan:
            return Object.assign({}, state, { item: { ...(state.item || {}), canBoNhanNhiemVu: data.canBoNhan } });
        case HcthGiaoNhiemVuSearchPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageHcthGiaoNhiemVu');
export function getHcthGiaoNhiemVuPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageHcthGiaoNhiemVu', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/hcth/giao-nhiem-vu/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nhiệm vụ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: HcthGiaoNhiemVuGetPage, page: data.page });
                done && done(data.page);
            }
        }, () => T.notify('Lấy danh sách nhiệm vụ bị lỗi!', 'danger'));
    };
}

export function createHcthGiaoNhiemVu(data, done) {
    return dispatch => {
        const url = '/api/hcth/giao-nhiem-vu';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm nhiệm vụ bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm nhiệm vụ thành công!', 'success');
                dispatch(getHcthGiaoNhiemVuSearchPage());
                done && done(data);
            }
        }, () => T.notify('Thêm nhiệm vụ bị lỗi', 'danger'));
    };
}

export function getHcthGiaoNhiemVuAll(done) {
    return dispatch => {
        const url = '/api/hcth/giao-nhiem-vu/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin giao nhiệm vụ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: HcthGiaoNhiemVuGetAll, items: data.items ? data.items : [] });
                done && done(data.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function updateHcthGiaoNhiemVu(id, changes, done) {
    return dispatch => {
        const url = '/api/hcth/giao-nhiem-vu';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật nhiệm vụ bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật nhiệm vụ thành công!', 'success');
                dispatch(getHcthGiaoNhiemVuSearchPage());
                done && done();
            }
        }, () => T.notify('Cập nhật nhiệm vụ học bị lỗi!', 'danger'));
    };
}

export function deleteHcthGiaoNhiemVu(id) {
    return dispatch => {
        const url = '/api/hcth/giao-nhiem-vu';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa giao nhiệm vụ bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Xóa giao nhiệm vụ thành công!', 'success');
                dispatch(getHcthGiaoNhiemVuSearchPage());
            }
        }, () => T.notify('Xóa giao nhiệm vụ bị lỗi!', 'danger'));
    };
}

export function getHcthGiaoNhiemVuSearchPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageHcthGiaoNhiemVu', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/hcth/giao-nhiem-vu/search/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nhiệm vụ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: HcthGiaoNhiemVuSearchPage, page: data.page });
                done && done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function deleteFile(id, index, file, done) {
    return () => {
        const url = '/api/hcth/giao-nhiem-vu/delete-file';
        T.put(url, { id, index, file }, data => {
            if (data.error) {
                console.error('PUT: ' + url + '.', data.error);
                T.notify('Xóa file đính kèm lỗi!', 'danger');
            } else {
                T.notify('Xóa file đính kèm thành công!', 'success');
                done && done();
            }
        }, () => T.notify('Xóa file đính kèm bị lỗi!', 'danger'));
    };
}


export function getGiaoNhiemVu(id, done) {
    return dispatch => {
        const url = `/api/hcth/giao-nhiem-vu/${id}`;
        T.get(url, data => {
            if (data.error) {
                console.error('GET: ' + url + '.', data.error);
                T.notify('Lấy nhiệm vụ bị lỗi!', 'danger');
            } else {
                dispatch({ type: HcthGiaoNhiemVuGet, item: data.item });
                done && done(data.item);
            }
        }, () => T.notify('Xóa file đính kèm bị lỗi!', 'danger'));
    };
}

export function createPhanHoi(data, done) {
    return () => {
        const url = '/api/hcth/giao-nhiem-vu/phan-hoi';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm phản hồi bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm phản hồi thành công!', 'success');
                done && done(data);
            }
        }, () => T.notify('Thêm phản hồi bị lỗi', 'danger'));
    };
}

export function getPhanHoi(id, done) {
    return dispatch => {
        const url = `/api/hcth/giao-nhiem-vu/phan-hoi/${id}`;
        T.get(url, res => {
            if (res.error) {
                T.notify('Lấy danh sách phản hồi lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                dispatch({type: HcthGiaoNhiemVuGetPhanHoi, phanHoi: res.items});
                done && done(res.items);
            }
        }, () => T.notify('Lấy danh sách phản hồi lỗi', 'danger'));
    };
}

/// Liên kết

export function createLienKet(id, data, done) {
    return dispatch => {
        const url = '/api/hcth/giao-nhiem-vu/lien-ket';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm liên kết lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm liên kết thành công!', 'success');
                dispatch(getLienKet(id));
                done && done(data);
            }
        }, () => T.notify('Lấy liên kết lỗi', 'danger'));
    };
}

export function updateLienKet(id, changes, done) {
    return dispatch => {
        const url = '/api/hcth/giao-nhiem-vu/lien-ket';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật liên kết bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật liên kết thành công!', 'success');
                done && done();
                dispatch({ type: HcthGiaoNhiemVuUpdateLienKet, lienKet: data.item });
            }
        }, (error) => T.notify('Cập nhật liên kết bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getLienKet(id, done) {
    return dispatch => {
        const url = `/api/hcth/giao-nhiem-vu/lien-ket/${id}`;
        T.get(url, res => {
            if (res.error) {
                T.notify('Lấy danh sách liên kết lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                dispatch({ type: HcthGiaoNhiemVuGetLienKet, lienKet: res.items });
                done && done(res.items);
            }
        }, () => T.notify('Lấy danh sách liên kết lỗi', 'danger'));
    };
}

// Cán bộ nhận nhiệm vụ

export function createCanBoNhanNhiemVu(data, done){
    return () => {
        const url = '/api/hcth/giao-nhiem-vu/can-bo-nhan-nhiem-vu';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm cán bộ bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Tạo cán bộ thành công', 'success');
                done && done();
            }
        }, () => T.notify('Tạo cán bộ bị lỗi', 'danger'));
    };
}

export function getCanBoNhanNhiemVu(id, done) {
    return dispatch => {
        const url = `/api/hcth/giao-nhiem-vu/can-bo-nhan-nhiem-vu/${id}`;
        T.get(url, res => {
            if (res.error) {
                T.notify('Lấy danh sách cán bộ lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                dispatch({ type: HcthGiaoNhiemVuGetCanBoNhan, canBoNhan: res.items });
                done && done(res.items);
            }
        }, () => T.notify('Lấy danh sách cán bộ lỗi', 'danger'));
    };
}

export function removeCanBoNhanNhiemVu(data, done) {
    return () => {
        const url = '/api/hcth/giao-nhiem-vu/can-bo-nhan-nhiem-vu';
        T.put(url, { data }, res => {
            if (res.error) {
                T.notify('Xoá cán bộ bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Xoá cán bộ thành công', 'success');
                done && done();
            }
        }, () => T.notify('Xoá cán bộ bị lỗi', 'danger'));
    };
}

