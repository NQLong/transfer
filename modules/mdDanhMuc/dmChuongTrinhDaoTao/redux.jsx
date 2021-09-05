import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmChuongTrinhDaoTaoGetAll = 'DmChuongTrinhDaoTao:GetAll';
const DmChuongTrinhDaoTaoGetPage = 'DmChuongTrinhDaoTao:GetPage';
const DmChuongTrinhDaoTaoUpdate = 'DmChuongTrinhDaoTao:Update';

export default function DmChuongTrinhDaoTaoReducer(state = null, data) {
    switch (data.type) {
        case DmChuongTrinhDaoTaoGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmChuongTrinhDaoTaoGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmChuongTrinhDaoTaoUpdate:
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
T.initPage('pageDmChuongTrinhDaoTao');
export function getDmChuongTrinhDaoTaoPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmChuongTrinhDaoTao', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/chuong-trinh-dao-tao/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách chương trình đào tạo bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmChuongTrinhDaoTaoGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách chương trình đào tạo bị lỗi!', 'danger'));
    };
}

export function getDmChuongTrinhDaoTaoAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/chuong-trinh-dao-tao/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách chương trình đào tạo bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmChuongTrinhDaoTaoGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách chương trình đào tạo bị lỗi!', 'danger'));
    };
}

export function getDmChuongTrinhDaoTao(_id, done) {
    return dispatch => {
        const url = `/api/danh-muc/chuong-trinh-dao-tao/item/${_id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin chương trình đào tạo bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmChuongTrinhDaoTao(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/chuong-trinh-dao-tao';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo chương trình đào tạo bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmChuongTrinhDaoTaoPage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo chương trình đào tạo bị lỗi!', 'danger'));
    };
}

export function deleteDmChuongTrinhDaoTao(_id) {
    return dispatch => {
        const url = '/api/danh-muc/chuong-trinh-dao-tao';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa danh mục chương trình đào tạo bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Khoa đã xóa thành công!', 'success', false, 800);
                dispatch(getDmChuongTrinhDaoTaoPage());
            }
        }, error => T.notify('Xóa chương trình đào tạo bị lỗi!', 'danger'));
    };
}

export function updateDmChuongTrinhDaoTao(_id, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/chuong-trinh-dao-tao';
        T.put(url, { _id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin chương trình đào tạo bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin chương trình đào tạo thành công!', 'success');
                dispatch(getDmChuongTrinhDaoTaoPage());
            }
        }, error => T.notify('Cập nhật thông tin chương trình đào tạo bị lỗi!', 'danger'));
    };
}

export function changeDmChuongTrinhDaoTao(item) {
    return { type: DmChuongTrinhDaoTaoUpdate, item };
}
