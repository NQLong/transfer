import T from '@/Utils/common';

export const HcthVanBanDiSearchPage = 'HcthVanBanDi:SearchPage';
export const HcthVanBanDiGet = 'HcthVanBanDi:Get';
export const HcthVanBanDiGetMorePage = 'HcthVanBanDi:GetMorePage';
export const HcthVanBanDiGetPhanHoi = 'HcthVanBanDi:GetPhanHoi';
export const HcthVanBanDiSearch = 'HcthVanBanDi:Search';

export default function vanBanDiReducer(state = {}, data) {
    switch (data.type) {
        case HcthVanBanDiSearchPage:
            return Object.assign({}, state, { page: data.page });
        case HcthVanBanDiGet:
            return Object.assign({}, state, { item: data.item });
        case HcthVanBanDiGetMorePage:
            const newPage = data.page;
            const newList = [...state.page.list, ...newPage.list];
            newPage.list = newList;
            return Object.assign({}, state, { page: newPage });
        case HcthVanBanDiGetPhanHoi:
            return Object.assign({}, state, { item: { ...(state?.item || {}), phanHoi: data.phanHoi } });
        case HcthVanBanDiSearch:
            return Object.assign({}, state, { search: data.search });
        default:
            return state;
    }
}

export function getHcthVanBanDiSearchPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }

    return dispatch => {
        const url = `/api/hcth/van-ban-di/search/page/${pageNumber}/${pageSize}?${T.objectToQueryString({ condition: pageCondition, filter })}`;
        T.get(url).then(data => {
            if (data.error) {
                T.alert('Văn bản đi', 'Lấy danh sách văn bản đi bị lỗi!');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (pageCondition) data.page.pageCondition = pageCondition;
                if (filter) data.page.filter = filter;
                dispatch({ type: HcthVanBanDiSearchPage, page: data.page });
                done && done(data.page);
            }
        }).catch(error => console.error(`GET: ${url}.`, error));
    };
}

export function getMoreHcthVanBanDiPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }

    return dispatch => {
        const url = `/api/hcth/van-ban-di/search/page/${pageNumber}/${pageSize}?${T.objectToQueryString({ condition: pageCondition, filter })}`;
        T.get(url).then(data => {
            if (data.error) {
                T.alert('Văn bản đi', 'Lấy danh sách văn bản đi bị lỗi');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (pageCondition) data.page.pageCondition = page.pageCondition;
                if (filter) data.page.filter = filter;
                dispatch({ type: HcthVanBanDiGetMorePage, page: data.page });
                done && done(data.page);
            }
        }).catch(error => console.error(`GET: ${url}.`, error));
    };
}

export function getVanBanDi(id, context, done) {
    if (typeof context === 'function') {
        done = context;
        context = {};
    }

    return dispatch => {
        const url = `/api/hcth/van-ban-di/${id}`;

        T.get(url, { params: context }).then(data => {
            console.log('res: ', data);
            if (data.error) {
                if (data.error.status === 401) {
                    console.error('GET: ' + url + '.', data.error.message);
                } else {
                    console.error('GET: ' + url + '.', data.error);
                }
                T.alert('Văn bản đi', 'Lấy văn bản đi bị lỗi');
            } else {
                dispatch({ type: HcthVanBanDiGet, item: data.item });
                done && done(data.item);
            }
        }).catch(() => T.alert('Văn bản đi', 'Lấy văn bản đi bị lỗi!'));
    };
}

export function createPhanHoi(data, done) {
    return () => {
        const url = '/api/hcth/van-ban-di/phan-hoi';
        T.post(url, { data }).then(res => {
            if (res.error) {
                T.alert('Văn bản đi', 'Thêm phản hồi bị lỗi');
                console.error('POST: ' + url + '.', res.error);
            } else {
                T.alert('Văn bản đi', 'Thêm phản hồi thành công');
                done && done(data);
            }
        }).catch(() => T.alert('Văn bản đi', 'Thêm phản hồi thất bại'));
    };
}

export function getPhanHoi(id, done) {
    return dispatch => {
        const url = `/api/hcth/van-ban-di/phan-hoi/${id}`;
        T.get(url).then(res => {
            if (res.error) {
                T.alert('Văn bản đi', 'Lấy danh sách phản hồi bị lỗi');
            } else {
                dispatch({ type: HcthVanBanDiGetPhanHoi, phanHoi: res.item });
                done && done(res.item);
            }
        }).catch(() => T.alert('Văn bản đi', 'Lấy danh sách phản hồi thất bại'));
    }
}