import T from 'view/js/common';

const HcthDangKySoSearchPage = 'HcthDangKySo:SearchPage';

export default function hcthDangKySoReducer(state = null, data) {
    switch (data.type) {
        case HcthDangKySoSearchPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ----------------------------------------------------------------------------------------------------
T.initPage('pageHcthDangKySo');


export function createSoTuDong(data, done) {
    return () => {
        const url = '/api/hcth/dang-ky-so/tu-dong';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo số tự động bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error('POST: ' + url + '.', res.error);
            } else {
                T.notify('Tạo số tự động thành công', 'success');
                done && done();
            }
        }, () => T.notify('Tạo số tự động bị lỗi!', 'danger'));
    };
}

export function createSoNhapTay(data, done) {
    return () => {
        const url = '/api/hcth/dang-ky-so/nhap-tay';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo số nhập tay bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error('POST: ' + url + '.', res.error);
            } else {
                T.notify('Tạo số nhập tay thành công', 'success');
                // dispatch(getDangKySearchPage());
                done && done();
            }
        }, () => T.notify('Tạo số nhập tay bị lỗi!', 'danger'));
    };
}

export function getDangKySearchPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }

    const page = T.updatePage('pageHcthDangKySo', pageNumber, pageSize, pageCondition, filter);

    return dispatch => {
        const url = `/api/hcth/dang-ky-so/search/page/${pageNumber}/${pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách số văn bản bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: HcthDangKySoSearchPage, page: data.page });
                done && done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getSo(id, done) {
    return () => {
        const url = `/api/hcth/dang-ky-so/${id}`;
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify('Lấy số bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    }
}

export const SelectAdapter_SoDangKy = {
    ajax: true,
    url: '/api/hcth/dang-ky-so/search/page/1/20',
    data: params => ({ condition: params.term, filter: { tab: 0 } }),
    processResults: response => {
        return (
            { results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: item.soCongVan })) : [] });
    },
    fetchOne: (id, done) => (getSo(id, item =>
        done && done({ id: item.id, text: item.soCongVan })
    ))()
};
