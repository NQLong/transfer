import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const
    HcthCongVanDenGetAll = 'HcthCongVanDen:GetAll',
    HcthCongVanDenGetPage = 'HcthCongVanDen:GetPage',
    HcthCongVanDenSearchPage = 'HcthCongVanDen:SearchPage',
    HcthCongVanDenGet = 'HcthCongVanDen:Get',
    HcthCongVanDenGetPhanHoi = 'HcthCongVanDen:GetPhanHoi',
    HcthCongVanDenGetHistory = 'HcthCongVanDen:GetHistory',
    HcthCongVanDenGetChiDao = 'HcthCongVanDen:GetChiDao',
    HcthCongVanDenGetError = 'HcthCongVanDen:GetError';

// const HcthCongVanDenUpdate = 'HcthCongVanDen:Update';

export default function HcthCongVanDenReducer(state = null, data) {
    switch (data.type) {
        case HcthCongVanDenGet:
            return Object.assign({}, state, { item: data.item });
        case HcthCongVanDenGetAll:
            return Object.assign({}, state, { items: data.items });
        case HcthCongVanDenGetPage:
        case HcthCongVanDenSearchPage:
            return Object.assign({}, state, { page: data.page });
        case HcthCongVanDenGetPhanHoi:
            return Object.assign({}, state, { item: { ...(state?.item || {}), phanHoi: data.phanHoi } });
        case HcthCongVanDenGetHistory:
            return Object.assign({}, state, { item: { ...(state?.item || {}), history: data.history } });
        case HcthCongVanDenGetChiDao:
            return Object.assign({}, state, { item: { ...(state?.item || {}), danhSachChiDao: data.chiDao } });
        case HcthCongVanDenGetError:
            return Object.assign({}, state, { item: { ...(state?.item || {}), error: data.error } });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageHcthCongVanDen');
export function getHcthCongVanDenPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageHcthCongVanDen', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/hcth/van-ban-den/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sách văn bản đến bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: HcthCongVanDenGetPage, page: data.page });
                done && done(data.page);
            }
        }, () => T.notify('Lấy danh sách sách văn bản đến bị lỗi!', 'danger'));
    };
}

export function createHcthCongVanDen(data, done) {
    return dispatch => {
        const url = '/api/hcth/van-ban-den';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm văn bản đến bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm văn bản đến thành công!', 'success');
                dispatch(getHcthCongVanDenSearchPage());
                done && done(data);
            }
        }, () => T.notify('Thêm văn bản đến bị lỗi', 'danger'));
    };
}

export function getHcthCongVanDenAll(done) {
    return dispatch => {
        const url = '/api/hcth/van-ban-den/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin văn bản đến bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: HcthCongVanDenGetAll, items: data.items ? data.items : [] });
                done && done(data.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function updateHcthCongVanDen(id, changes, done) {
    return dispatch => {
        const url = '/api/hcth/van-ban-den';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật văn bản đến bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật văn bản đến thành công!', 'success');
                dispatch(getHcthCongVanDenSearchPage());
                done && done();
            }
        }, () => T.notify('Cập nhật văn bản đến bị lỗi!', 'danger'));
    };
}

export function deleteHcthCongVanDen(id) {
    return dispatch => {
        const url = '/api/hcth/van-ban-den';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa văn bản đến bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Xóa văn bản đến thành công!', 'success');
                dispatch(getHcthCongVanDenSearchPage());
            }
        }, () => T.notify('Xóa văn bản đến bị lỗi!', 'danger'));
    };
}

export function getHcthCongVanDenSearchPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageHcthCongVanDen', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/hcth/van-ban-den/search/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách văn bản đến bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: HcthCongVanDenSearchPage, page: data.page });
                done && done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function deleteFile(id, fileId, file, done) {
    return () => {
        const url = '/api/hcth/van-ban-den/delete-file';
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


export function getCongVanDen(id, context, done) {

    if (typeof context === 'function') {
        done = context;
        context = {};
    }
    return dispatch => {
        const url = `/api/hcth/van-ban-den/${id}`;
        T.get(url, context || {}, data => {
            if (data.error) {
                if (data.error.status == 401) {
                    dispatch({ type: HcthCongVanDenGetError, error: 401 });
                    console.error('GET: ' + url + '.', data.error.message);
                }
                else
                    console.error('GET: ' + url + '.', data.error);
                T.notify('Lấy văn bản đến bị lỗi!', 'danger');
            } else {
                dispatch({ type: HcthCongVanDenGet, item: data.item });
                done && done(data.item);
            }
        }, () => T.notify('Lấy văn bản đến bị lỗi!', 'danger'));
    };
}


export function createChiDao(data, done) {
    return () => {
        const url = '/api/hcth/van-ban-den/chi-dao';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm chỉ đạo bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm chỉ đạo thành công!', 'success');
                done && done(data);
            }
        }, () => T.notify('Thêm chỉ đạo bị lỗi', 'danger'));
    };
}

export function createPhanHoi(data, done) {
    return () => {
        const url = '/api/hcth/van-ban-den/phan-hoi';
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

export function updateStatus(data, done) {
    return () => {
        const url = '/api/hcth/van-ban-den/status';
        T.put(url, { data }, res => {
            if (res.error) {
                T.notify('Cập nhật văn bản đến bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Cập nhật văn bản đến thành công!', 'success');
                done && done(data);
            }
        }, () => T.notify('Cập nhật văn bản đến bị lỗi', 'danger'));
    };
}

export function getPhanHoi(id, done) {
    return dispatch => {
        const url = `/api/hcth/van-ban-den/phan-hoi/${id}`;
        T.get(url, res => {
            if (res.error) {
                T.notify('Lấy danh sách phản hồi lỗi', 'danger');
                console.error('GET: ' + url + '. ', res.error);
            } else {
                dispatch({ type: HcthCongVanDenGetPhanHoi, phanHoi: res.items });
                done && done(res.items);
            }
        }, () => T.notify('Lấy danh sách phản hồi lỗi', 'danger'));
    };
}

export function getHistory(id, context, done) {
    if (!context || typeof context == 'function') {
        done = context;
        context = {};
    }

    return dispatch => {
        const url = `/api/hcth/van-ban-den/lich-su/${id}`;
        T.get(url, context, res => {
            if (res.error) {
                T.notify('Lấy lịch sử văn bản lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                dispatch({ type: HcthCongVanDenGetHistory, history: res.items });
                done && done(res.items);
            }
        }, () => T.notify('Lấy lịch sử văn bản lỗi', 'danger'));
    };
}

export function getChiDao(id, done) {
    return dispatch => {
        const url = `/api/hcth/van-ban-den/chi-dao/${id}`;
        T.get(url, res => {
            if (res.error) {
                T.notify('Lấy văn bản chỉ đạo lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                dispatch({ type: HcthCongVanDenGetChiDao, chiDao: res.items });
                done && done(res.items);
            }
        }, () => T.notify('Lấy văn bản chỉ đạo lỗi', 'danger'));
    };
}

export function updateQuyenChiDao(id, shcc, trangThaiCv, status, done) {
    return () => {
        const url = '/api/hcth/van-ban-den/quyen-chi-dao';
        T.post(url, { id, shcc, trangThaiCv, status }, res => {
            done && done(res);
        }, () => T.notify('Thêm cán bộ chỉ đạo lỗi', 'danger'));
    };
}


export function duyetCongVan(id, noiDung, done) {
    return () => {
        const url = '/api/hcth/van-ban-den/duyet';
        T.put(url, { id, noiDung }, res => {
            if (res.error) {
                T.notify('Duyệt văn bản lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + res.error);
            } else {
                done && done();
            }
        }, () => T.notify('Duyệt văn bản lỗi', 'danger'));
    };
}