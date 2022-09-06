import T from '@/Utils/common';


export const HcthCongVanDenSearchPage = 'HcthCongVanDen:SearchPage';
export const HcthCongVanDenGet = 'HcthCongVanDen:Get';
export const HcthCongVanDenGetMorePage = 'HcthCongVanDen:GetMorePage';
export const HcthCongVanDenGetPhanHoi = 'HcthCongVanDen:GetPhanHoi';
export const HcthCongVanDenGetChiDao = 'HcthCongVanDen:GetChiDao';
export const HcthCongVanDenSearch = 'HcthCongVanDen:Search';
export const HcthCongVanDenGetStaffPage = 'HcthCongVanDen:GetStaggPage';
export const HcthCongVanDenAddCanBoChiDao = 'HcthCongVanDen:AddCanBoChiDao';
export const HcthCongVanDenRemoveCanBoChiDao = 'HcthCongVanDen:RemoveCanBoChiDao';
export const HcthCongVanDenUpdateTrangThai = 'HcthCongVanDen:UpdateTrangThai';

export default function congVanDenReducer(state = {}, data) {
    switch (data.type) {
        case HcthCongVanDenGet:
            return Object.assign({}, state, { item: data.item });
        case HcthCongVanDenSearchPage:
            return Object.assign({}, state, { page: data.page });
        case HcthCongVanDenSearch:
            return Object.assign({}, state, { search: data.search });
        case HcthCongVanDenGetPhanHoi:
            return Object.assign({}, state, { item: { ...(state?.item || {}), phanHoi: data.phanHoi } });
        case HcthCongVanDenGetChiDao:
            return Object.assign({}, state, { item: { ...(state?.item || {}), danhSachChiDao: data.chiDao } });
        case HcthCongVanDenGetMorePage:
            const newPageInfo = data.page;
            const newList = [...state.page.list, ...newPageInfo.list];
            newPageInfo.list = newList;
            return Object.assign({}, state, { page: newPageInfo });
        case HcthCongVanDenGetStaffPage:
            return Object.assign({}, state, { item: { ...(state?.item || {}), staff: data.page } });
        case HcthCongVanDenAddCanBoChiDao:
            const canBoChiDaoBefore = state?.item?.quyenChiDao.length > 0 ? state?.item?.quyenChiDao.split(',') : [];
            canBoChiDaoBefore.push(data.quyenChiDao);
            return Object.assign({}, state, { item: { ...(state?.item || {}), quyenChiDao: canBoChiDaoBefore.join(',') } })
        case HcthCongVanDenRemoveCanBoChiDao:
            const oldCanBoChiDao = state?.item?.quyenChiDao.split(',');
            const removeCanBoChiDao = data.quyenChiDao.split(',');
            const newCanBoChiDao = oldCanBoChiDao.filter(cb => !removeCanBoChiDao.includes(cb));
            return Object.assign({}, state, { item: { ...(state?.item || {}), quyenChiDao: [...newCanBoChiDao].join(',') } })
        case HcthCongVanDenUpdateTrangThai:
            return Object.assign({}, state, { item: { ...(state?.item || {}), trangThai: data.trangThai } })
        default:
            return state;
    }
};


export function getHcthCongVanDenSearchPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    return dispatch => {
        const url = `/api/hcth/van-ban-den/search/page/${pageNumber}/${pageSize}?${T.objectToQueryString({ condition: pageCondition, filter })}`;
        T.get(url).then(data => {
            if (data.error) {
                T.alert('Công văn đến', 'Lấy danh sách công văn đến bị lỗi');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (pageCondition) data.page.pageCondition = pageCondition;
                if (filter) data.page.filter = filter;
                dispatch({ type: HcthCongVanDenSearchPage, page: data.page });
                done && done(data.page);
            }
        }).catch(error => console.error(`GET: ${url}.`, error));
    };
};

export function getMoreCongVanDenPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    return dispatch => {
        const url = `/api/hcth/van-ban-den/search/page/${pageNumber}/${pageSize}?${T.objectToQueryString({ condition: pageCondition, filter })}`;
        T.get(url).then(data => {
            if (data.error) {
                T.alert('Công văn đến', 'Lấy danh sách công văn đến bị lỗi');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (pageCondition) data.page.pageCondition = pageCondition;
                if (filter) data.page.filter = filter;
                dispatch({ type: HcthCongVanDenGetMorePage, page: data.page });
                done && done(data.page);
            }
        }).catch(error => console.error(`GET: ${url}.`, error));
    };
}

export function getCongVanDen(id, context, done) {
    console.log(id);
    if (typeof context === 'function') {
        done = context;
        context = {};
    }
    return dispatch => {
        const url = `/api/hcth/van-ban-den/${id}`;
        T.get(url, { params: context }).then(data => {
            if (data.error) {
                if (data.error.status == 401) {
                    console.error('GET: ' + url + '.', data.error.message);
                }
                else
                    console.error('GET: ' + url + '.', data.error);
                T.alert('Công văn đến', 'Lấy công văn đến bị lỗi!');
            } else {
                dispatch({ type: HcthCongVanDenGet, item: data.item });
                done && done(data.item);
            }
        }).catch(() => T.alert('Công văn đến', 'Lấy công văn đến bị lỗi!'));
    };
};

export function createPhanHoi(data, done) {
    return () => {
        const url = '/api/hcth/van-ban-den/phan-hoi';
        T.post(url, { data }).then(res => {
            if (res.error) {
                T.alert('Công văn đến', 'Thêm phản hồi bị lỗi');
                console.error('POST: ' + url + '. ', res.error);
            } else {
                done && done(data);
            }
        }).catch(() => T.alert('Công văn đến', 'Thêm phản hồi bị lỗi'));
    };
}

export function getPhanHoi(id, done) {
    return dispatch => {
        const url = `/api/hcth/van-ban-den/phan-hoi/${id}`;
        T.get(url).then(res => {
            if (res.error) {
                T.alert('Công văn đến', 'Lấy danh sách phản hồi lỗi');
                console.error('GET: ' + url + '. ', res.error);
            } else {
                dispatch({ type: HcthCongVanDenGetPhanHoi, phanHoi: res.items });
                done && done(res.items);
            }
        }).catch(() => T.alert('Công văn đến', 'Lấy danh sách phản hồi lỗi'));
    };
}

export function createChiDao(data, done) {
    return () => {
        const url = '/api/hcth/van-ban-den/chi-dao';
        T.post(url, { data }).then(res => {
            if (res.error) {
                T.alert('Công văn đến', 'Thêm chỉ đạo bị lỗi');
                console.error('POST: ' + url + '. ', res.error);
            } else {
                done && done(data);
            }
        }).catch(() => T.alert('Công văn đến', 'Thêm chỉ đạo bị lỗi'));
    };
}

export function traLaiCongVan(data, done) {
    return () => {
        const url = '/api/hcth/van-ban-den/tra-lai';
        T.put(url, data).then(res => {
            if (res.error) {
                T.alert('Công văn đến', 'Trả lại công văn lỗi.\n' + res.error.errorMessage || '');
                console.error('PUT: ' + url + '. ', res.error);
            } else {
                done && done(data);
            }
        }).catch(() => T.alert('Công văn đến', 'Trả lại công văn lỗi'));
    };
}

export function duyetCongVan(data, done) {
    return () => {
        const url = '/api/hcth/van-ban-den/duyet';
        T.put(url, data).then(res => {
            if (res.error) {
                T.alert('Công văn đến', 'Duyệt công văn lỗi.\n' + res.error.errorMessage || '');
                console.error('PUT: ' + url + '. ', res.error);
            } else {
                done && done(data);
            }
        }).catch(() => T.alert('Công văn đến', 'Duyệt công văn lỗi'));
    };
}

export function getChiDao(id, done) {
    return dispatch => {
        const url = `/api/hcth/van-ban-den/chi-dao/${id}`;
        T.get(url).then(res => {
            if (res.error) {
                T.alert('Công văn đến', 'Lấy công văn chỉ đạo lỗi');
                console.error('POST: ' + url + '. ', res.error);
            } else {
                dispatch({ type: HcthCongVanDenGetChiDao, chiDao: res.items });
                done && done(res.items);
            }
        }).catch((error) => { console.log(error); T.alert('Công văn đến', 'Lấy công văn chỉ đạo lỗi') });
    };
}

export const SelectAdapter_DmDonViGuiCongVan = {
    url: '/api/danh-muc/don-vi-gui-cong-van/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: item.ten })) : [] }),
    fetchOne: (id, done) => (getDmDonViGuiCv(id, (item) => done && done({ id: item.id, text: item.ten })))(),
};

export function getDmDonViGuiCv(id, done) {
    return () => {
        const url = `/api/danh-muc/don-vi-gui-cong-van/item/${id}`;
        T.get(url, { id }).then(data => {
            if (data.error) {
                T.alert('Cảnh báo', 'Lấy thông tin đơn vị gửi công văn bị lỗi');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }).catch(error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}
export function getStaffPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    // const page = T.updatePage( pageNumber, pageSize, pageCondition, filter);
    return () => {
        const url = `/api/staff/page/${pageNumber}/${pageSize}?${T.objectToQueryString({ condition: pageCondition, filter })}`;
        T.get(url).then(data => {
            if (data.error) {
                T.alert('Công văn đến', 'Lấy danh sách cán bộ bị lỗi');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.page);
            }
        }).catch(error => {
            console.log(error);
            T.notify('Lấy danh sách cán bộ bị lỗi', 'danger');

        });
    };
}

export function updateQuyenChiDao(id, shcc, trangThaiCv, status, done) {
    return (dispatch) => {
        const url = '/api/hcth/van-ban-den/quyen-chi-dao';
        T.post(url, { id, shcc, trangThaiCv, status }).then(res => {
            if (status) {
                dispatch({ type: HcthCongVanDenAddCanBoChiDao, quyenChiDao: shcc});
                dispatch({ type: HcthCongVanDenUpdateTrangThai, trangThai: trangThaiCv });
            } else {
                dispatch({ type: HcthCongVanDenRemoveCanBoChiDao, quyenChiDao: shcc});
                dispatch({ type: HcthCongVanDenUpdateTrangThai, trangThai: trangThaiCv });
            }
            done && done(res);
        })
        .catch((error) => {
            console.log(error);
            T.alert('Công văn đến', 'Thêm cán bộ chỉ đạo lỗi');
        });
    };
}
