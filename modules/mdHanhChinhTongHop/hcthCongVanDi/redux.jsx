import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const hcthCongVanDiGetAll = 'hcthCongVanDi:GetAll';
const hcthCongVanDiGetPage = 'hcthCongVanDi:GetPage';
const hcthCongVanDiSearchPage = 'hcthCongVanDi:SearchPage';
const hcthCongVanDiGet = 'hcthCongVanDi:Get';
const hcthCongVanDiGetHistory = 'hcthCongVanDi:GetHistory';
const hcthCongVanDiGetError = 'hcthCongVanDi:GetError';
const hcthCongVanDiGetPhanHoi = 'hcthCongVanDi:GetPhanHoi';
const hcthCongVanDiGetCongVanTrinhKy = 'hcthCongVanDi:GetCongVanTrinhKy';
const hcthVanBanDiGetFiles = 'hcthVanBanDi:GetFiles';

export default function hcthCongVanDiReducer(state = null, data) {
    switch (data.type) {
        case hcthCongVanDiGetAll:
            return Object.assign({}, state, { items: data.items });
        case hcthCongVanDiGetPage:
            return Object.assign({}, state, { page: data.page });
        case hcthCongVanDiSearchPage:
            return Object.assign({}, state, { page: data.page });
        case hcthCongVanDiGet:
            return Object.assign({}, state, { item: data.item });
        case hcthCongVanDiGetHistory:
            return Object.assign({}, state, { item: { ...(state?.item || {}), history: data.history } });
        case hcthCongVanDiGetError:
            return Object.assign({}, state, { item: { ...(state?.item || {}), error: data.error } });
        case hcthCongVanDiGetPhanHoi:
            return Object.assign({}, state, { item: { ...(state?.item || {}), phanHoi: data.phanHoi } });
        case hcthCongVanDiGetCongVanTrinhKy:
            return Object.assign({}, state, { item: { ...(state?.item || {}), yeuCauKy: data.yeuCauKy } });
        case hcthVanBanDiGetFiles:
            return Object.assign({}, state, { item: { ...(state?.item || {}), files: data.files } });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageHcthCongVanDi');



export function createHcthCongVanDi(data, done) {
    return dispatch => {
        const url = '/api/hcth/van-ban-di';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm văn bản đi bị lỗi', 'danger');
                console.error('POST: ' + url + '. ', res.error);
            } else {
                T.notify('Thêm văn bản đi thành công!', 'success');
                dispatch(getHcthCongVanDiSearchPage());
                done && done(data);
            }
        }, () => T.notify('Thêm văn bản đi bị lỗi', 'danger'));
    };
}

export function updateHcthCongVanDi(id, changes, done) {
    return dispatch => {
        const url = `/api/hcth/van-ban-di/${id}`;
        T.put(url, changes, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật văn bản đi bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật văn bản đi thành công!', 'success');
                dispatch(getHcthCongVanDiSearchPage());
                done && done();
            }
        }, () => T.notify('Cập nhật văn bản đi bị lỗi!', 'danger'));
    };
}

export function deleteHcthCongVanDi(id) {
    return dispatch => {
        const url = '/api/hcth/van-ban-di';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa văn bản đi bị lỗi!, lỗi 1', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Xóa văn bản đi thành công!', 'success');
                dispatch(getHcthCongVanDiSearchPage());
            }
        }, () => T.notify('Xóa văn bản đi bị lỗi!', 'danger'));
    };
}

export function getHcthCongVanDiSearchPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageHcthCongVanDi', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/hcth/van-ban-di/search/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách văn bản đi bị lỗi, s1' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: hcthCongVanDiSearchPage, page: data.page });
                done && done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function deleteFile(id, fileId, updateFileId, file, done) {
    return () => {
        const url = '/api/hcth/van-ban-di/delete-file';
        T.put(url, { id, fileId, updateFileId, file }, data => {
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


export function getCongVanDi(id, context, done) {

    if (typeof context === 'function') {
        done = context;
        context = {};
    }

    return dispatch => {
        const url = `/api/hcth/van-ban-di/${id}`;
        T.get(url, context, data => {
            if (data.error) {
                if (data.error.status == 401) {
                    dispatch({ type: hcthCongVanDiGetError, error: 401 });
                }
                console.error('GET: ' + url + '.', data.error);
                T.notify('Lấy văn bản đi bị lỗi!', 'danger');
            } else {
                dispatch({ type: hcthCongVanDiGet, item: data.item });
                done && done(data.item);
            }
        }, () => T.notify('Xóa file đính kèm bị lỗi!', 'danger'));
    };
}

export function createPhanHoi(data, done) {
    return () => {
        const url = '/api/hcth/van-ban-di/phan-hoi';
        T.post(url, { data: data }, res => {
            if (res.error) {
                T.notify('Thêm phản hồi bị lỗi', 'danger');
                console.error('POST: ' + url + '. ', res.error);
            } else {
                T.notify('Thêm phản hồi thành công!', 'success');
                done && done(data);
            }
        }, () => T.notify('Thêm phản hồi bị lỗi', 'danger'));
    };
}

export function getPhanHoi(id, done) {
    return dispatch => {
        const url = `/api/hcth/van-ban-di/phan-hoi/${id}`;
        T.get(url, res => {
            if (res.error) {
                T.notify('Lấy danh sách phản hồi bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + res.error);
            } else {
                dispatch({ type: hcthCongVanDiGetPhanHoi, phanHoi: res.item });
                done && done(res.item);
            }
        }, () => T.notify('Lấy danh sách phản hồi lỗi', 'danger'));
    };
}

export const SelectAdapter_CongVanDi = {
    ajax: true,
    url: '/api/hcth/van-ban-di/search/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: `#${item.id} - Số: ${item.soCongVan || 'Chưa có số văn bản'} - Trích yếu: "${item.trichYeu}" - Đơn vị: ${item.tenDonViGui}` })) : [] }),
    fetchOne: (id, done) => (getCongVanDi(id, ({ item }) => done && done({ id: item.id, text: `${item.soCongVan || 'Chưa có số văn bản'} : ${item.trichYeu}` })))(),
};


export function getHistory(id, context, done) {
    if (!context || typeof context == 'function') {
        done = context;
        context = {};
    }
    return dispatch => {
        const url = `/api/hcth/van-ban-di/lich-su/${id}`;
        T.get(url, context, res => {
            if (res.error) {
                T.notify('Lấy lịch sử văn bản lỗi', 'danger');
                console.error('GET: ' + url + '. ' + res.error);
            } else {
                dispatch({ type: hcthCongVanDiGetHistory, history: res.item });
                done && done(res.item);
            }
        }, () => T.notify('Lấy lịch sử văn bản lỗi', 'danger'));
    };
}

export function getFile(id, done) {
    return (dispatch) => {
        const url = `/api/hcth/van-ban-di/file-list/${id}`;
        T.get(url, (res) => {
            if (res.error) {
                T.notify('Lấy danh sách tệp tin thất bại. ' + (res.error.message || ''), 'danger');
                console.error(`GET: ${url}.`, res.error);
            } else {
                // T.notify('Câp nhật cấu hình chữ ký thành công', 'success');
                dispatch({ type: hcthVanBanDiGetFiles, files: res.files });
                done && done(res.files);
            }
        }, () => T.notify('Lấy danh sách tệp tin thất bại.', 'danger'));
    }
}

export function updateConfig(id, config, done) {
    return () => {
        const url = '/api/hcth/van-ban-di/file/config';
        T.post(url, { id, config }, (res) => {
            if (res.error) {
                T.notify('Câp nhật cấu hình chữ ký thất bại. ' + (res.error.message || ''), 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                T.notify('Câp nhật cấu hình chữ ký thành công', 'success');
                done && done();
            }
        }, () => T.notify('Câp nhật cấu hình chữ ký thất bại. ', 'danger'));
    }
}


export function ready(id, done) {
    return () => {
        const url = `/api/hcth/van-ban-di/ready/${id}`;
        T.put(url, (res) => {
            if (res.error) {
                T.notify('Cập nhật trạng thái thất bại. ' + (res.error.message || ''), 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                T.notify('Cập nhật trạng thái thành công. ', 'success');
                done && done();
            }
        }, () => T.notify('Cập nhật trạng thái thất bại.', 'danger'));
    }
}

export function contentAprrove(id, done) {
    return () => {
        const url = `/api/hcth/van-ban-di/content/approve/${id}`;
        T.put(url, (res) => {
            if (res.error) {
                T.notify('Cập nhật trạng thái thất bại. ' + (res.error.message || ''), 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                T.notify('Cập nhật trạng thái thành công. ', 'success');
                done && done();
            }
        }, () => T.notify('Cập nhật trạng thái thất bại.', 'danger'));
    }
}

export function formailtyAprrove(id, done) {
    return () => {
        const url = `/api/hcth/van-ban-di/formailty/approve/${id}`;
        T.put(url, (res) => {
            if (res.error) {
                T.notify('Cập nhật trạng thái thất bại. ' + (res.error.message || ''), 'danger');
                console.error(`PUT: ${url}.`, res.error);
            } else {
                T.notify('Cập nhật trạng thái thành công. ', 'success');
                done && done();
            }
        }, () => T.notify('Cập nhật trạng thái thất bại.', 'danger'));
    }
}

export function returnVanBan(id, lyDo, done) {
    return () => {
        const url = `/api/hcth/van-ban-di/return/${id}`;
        T.put(url, { lyDo }, (res) => {
            if (res.error) {
                T.notify('Trả lại văn bản thất bại. ' + (res.error.message || ''), 'danger');
                console.error(`PUT: ${url}.`, res.error);
            } else {
                T.notify('Trả lại văn bản thành công. ', 'success');
                done && done();
            }
        }, () => T.notify('Trả lại văn bản thất bại.', 'danger'));
    }
}
