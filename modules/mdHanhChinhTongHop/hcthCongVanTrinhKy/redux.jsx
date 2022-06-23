import T from 'view/js/common';

const HcthCongVanTrinhKyCreate = 'HcthCongVanTrinhKy:Create';
const HcthCongVanTrinhKySearchPage = 'HcthCongVanTrinhKy:SearchPage';
const HcthCongVanTrinhKyGet = 'HcthCongVanTrinhKy:Get';

export default function hcthCongVanDiReducer(state = null, data) {
    switch (data.type) {
        case HcthCongVanTrinhKySearchPage:
            return Object.assign({}, state, { page: data.page });
        case HcthCongVanTrinhKyGet:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
};

export function createCongVanTrinhKy(data, done) {
    return dispatch => {
        console.log('ajinomoto')
        const url = '/api/hcth/cong-van-trinh-ky';
        T.post(url, data, res => {
            console.log(res)
            if (res.error) {
                T.notify('Tạo công văn trình kí lỗi', 'danger');
                console.error('POST: ' + url + '.', res.error);
            } else {
                done && done();
            }
        }, () => T.notify('Tạo công văn trình kí lỗi', 'danger'))

    }
};

T.initPage('pageHcthCongVanTrinhKy');
export function searchCongVanTrinhKy(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageHcthCongVanTrinhKy', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        dispatch({ type: HcthCongVanTrinhKySearchPage, page: null });
        const url = `/api/hcth/cong-van-trinh-ky/search/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách công văn trình ký bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: HcthCongVanTrinhKySearchPage, page: data.page });
                done && done(data.page);
            }
        }, () => T.notify('Lấy danh sách công văn trình ký bị lỗi', 'danger'));
    };
}

export function getCongVanTrinhKy(id, done) {
    return dispatch => {
        dispatch({type: HcthCongVanTrinhKyGet, item: null});
        const url = `/api/hcth/cong-van-trinh-ky/${id}`;
        T.get(url, res => {
            if (res.error) {
                T.notify('Lấy công văn trình ký lỗi', 'danger');
                console.error('GET: ' + url, res.error);
            }
            else {
                T.notify('Lấy công văn trình ký thành công', 'success');
                console.log('hello', res.item);
                dispatch({type: HcthCongVanTrinhKyGet, item: res.item});
                done && done(res.item);
            }
        })
    }
}
