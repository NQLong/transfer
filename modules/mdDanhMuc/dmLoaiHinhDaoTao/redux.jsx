import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmLoaiHinhDaoTaoGetAll = 'DmLoaiHinhDaoTao:GetAll';
const DmLoaiHinhDaoTaoGetPage = 'DmLoaiHinhDaoTao:GetPage';
const DmLoaiHinhDaoTaoUpdate = 'DmLoaiHinhDaoTao:Update';

export default function DmLoaiHinhDaoTaoReducer(state = null, data) {
    switch (data.type) {
        case DmLoaiHinhDaoTaoGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmLoaiHinhDaoTaoGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmLoaiHinhDaoTaoUpdate:
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
export const PageName = 'pageDmLoaiHinhDaoTao';
T.initPage(PageName);
export function getDmLoaiHinhDaoTaoPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/comment/loai-hinh-dao-tao/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại hình đào tạo bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmLoaiHinhDaoTaoGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách loại hình đào tạo bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmLoaiHinhDaoTaoAll(condition, done) {
    return dispatch => {
        const url = '/api/danh-muc/comment/loai-hinh-dao-tao/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại hình đào tạo bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmLoaiHinhDaoTaoGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách loại hình đào tạo bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmLoaiHinhDaoTao(ma, done) {
    return () => {
        const url = `/api/danh-muc/comment/loai-hinh-dao-tao/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin loại hình đào tạo bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmLoaiHinhDaoTao(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/comment/loai-hinh-dao-tao';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo tình trạng sinh viên bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo thông loại hình đào tạo thành công!', 'success');
                dispatch(getDmLoaiHinhDaoTaoPage());
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo loại hình đào tạo bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmLoaiHinhDaoTao(ma) {
    return dispatch => {
        const url = '/api/danh-muc/comment/loai-hinh-dao-tao';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục loại hình đào tạo bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmLoaiHinhDaoTaoPage());
            }
        }, (error) => T.notify('Xóa tình loại hình đào tạo bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmLoaiHinhDaoTao(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/comment/loai-hinh-dao-tao';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin loại hình đào tạo bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin loại hình đào tạo thành công!', 'success');
                done && done(data.item);
                dispatch(getDmLoaiHinhDaoTaoPage());
            }
        }, (error) => T.notify('Cập nhật thông tin loại hình đào tạo bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function changeDmLoaiHinhDaoTao(item) {
    return { type: DmLoaiHinhDaoTaoUpdate, item };
}

export const SelectAdapter_DmLoaiHinhDaoTao = {
    ajax: false,
    getAll: getDmLoaiHinhDaoTaoAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    condition: { kichHoat: 1 },
};

export const SelectAdapter_DmLoaiHinhDaoTaoV2 = {
    ajax: true,
    data: params => ({ condition: params.term, kichHoat: 1 }),
    url: '/api/danh-muc/comment/loai-hinh-dao-tao/page/1/20',
    getOne: getDmLoaiHinhDaoTao,
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDmLoaiHinhDaoTao(ma, item => done && done({ id: item.ma, text: item.ten })))(),
    processResultOne: response => response && ({ value: response.ma, text: response.ten }),
};