import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const hcthCongVanDiGetAll = 'hcthCongVanDi:GetAll';
const hcthCongVanDiGetPage = 'hcthCongVanDi:GetPage';

export default function hcthCongVanDiReducer(state = null, data) {
    switch (data.type) {
        case hcthCongVanDiGetAll:
            return Object.assign({}, state, { items: data.items });
        case hcthCongVanDiGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export const PageName = 'pageHcthCongVanDi';
T.initPage(PageName);
export function getHcthCongVanDiPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageHcthCongVanDi', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/hcth/cong-van-di/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách công văn đi bị lỗi, lỗi 1' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: hcthCongVanDiGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách công văn đi bị lỗi, lỗi 2' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
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
                if (done) done(data.items);
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
                    dispatch(getHcthCongVanDiPage());
                    if (done) done(data);
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
                done && done();
                dispatch(getHcthCongVanDiPage());
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
                dispatch(getHcthCongVanDiPage());
            }
        }, () => T.notify('Xóa công văn đi bị lỗi!', 'danger'));
    };
}