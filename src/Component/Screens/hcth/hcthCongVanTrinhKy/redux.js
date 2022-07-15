import T from '@/Utils/common';

export const HcthCongVanTrinhKySearchPage = 'HcthCongVanTrinhKy:SearchPage';

export default function congVanTrinhKyReducer(state = {}, data) {
    switch (data.type) {
        case HcthCongVanTrinhKySearchPage:
            return Object.assign({}, state, { page: data.page });
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