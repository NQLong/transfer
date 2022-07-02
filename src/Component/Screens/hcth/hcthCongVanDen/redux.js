import T from '@/Utils/common';


export const HcthCongVanDenSearchPage = 'HcthCongVanDen:SearchPage';
export const HcthCongVanDenGet = 'HcthCongVanDen:Get';
export const HcthCongVanDenGetMorePage = 'HcthCongVanDen:GetMorePage';
export const HcthCongVanDenGetPhanHoi = 'HcthCongVanDen:GetPhanHoi';
export const HcthCongVanDenGetChiDao = 'HcthCongVanDen:GetChiDao';

export default function congVanDenReducer(state = {}, data) {
    switch (data.type) {
        case HcthCongVanDenGet:
            return Object.assign({}, state, { item: data.item });
        case HcthCongVanDenSearchPage:
            return Object.assign({}, state, { page: data.page });
        case HcthCongVanDenGetPhanHoi:
            return Object.assign({}, state, { item: { ...(state?.item || {}), phanHoi: data.phanHoi } });
        case HcthCongVanDenGetChiDao:
            return Object.assign({}, state, { item: { ...(state?.item || {}), danhSachChiDao: data.chiDao } });
        case HcthCongVanDenGetMorePage:
            const newPageInfo = data.page;
            const newList = [...state.page.list, ...newPageInfo.list];
            newPageInfo.list = newList;
            return Object.assign({}, state, { page: newPageInfo });
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
        const url = `/api/hcth/cong-van-den/search/page/${pageNumber}/${pageSize}?${T.objectToQueryString({ condition: pageCondition, filter })}`;
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
        const url = `/api/hcth/cong-van-den/search/page/${pageNumber}/${pageSize}?${T.objectToQueryString({ condition: pageCondition, filter })}`;
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
    if (typeof context === 'function') {
        done = context;
        context = {};
    }
    return dispatch => {
        const url = `/api/hcth/cong-van-den/${id}`;
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
        const url = '/api/hcth/cong-van-den/phan-hoi';
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
        const url = `/api/hcth/cong-van-den/phan-hoi/${id}`;
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
        const url = '/api/hcth/cong-van-den/chi-dao';
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
        const url = '/api/hcth/cong-van-den/tra-lai';
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

export function getChiDao(id, done) {
    return dispatch => {
        const url = `/api/hcth/cong-van-den/chi-dao/${id}`;
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
