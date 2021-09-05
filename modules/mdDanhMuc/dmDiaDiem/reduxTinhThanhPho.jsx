import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmTinhThanhPhoGetPage = 'DmTinhThanhPho:GetPage';
const DmTinhThanhPhoGetAll = 'DmTinhThanhPho:GetAll';

export default function dmTinhThanhPhoReducer(state = null, data) {
    switch (data.type) {
        case DmTinhThanhPhoGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmTinhThanhPhoGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getDMTinhThanhPhoAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/tinh-thanh-pho/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách tỉnh thành phố bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmTinhThanhPhoGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách tỉnh thành phố bị lỗi!', 'danger'));
    };
}

T.initPage('dmTinhThanhPho');
export function getDMTinhThanhPhoPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmTinhThanhPho', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/tinh-thanh-pho/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách tỉnh / thành phố bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmTinhThanhPhoGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách tỉnh / thành phố bị lỗi!', 'danger'));
    };
}

export function updateDMTinhThanhPho(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/tinh-thanh-pho';
        T.put(url, { ma, changes }, data => {
            done && done(data.error, data.item);
            if (data.error) {
                T.notify('Cập nhật thông tỉnh / thành phố bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật thông tin tỉnh / thành phố thành công!', 'success');
                dispatch(getDMTinhThanhPhoPage());
            }
        }, error => done(error));
    };
}

export function createMultiDMTinhThanhPho(multiDMTinhThanhPho, isOverride, done) {
    return dispatch => {
        const url = '/api/danh-muc/tinh-thanh-pho/multiple';
        T.post(url, { multiDMTinhThanhPho, isOverride }, data => {
            done && done(data.error, data.item);
            if (data.error) console.error(`POST: ${url}. ${data.error}`);
        }, error => done(error));
    };
}

export function createDMTinhThanhPho(dmTinhThanhPho, done) {
    return dispatch => {
        const url = '/api/danh-muc/tinh-thanh-pho';
        T.post(url, { dmTinhThanhPho }, data => {
            if (data.error) {
                console.error(`POST: ${url}. ${data.error}`);
                T.notify('Tạo thông tin tỉnh / thành phố bị lỗi!', 'danger');
            } else {
                dispatch(getDMTinhThanhPhoPage());
                done && done(data);
                T.notify('Tạo thông tin tỉnh / thành phố thành công!', 'success');
            }
        }, error => done(error));
    };
}

export function deleteDMTinhThanhPho(ma) {
    return dispatch => {
        const url = '/api/danh-muc/tinh-thanh-pho';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa thông tin tỉnh / thành phố bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Xoá thành công!', 'success', false, 800);
                dispatch(getDMTinhThanhPhoPage());
            }
        }, error => T.notify('Xóa thông tin tỉnh / thành phố bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_DmTinhThanhPho = {
    ajax: false,
    getAll: getDMTinhThanhPhoAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    condition: { kichHoat: 1 },
};