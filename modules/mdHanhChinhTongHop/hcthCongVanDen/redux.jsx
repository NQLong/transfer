import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const HcthCongVanDenGetAll = 'HcthCongVanDen:GetAll';
const HcthCongVanDenGetPage = 'HcthCongVanDen:GetPage';
const HcthCongVanDenSearchPage = 'HcthCongVanDen:SearchPage';
const HcthCongVanDenGet = 'HcthCongVanDen:Get';
// const HcthCongVanDenUpdate = 'HcthCongVanDen:Update';

export default function HcthCongVanDenReducer(state = null, data) {
    switch (data.type) {
        case HcthCongVanDenGet:
            return Object.assign({}, state, { item: data.item });
        case HcthCongVanDenGetAll:
            return Object.assign({}, state, { items: data.items });
        case HcthCongVanDenGetPage:
        case HcthCongVanDenSearchPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageHcthCongVanDen');
export function getHcthCongVanDenPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageHcthCongVanDen', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/hcth/cong-van-den/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sách công văn đến bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: HcthCongVanDenGetPage, page: data.page });
                done && done(data.page);
            }
        }, () => T.notify('Lấy danh sách sách công văn đến bị lỗi!', 'danger'));
    };
}

export function createHcthCongVanDen(data, done) {
    return dispatch => {
        const url = '/api/hcth/cong-van-den';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm công văn đến bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm công văn đến thành công!', 'success');
                dispatch(getHcthCongVanDenSearchPage());
                done && done(data);
            }
        }, () => T.notify('Thêm công văn đến bị lỗi', 'danger'));
    };
}

export function getHcthCongVanDenAll(done) {
    return dispatch => {
        const url = '/api/hcth/cong-van-den/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin công văn đến bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: HcthCongVanDenGetAll, items: data.items ? data.items : [] });
                done && done(data.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function updateHcthCongVanDen(id, changes, done) {
    return dispatch => {
        const url = '/api/hcth/cong-van-den';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật công văn đến bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật công văn đến thành công!', 'success');
                dispatch(getHcthCongVanDenSearchPage());
                done && done();
            }
        }, () => T.notify('Cập nhật công văn đến học bị lỗi!', 'danger'));
    };
}

export function deleteHcthCongVanDen(id) {
    return dispatch => {
        const url = '/api/hcth/cong-van-den';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa công văn đến bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Xóa công văn đến thành công!', 'success');
                dispatch(getHcthCongVanDenSearchPage());
            }
        }, () => T.notify('Xóa công văn đến học bị lỗi!', 'danger'));
    };
}

export function getHcthCongVanDenSearchPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageHcthCongVanDen', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/hcth/cong-van-den/search/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách công văn đến bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: HcthCongVanDenSearchPage, page: data.page });
                done && done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function deleteFile(id, index, file, done) {
    return () => {
        const url = '/api/hcth/cong-van-den/delete-file';
        T.put(url, { id, index, file }, data => {
            if (data.error) {
                console.error('PUT: ' + url + '.', data.error);
                T.notify('Xóa file đính kèm lỗi!', 'danger');
            } else {
                T.notify('Xóa file đính kèm thành công!', 'success');
                done && done();
            }
        }, () => T.notify('Xóa file đính kèm bị lỗi!', 'danger'));
    };
}


export function getCongVanDen(id, done) {
    return dispatch => {
        const url = `/api/hcth/cong-van-den/${id}`;
        T.get(url, data => {
            if (data.error) {
                console.error('GET: ' + url + '.', data.error);
                T.notify('Lấy công văn đến bị lỗi!', 'danger');
            } else {
                dispatch({ type: HcthCongVanDenGet, item: data.item });
                done && done(data.item);
            }
        }, () => T.notify('Xóa file đính kèm bị lỗi!', 'danger'));
    };
}