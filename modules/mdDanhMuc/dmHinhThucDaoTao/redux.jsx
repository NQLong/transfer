import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmHinhThucDaoTaoGetAll = 'DmHinhThucDaoTao:GetAll';
const DmHinhThucDaoTaoGetPage = 'DmHinhThucDaoTao:GetPage';
const DmHinhThucDaoTaoUpdate = 'DmHinhThucDaoTao:Update';

export default function dmHinhThucDaoTaoReducer(state = null, data) {
    switch (data.type) {
        case DmHinhThucDaoTaoGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmHinhThucDaoTaoGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmHinhThucDaoTaoUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].ma == updatedItem.ma) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].ma == updatedItem.ma) {
                            updatedPage.list.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                return Object.assign({}, state, { items: updatedItems, page: updatedPage });
            } else {
                return null;
            }

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('dmHinhThucDaoTaoPage', true);
export function getDmHinhThucDaoTaoPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmHinhThucDaoTaoPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/hinh-thuc-dao-tao/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hình thức đào tạo bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmHinhThucDaoTaoGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách hình thức đào tạo bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmHinhThucDaoTaoAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/hinh-thuc-dao-tao/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách hình thức đào tạo bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmHinhThucDaoTaoGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách hình thức đào tạo bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmHinhThucDaoTao(ma, done) {
    return () => {
        const url = `/api/danh-muc/hinh-thuc-dao-tao/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin hình thức đào tạo bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmHinhThucDaoTao(dmHinhThucDaoTao, done) {
    return dispatch => {
        const url = '/api/danh-muc/hinh-thuc-dao-tao';
        T.post(url, { dmHinhThucDaoTao }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một hình thức đào tạo bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới một hình thức đào tạo thành công!', 'success');
                dispatch(getDmHinhThucDaoTaoPage());
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo mới một hình thức đào tạo bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmHinhThucDaoTao(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/hinh-thuc-dao-tao';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu hình thức đào tạo bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật dữ liệu hình thức đào tạo thành công!', 'success');
                done && done(data.item);
                dispatch(getDmHinhThucDaoTaoPage());
            }
        }, (error) => T.notify('Cập nhật dữ liệu hình thức đào tạo bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmHinhThucDaoTao(ma, done) {
    return dispatch => {
        const url = '/api/danh-muc/hinh-thuc-dao-tao';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa hình thức đào tạo bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa hình thức đào tạo thành công!', 'success', false, 800);
                dispatch(getDmHinhThucDaoTaoPage());
            }
            done && done();
        }, () => T.notify('Xóa hình thức đào tạo bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_DmHinhThucDaoTao = {
    ajax: false,
    getAll: getDmHinhThucDaoTaoAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    condition: { kichHoat: 1 },
};

export const SelectAdapter_DmHinhThucDaoTaoV2 = {
    ajax: true,
    data: params => ({ condition: params.term, kichHoat: 1 }),
    url: '/api/danh-muc/hinh-thuc-dao-tao/page/1/20',
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDmHinhThucDaoTao(ma, item => done && done({ id: item.ma, text: item.ten })))(),
};