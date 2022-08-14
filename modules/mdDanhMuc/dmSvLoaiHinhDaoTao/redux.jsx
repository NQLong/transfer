import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmSvLoaiHinhDaoTaoGetPage = 'DmSvLoaiHinhDaoTao:GetPage';
const DmSvLoaiHinhDaoTaoUpdate = 'DmSvLoaiHinhDaoTao:Update';

export default function DmSvLoaiHinhDaoTaoReducer(state = null, data) {
    switch (data.type) {
        case DmSvLoaiHinhDaoTaoGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmSvLoaiHinhDaoTaoUpdate:
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
T.initPage('pageDmSvLoaiHinhDaoTao');

export function getDmSvLoaiHinhDaoTaoPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmSvLoaiHinhDaoTao', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/he-dao-tao/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại hình bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmSvLoaiHinhDaoTaoGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách loại hình bị lỗi!', 'danger'));
    };
}

export function getDmSvLoaiHinhDaoTao(ma, done) {
    return () => {
        const url = `/api/danh-muc/he-dao-tao/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin loại hình bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmSvLoaiHinhDaoTao(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/he-dao-tao';
        T.post(url, { data: item }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo loại hình bị lỗi', 'danger');
                console.error(`POST: ${url}.`, data.error);
                if (done) done(data.error);
            } else {
                T.notify('Tạo mới thông tin loại hình thành công!', 'success');
                dispatch(getDmSvLoaiHinhDaoTaoPage());
                if (done) done(data);
            }
        }, () => T.notify('Tạo loại hình bị lỗi!', 'danger'));
    };
}

export function deleteDmSvLoaiHinhDaoTao(ma) {
    return dispatch => {
        const url = '/api/danh-muc/he-dao-tao';
        T.delete(url, { ma: ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục loại hình bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmSvLoaiHinhDaoTaoPage());
            }
        }, () => T.notify('Xóa loại hình bị lỗi!', 'danger'));
    };
}

export function updateDmSvLoaiHinhDaoTao(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/he-dao-tao';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật thông tin loại hình bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin loại hình thành công!', 'success');
                dispatch(getDmSvLoaiHinhDaoTaoPage());
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin loại hình bị lỗi!', 'danger'));
    };
}

export function changeDmSvLoaiHinhDaoTao(item) {
    return { type: DmSvLoaiHinhDaoTaoUpdate, item };
}

export const SelectAdapter_DmSvLoaiHinhDaoTao = {
    ajax: true,
    url: '/api/danh-muc/he-dao-tao/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDmSvLoaiHinhDaoTao(ma, item => done && done({ id: item.ma, text: item.ten })))()
};


export const SelectAdapter_DmSvLoaiHinhDaoTaoFilter = {
    ajax: true,
    url: '/api/danh-muc/he-dao-tao/filter',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDmSvLoaiHinhDaoTao(ma, item => done && done({ id: item.ma, text: item.ten })))()
};