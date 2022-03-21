import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const hcthCongVanDiGetAll = 'hcthCongVanDi:GetAll';
const hcthCongVanDiGetPage = 'hcthCongVanDi:GetPage';
const hcthCongVanDiSearchPage = 'hcthCongVanDi:SearchPage';

export default function hcthCongVanDiReducer(state = null, data) {
    switch (data.type) {
        case hcthCongVanDiGetAll:
            return Object.assign({}, state, { items: data.items });
        case hcthCongVanDiGetPage:
            return Object.assign({}, state, { page: data.page });
        case hcthCongVanDiSearchPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageHcthCongVanDi');
export function getHcthCongVanDiPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageHcthCongVanDi', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/hcth/cong-van-di/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sách công văn đi bị lỗi!, 1', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: hcthCongVanDiGetPage, page: data.page });
                done && done(data.page);
            }
        }, () => T.notify('Lấy danh sách sách công văn đi bị lỗi!, 2', 'danger'));
    };
}

export function getHcthCongVanDiAll(done) {
    return dispatch => {
        const url = '/api/hcth/cong-van-di/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách công văn đi bị lỗi, 3' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
                dispatch({ type: hcthCongVanDiGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách công văn đi bị lỗi, 4' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getHcthCongVanDi(id, done) {
    return () => {
        const url = `/api/hcth/cong-van-di/item/${id}`;
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify('Lấy thông tin đơn vị gửi công văn bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function createHcthCongVanDi(data, done){
    return dispatch => {
        const url = '/api/hcth/cong-van-di';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm công văn đi bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                if (done) {
                    T.notify('Thêm công văn đi thành công!', 'success');
                    dispatch(getHcthCongVanDiSearchPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Thêm công văn đi bị lỗi', 'danger'));
    };
}

export function updateHcthCongVanDi(id, changes, done) {
    return dispatch => {
        const url = '/api/hcth/cong-van-di';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật công văn đi bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật công văn đi thành công!', 'success');
                dispatch(getHcthCongVanDiSearchPage());
                done && done();
            }
        }, () => T.notify('Cập nhật công văn đi bị lỗi!', 'danger'));
    };
}

export function deleteHcthCongVanDi(id) {
    return dispatch => {
        const url = '/api/hcth/cong-van-di';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa công văn đi bị lỗi!, lỗi 1', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Xóa công văn đi thành công!', 'success');
                dispatch(getHcthCongVanDiSearchPage());
            }
        }, () => T.notify('Xóa công văn đi bị lỗi!', 'danger'));
    };
}

T.initPage('searchPageHcthCongVanDi', true);
export function getHcthCongVanDiSearchPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageHcthCongVanDi', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/hcth/cong-van-di/search/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách công văn đến bị lỗi, s1' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                // T.notify(page.filter)
            //    console.log("data" + data);
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: hcthCongVanDiSearchPage, page: data.page });
                done && done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}