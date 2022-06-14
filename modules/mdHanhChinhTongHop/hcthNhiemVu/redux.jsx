import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const HcthNhiemVuGetAll = 'HcthNhiemVu:GetAll';
const HcthNhiemVuGetPage = 'HcthNhiemVu:GetPage';
const HcthNhiemVuSearchPage = 'HcthNhiemVu:SearchPage';
const HcthNhiemVuGet = 'HcthNhiemVu:Get';
const HcthNhiemVuGetPhanHoi = 'HcthNhiemVu:GetPhanHoi';
const HcthNhiemVuGetLienKet = 'HcthNhiemVu:GetLienKet';
const HcthNhiemVuGetHistory = 'HcthNhiemVu:GetHistory';
const HcthNhiemVuUpdateLienKet = 'HcthNhiemVu:UpdateLienKet';
const HcthNhiemVuGetCanBoNhan = 'HcthNhiemVu:GetCanBoNhan';
const HcthHcthNhiemVuCVDSelector = 'HcthNhiemVu:CVDSelector';
const HcthHcthNhiemVuCVCPSelector = 'HcthNhiemVu:CVCPSelector';

export default function HcthNhiemVuReducer(state = null, data) {
    switch (data.type) {
        case HcthNhiemVuGet:
            return Object.assign({}, state, { item: data.item });
        case HcthNhiemVuGetAll:
            return Object.assign({}, state, { items: data.items });
        case HcthNhiemVuGetPage:
            return Object.assign({}, state, { page: data.page });
        case HcthNhiemVuGetPhanHoi:
            return Object.assign({}, state, { item: { ...(state?.item || {}), phanHoi: data.phanHoi } });
        case HcthNhiemVuGetLienKet:
            return Object.assign({}, state, { item: { ...(state?.item || {}), lienKet: data.lienKet } });
        case HcthNhiemVuGetCanBoNhan:
            return Object.assign({}, state, { item: { ...(state?.item || {}), canBoNhan: data.canBoNhan } });
        case HcthNhiemVuGetHistory:
            return Object.assign({}, state, { item: { ...(state?.item || {}), history: data.history } });
        case HcthNhiemVuSearchPage:
            return Object.assign({}, state, { page: data.page });
        case HcthHcthNhiemVuCVDSelector:
            return Object.assign({}, state, { cvdPage: data.page });
        case HcthHcthNhiemVuCVCPSelector:
            return Object.assign({}, state, { cvcpPage: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageHcthNhiemVu');
export function getHcthNhiemVuPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageHcthNhiemVu', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/hcth/nhiem-vu/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nhiệm vụ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: HcthNhiemVuGetPage, page: data.page });
                done && done(data.page);
            }
        }, () => T.notify('Lấy danh sách nhiệm vụ bị lỗi!', 'danger'));
    };
}

export function createNhiemVu(data, done) {
    return dispatch => {
        const url = '/api/hcth/nhiem-vu';
        T.post(url, data, res => {
            if (res.error) {
                T.notify('Thêm nhiệm vụ bị lỗi', 'danger');
                console.error('POST: ' + url + '. ', res.error);
            } else {
                T.notify('Thêm nhiệm vụ thành công!', 'success');
                dispatch(searchNhiemVu());
                done && done(data);
            }
        }, () => T.notify('Thêm nhiệm vụ bị lỗi', 'danger'));
    };
}

export function getHcthNhiemVuAll(done) {
    return dispatch => {
        const url = '/api/hcth/nhiem-vu/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin giao nhiệm vụ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: HcthNhiemVuGetAll, items: data.items ? data.items : [] });
                done && done(data.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function updateNhiemVu(id, changes, done) {
    return dispatch => {
        const url = '/api/hcth/nhiem-vu';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật nhiệm vụ bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật nhiệm vụ thành công!', 'success');
                dispatch(searchNhiemVu());
                done && done();
            }
        }, () => T.notify('Cập nhật nhiệm vụ học bị lỗi!', 'danger'));
    };
}

export function deleteNhiemVu(id) {
    return dispatch => {
        const url = '/api/hcth/nhiem-vu';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa giao nhiệm vụ bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Xóa giao nhiệm vụ thành công!', 'success');
                dispatch(searchNhiemVu());
            }
        }, () => T.notify('Xóa giao nhiệm vụ bị lỗi!', 'danger'));
    };
}

export function searchNhiemVu(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageHcthNhiemVu', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        dispatch({ type: HcthNhiemVuSearchPage, page: null });
        const url = `/api/hcth/nhiem-vu/search/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nhiệm vụ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: HcthNhiemVuSearchPage, page: data.page });
                done && done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function deleteFile(id, fileId, file, done) {
    return () => {
        const url = '/api/hcth/nhiem-vu/delete-file';
        T.put(url, { id, fileId, file }, data => {
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


export function getNhiemVu(id, context, done) {
    if (!context || typeof context == 'function') {
        done = context;
        context = {};
    }
    return dispatch => {
        const url = `/api/hcth/nhiem-vu/${id}`;
        T.get(url, context, data => {
            if (data.error) {
                console.error('GET: ' + url + '.', data.error);
                T.notify('Lấy nhiệm vụ bị lỗi!', 'danger');
            } else {
                dispatch({ type: HcthNhiemVuGet, item: data.item });
                done && done(data.item);
            }
        }, () => T.notify('Xóa file đính kèm bị lỗi!', 'danger'));
    };
}

export function createPhanHoi(data, done) {
    return () => {
        const url = '/api/hcth/nhiem-vu/phan-hoi';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm phản hồi bị lỗi', 'danger');
                console.error('POST: ' + url, res.error);
            } else {
                T.notify('Thêm phản hồi thành công!', 'success');
                done && done(data);
            }
        }, () => T.notify('Thêm phản hồi bị lỗi', 'danger'));
    };
}

export function getPhanHoi(id, done) {
    return dispatch => {
        const url = `/api/hcth/nhiem-vu/phan-hoi/${id}`;
        T.get(url, res => {
            if (res.error) {
                T.notify('Lấy danh sách phản hồi lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                dispatch({ type: HcthNhiemVuGetPhanHoi, phanHoi: res.items });
                done && done(res.items);
            }
        }, () => T.notify('Lấy danh sách phản hồi lỗi', 'danger'));
    };
}

/// Liên kết

export function createLienKet(id, data, done) {
    return dispatch => {
        const url = '/api/hcth/nhiem-vu/lien-ket';
        T.post(url, data, res => {
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
        const url = '/api/hcth/nhiem-vu/lien-ket';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật liên kết bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật liên kết thành công!', 'success');
                done && done();
                dispatch({ type: HcthNhiemVuUpdateLienKet, lienKet: data.item });
            }
        }, (error) => T.notify('Cập nhật liên kết bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getLienKet(id, done) {
    return dispatch => {
        dispatch({ type: HcthNhiemVuGetLienKet, lienKet: null });
        const url = `/api/hcth/nhiem-vu/lien-ket/${id}`;
        T.get(url, res => {
            if (res.error) {
                T.notify('Lấy danh sách liên kết lỗi', 'danger');
                console.error('GET: ' + url + '. ', res.error);
            } else {
                dispatch({ type: HcthNhiemVuGetLienKet, lienKet: res.items });
                done && done(res.items);
            }
        }, () => T.notify('Lấy danh sách liên kết lỗi', 'danger'));
    };
}


export function deleteLienKet(id, done) {
    return () => {
        const url = '/api/hcth/nhiem-vu/lien-ket/';
        T.delete(url, { id }, res => {
            if (res.error) {
                T.notify('Xoá liên kết không thành công', 'danger');
                console.error('DELETE: ' + url + '. ', res.error);
            } else {
                T.notify('Xoá liên kết thành công', 'success');
                done && done();
            }
        }, () => T.notify('Xoá liên kết không thành công', 'danger'));
    };
}

// // History
export function getListHistory(id, done) {
    return dispatch => {
        const url = '/api/hcth/nhiem-vu/lich-su/list';
        T.post(url, { id }, res => {
            if (res.error) {
                T.notify('Lấy danh sách lịch sử lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                dispatch({ type: HcthNhiemVuGetHistory, history: res.items });
                done && done(res.items);
            }
        }, () => T.notify('Lấy danh sách lịch sử lỗi', 'danger'));
    };
}

// Cán bộ nhận nhiệm vụ

export function createCanBoNhanNhiemVu(ma, nguoiTao, canBoNhan, vaiTro, done) {
    return () => {
        const url = '/api/hcth/nhiem-vu/can-bo-nhan';
        T.post(url, { ma, nguoiTao, canBoNhan, vaiTro }, res => {
            if (res.error) {
                T.notify('Thêm cán bộ bị lỗi', 'danger');
                console.error('POST: ' + url, res.error);
            } else {
                T.notify('Tạo cán bộ thành công', 'success');
                done && done(res.items);
            }
        }, () => T.notify('Tạo cán bộ bị lỗi', 'danger'));
    };
}

export function updateCanBoNhanNhiemVu(data, done) {
    return () => {
        const url = '/api/hcth/nhiem-vu/can-bo-nhan';
        T.put(url, data, res => {
            if (res.error) {
                T.notify('Cập nhật vai trò cán bộ bị lỗi', 'danger');
                console.error('PUT: ' + url, res.error);
            } else {
                T.notify('Cập nhật vai trò cán bộ thành công', 'success');
                done && done(res.item);
            }
        }, () => T.notify('Cập nhật vai trò cán bộ bị lỗi', 'danger'));
    };
}

export function getListCanBoNhanNhiemVu({ ma = null, ids = null }, done) {
    return dispatch => {
        const url = '/api/hcth/nhiem-vu/can-bo-nhan/list';
        T.post(url, { ma, ids }, res => {
            if (res.error) {
                T.notify('Lấy danh sách cán bộ lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                dispatch({ type: HcthNhiemVuGetCanBoNhan, canBoNhan: res.items });
                done && done(res.items);
            }
        }, () => T.notify('Lấy danh sách cán bộ lỗi', 'danger'));
    };
}

export function removeCanBoNhanNhiemVu(data, done) {
    return () => {
        const url = '/api/hcth/nhiem-vu/can-bo-nhan';
        T.delete(url, data, res => {
            if (res.error) {
                T.notify('Xoá cán bộ bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ', res.error);
            } else {
                T.notify('Xoá cán bộ thành công', 'success');
                done && done();
            }
        }, () => T.notify('Xoá cán bộ bị lỗi', 'danger'));
    };
}

T.initPage('pageLienKetCongVanDen');
export function getCongVanDenSelector(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageLienKetCongVanDen', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        dispatch({ type: HcthHcthNhiemVuCVDSelector, page: { list: null } });
        const url = `/api/hcth/cong-van-den/selector/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách công văn đến bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: HcthHcthNhiemVuCVDSelector, page: data.page });
                done && done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

T.initPage('pageLienKetCongVanDi');
export function getCongVanCacPhongSelector(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageLienKetCongVanDi', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        dispatch({ type: HcthHcthNhiemVuCVCPSelector, page: { list: null } });
        const url = `/api/hcth/cong-van-cac-phong/selector/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách công văn đến bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: HcthHcthNhiemVuCVCPSelector, page: data.page });
                done && done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function clearHcthNhiemVu(done) {
    return dispatch => {
        dispatch({ type: HcthNhiemVuGet, item: {} });
        done && done();
    };
}

export function getHistory(id, context, done) {
    if (!context || typeof context == 'function') {
        done = context;
        context = {};
    }
    return dispatch => {
        const url = `/api/hcth/nhiem-vu/lich-su/${id}`;
        T.get(url, context, res => {
            if (res.error) {
                T.notify('Lấy lịch sử nhiệm vụ lỗi', 'danger');
                console.error('GET: ' + url + '. ' + res.error);
            } else {
                dispatch({ type: HcthNhiemVuGetHistory, history: res.items });
                done && done(res.items);
            }
        }, () => T.notify('Lấy lịch sử nhiệm vụ lỗi', 'danger'));
    };
}

export function completeNhiemVu(id, done) {
    return (dispatch) => {
        const url = `/api/hcth/nhiem-vu/hoan-thanh/${id}`;
        T.get(url, res => {
            if (res.error) {
                T.notify('Cập nhật lịch sử lỗi', 'danger');
                console.error('GET: ' + url + '. ', res.error);
            } else {
                T.notify('Cập nhật lịch sử thành công', 'success');
                dispatch(getListCanBoNhanNhiemVu({ ma: id }));
                done && done(res.items);
            }
        }, () => T.notify('Cập nhật lịch sử lỗi', 'danger'));
    };
}

export function closeNhiemVu(id, canBoNhan, nguoiTao, done) {
    return () => {
        const url = `/api/hcth/nhiem-vu/dong/${id}`;
        T.post(url, { canBoNhan, nguoiTao }, res => {
            if (res.error) {
                T.notify('Đóng nhiệm vụ lỗi', 'danger');
                console.error('GET: ' + url + '. ', res.error);
            } else {
                T.notify('Đóng nhiệm vụ thành công', 'success');
                done && done();
            }
        }, () => T.notify('Đóng nhiệm vụ lỗi', 'danger'));
    };
}

export function reopenNhiemVu(id, canBoNhan, nguoiTao, done) {
    return () => {
        const url = `/api/hcth/nhiem-vu/mo-lai/${id}`;
        T.post(url, { canBoNhan, nguoiTao }, res => {
            if (res.error) {
                T.notify('Mở nhiệm vụ lỗi', 'danger');
                console.error('GET: ' + url + '. ', res.error);
            } else {
                T.notify('Mở nhiệm vụ thành công', 'success');
                done && done();
            }
        }, () => T.notify('Mở nhiệm vụ lỗi', 'danger'));
    };
}

export function refreshCanBoNhanStatus(data, done) {
    return dispatch => {
        const url = `/api/hcth/nhiem-vu/reset-trang-thai/${data.id}`;
        T.post(url, data, res => {
            if (res.error) {
                T.notify('Thay đổi trạng thái thành công lỗi', 'danger');
                console.error('GET: ' + url + '. ', res.error);
            } else {
                T.notify('Thay đổi trạng thái thành công', 'success');
                // dispatch(getListHistory(data.id));
                dispatch(getListCanBoNhanNhiemVu({ ma: data.id}));
                done && done();
            }
        }, () => T.notify('Thay đổi trạng thái thành công lỗi', 'danger'));
    };
}

