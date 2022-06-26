import T from '@/Utils/common';


const HcthCongVanDenSearchPage = 'HcthCongVanDen:SearchPage'
const HcthCongVanDenGet = 'HcthCongVanDen:Get';

export default function congVanDenReducer(state = {}, data) {
    switch (data.type) {
        case HcthCongVanDenGet:
            return Object.assign({}, state, { item: data.item });
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
                    // dispatch({ type: HcthCongVanDenGetError, error: 401 });
                    console.error('GET: ' + url + '.', data.error.message);
                }
                else
                    console.error('GET: ' + url + '.', data.error);
                T.alert('Công văn đến', 'Lấy công văn đến bị lỗi!');
            } else {
                dispatch({ type: HcthCongVanDenGet, item: data.item });
                done && done(data.item);
            }
        }).catch(() => T.alert('Công văn đến', 'Xóa file đính kèm bị lỗi!'));
    };
};
