import T from '@/Utils/common';


const HcthCongVanDenSearchPage = 'HcthCongVanDen:SearchPage'

export default function congVanDenReducer(state = {}, data) {
    switch (data.type) {
        case HcthCongVanDenSearchPage:
            return Object.assign({}, state, { page: data.page });
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
            console.log(data);
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
}
