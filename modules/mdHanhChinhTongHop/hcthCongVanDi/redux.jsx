import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const hcthCongVanDiGetAll = 'hcthCongVanDi:GetAll';
const hcthCongVanDiGetPage = 'hcthCongVanDi:GetPage';
const hcthCongVanDiSearchPage = 'hcthCongVanDi:SearchPage';
const hcthCongVanDiGet = 'hcthCongVanDi:Get';

export default function hcthCongVanDiReducer(state = null, data) {
    switch (data.type) {
        case hcthCongVanDiGetAll:
            return Object.assign({}, state, { items: data.items });
        case hcthCongVanDiGetPage:
            return Object.assign({}, state, { page: data.page });
        case hcthCongVanDiSearchPage:
            return Object.assign({}, state, { page: data.page });
        case hcthCongVanDiGet:
            return Object.assign({}, state, { page: data.item });
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
                T.notify('Lấy danh sách sách công văn giữa các phòng bị lỗi!, 1', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: hcthCongVanDiGetPage, page: data.page });
                done && done(data.page);
            }
        }, () => T.notify('Lấy danh sách sách công văn giữa các phòng bị lỗi!, 2', 'danger'));
    };
}

export function getHcthCongVanDiAll(done) {
    return dispatch => {
        const url = '/api/hcth/cong-van-di/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách công văn giữa các phòng bị lỗi, 3' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
                dispatch({ type: hcthCongVanDiGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách công văn giữa các phòng bị lỗi, 4' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
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
                T.notify('Thêm công văn giữa các phòng bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                // console.log(data);
                T.notify('Thêm công văn giữa các phòng thành công!', 'success');
                dispatch(getHcthCongVanDiSearchPage());
                done && done(data);
            }
        }, () => T.notify('Thêm công văn giữa các phòng bị lỗi', 'danger'));
    };
}

export function updateHcthCongVanDi(id, changes, done) {
    return dispatch => {
        const url = '/api/hcth/cong-van-di';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật công văn giữa các phòng bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật công văn giữa các phòng thành công!', 'success');
                dispatch(getHcthCongVanDiSearchPage());
                done && done();
            }
        }, () => T.notify('Cập nhật công văn giữa các phòng bị lỗi!', 'danger'));
    };
}

export function deleteHcthCongVanDi(id) {
    return dispatch => {
        const url = '/api/hcth/cong-van-di';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa công văn giữa các phòng bị lỗi!, lỗi 1', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Xóa công văn giữa các phòng thành công!', 'success');
                dispatch(getHcthCongVanDiSearchPage());
            }
        }, () => T.notify('Xóa công văn giữa các phòng bị lỗi!', 'danger'));
    };
}

// T.initPage('searchPageHcthCongVanDi', true);
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
                // console.log("data" + data);
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: hcthCongVanDiSearchPage, page: data.page });
                done && done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function deleteFile(id, index, file, done) {
    return () => {
        const url = '/api/hcth/cong-van-di/delete-file';
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


export function getCongVanDi(id, done) {
    return dispatch => {
        const url = `/api/hcth/cong-van-di/${id}`;
        T.get(url, data => {
            if (data.error) {
                console.error('GET: ' + url + '.', data.error);
                T.notify('Lấy công văn giữa các phòng bị lỗi!', 'danger');
            } else {
                // T.notify('Lấy công văn giữa các phòng thành công!', 'success');
                // console.log(data.item);
                dispatch({ type: hcthCongVanDiGet, item: data.item });
                done && done(data.item);
            }
        }, () => T.notify('Xóa file đính kèm bị lỗi!', 'danger'));
    };
}