import T from '@/Utils/common';

export const HcthCongVanTrinhKySearchPage = 'HcthCongVanTrinhKy:SearchPage';
export const HcthCongVanTrinhKyGet = 'HcthCongVanTrinhKy:Get';
export const HcthCongVanTrinhKyGetMorePage = 'HcthCongVanTrinhKy:GetMorePage';

export default function congVanTrinhKyReducer(state = {}, data) {
    switch (data.type) {
        case HcthCongVanTrinhKySearchPage:
            return Object.assign({}, state, { page: data.page });
        case HcthCongVanTrinhKyGet:
            return Object.assign({}, state, { item: data.item });
        case HcthCongVanTrinhKyGetMorePage:
            const newPage = data.page;
            const newList = [...state.page.list, ...newPage.list];
            newPage.list = newList;
            return Object.assign({}, state, { page: newPage });
        default:
            return state;
    }
};

export function getHcthCongVanTrinhKySearchPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }

    return dispatch => {
        const url = `/api/hcth/cong-van-trinh-ky/search/page/${pageNumber}/${pageSize}?${T.objectToQueryString({ condition: pageCondition, filter })}`;
        T.get(url).then(data => {
            if (data.error) {
                T.alert('Công văn trình ký', 'Lấy danh sách công văn bị lỗi');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (pageCondition) data.page.pageCondition = page.pageCondition;
                if (filter) data.page.filter = filter;
                dispatch({ type: HcthCongVanTrinhKySearchPage, page: data.page });
                done && done(data.page);
            }
        }).catch(error => console.error(`GET: ${url}.`, error));
    };
};

export function getMoreHcthCongVanTrinhKyPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }

    return dispatch => {
        const url = `/api/hcth/cong-van-trinh-ky/search/page/${pageNumber}/${pageSize}?${T.objectToQueryString({ condition: pageCondition, filter })}`;
        T.get(url).then(data => {
            if (data.error) {
                T.alert('Công văn trình ký', 'Lấy danh sách công văn bị lỗi');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (pageCondition) data.page.pageCondition = page.pageCondition;
                if (filter) data.page.filter = filter;
                dispatch({ type: HcthCongVanTrinhKyGetMorePage, page: data.page });
                done && done(data.page);
            }
        }).catch(error => console.error(`GET: ${url}.`, error));
    };
};

export function getCongVanTrinhKy(id, context, done) {
    if (typeof context === 'function') {
        done = context;
        context = {};
    }

    return dispatch => {
        const url = `/api/hcth/cong-van-trinh-ky/${id}`;
        T.get(url, { params: context }).then(data => {
            if (data.error) {
                T.alert('Công văn trình ký', 'Lấy công văn trình ký bị lỗi!');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: HcthCongVanTrinhKyGet, item: data.item });
                done && done(data.item);
            }
        }).catch(() => T.alert('Công văn trình ký', 'Lấy công văn trình ký bị lỗi!'));
    }
}

export function getChuKyDienTuVanBanDi(data, done) {
    return () => {
        const url = '/api/hcth/ky-dien-tu/van-ban-di';
        T.get(url, { params: data }).then(res => {
            if (res.error) {
                T.alert('Lỗi', 'Lấy chữ kí điện tử lỗi');
                console.error('GET: ' + url + '.', res.error);
            } else {
                done(res);
            }
        }).catch((error) => {
            T.alert('Lỗi', 'Lấy chữ kí điện tử lỗi')
        });
    }
}

