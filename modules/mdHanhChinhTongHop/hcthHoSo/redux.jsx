import T from 'view/js/common';

const HcthHoSoSearchPage = 'HcthHoSo:SearchPage';
const HcthHoSoGet = 'HcthHoSo:Get';

export default function hcthHoSoReducer(state = null, data) {
    switch (data.type) {
        case HcthHoSoSearchPage:
            return Object.assign({}, state, { page: data.page });
        case HcthHoSoGet:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}

T.initPage('pageHcthHoSo');
export function getHoSoSearchPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }

    const page = T.updatePage('pageHcthHoSo', pageNumber, pageSize, pageCondition, filter);

    return dispatch => {
        const url = `/api/hcth/ho-so/search/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            // console.log(data);
            if (data.error) {
                T.notify('Lấy danh sách hồ sơ bị lỗi', 'danger', data);
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: HcthHoSoSearchPage, page: data.page });
                done && done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createHoSo(data, done) {
    return () => {
        const url = '/api/hcth/ho-so';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo hồ sơ bị lỗi', 'danger');
                console.error('POST: ' + url + '.', res.error);
            } else {
                T.notify('Tạo hồ sơ thành công', 'success');
                done && done();
            }
        }, () => T.notify('Tạo hồ sơ bị lỗi', 'danger'));
    };
}

export function getHoSo(id, done) {
    return dispatch => {
        const url = `/api/hcth/ho-so/${id}`;
        T.get(url, res => {
            if (res.error) {
                T.notify('Lấy hồ sơ bị lỗi', 'danger');
                console.error('GET: ' + url + '.', res.error);
            } else {
                // console.log(res);
                T.notify('Lấy hồ sơ thành công', 'success');
                dispatch({ type: HcthHoSoGet, item: res.item });
                done && done(res.item);
            }
        });
    };
}

export function deleteVanBan(id, vanBanId, done) {
    return () => {
        const url = '/api/hcth/ho-so';
        T.delete(url, { id, vanBanId }, data => {
            if (data.error) {
                T.notify('Xoá văn bản bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Xoá văn bản thành công!', 'success');
                done && done();
            }
        }, () => T.notify('Xoá văn bản bị lỗi', 'danger'));
    };
}