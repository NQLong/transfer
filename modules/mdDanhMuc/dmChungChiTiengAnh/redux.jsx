import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmChungChiTiengAnhGetAll = 'DmChungChiTiengAnh:GetAll';
const DmChungChiTiengAnhGetPage = 'DmChungChiTiengAnh:GetPage';
const DmChungChiTiengAnhUpdate = 'DmChungChiTiengAnh:Update';

export default function DmChungChiTiengAnhReducer(state = null, data) {
    switch (data.type) {
        case DmChungChiTiengAnhGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmChungChiTiengAnhGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmChungChiTiengAnhUpdate:
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
T.initPage('pageDmChungChiTiengAnh');
export function getDmChungChiTiengAnhPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmChungChiTiengAnh', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/chung-chi-tieng-anh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách chứng chỉ tiếng Anh bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmChungChiTiengAnhGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách chứng chỉ tiếng Anh bị lỗi!', 'danger'));
    };
}

export function getDmChungChiTiengAnhAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/chung-chi-tieng-anh/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách chứng chỉ tiếng Anh bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmChungChiTiengAnhGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách chứng chỉ tiếng Anh bị lỗi!', 'danger'));
    };
}

export function getDmChungChiTiengAnh(ma, done) {
    return () => {
        const url = `/api/danh-muc/chung-chi-tieng-anh/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin chứng chỉ tiếng Anh bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmChungChiTiengAnh(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/chung-chi-tieng-anh';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo chứng chỉ tiếng Anh bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmChungChiTiengAnhAll());
                if (done) done(data);
            }
        }, () => T.notify('Tạo chứng chỉ tiếng Anh bị lỗi!', 'danger'));
    };
}

export function deleteDmChungChiTiengAnh(ma) {
    return dispatch => {
        const url = '/api/danh-muc/chung-chi-tieng-anh';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục chứng chỉ tiếng Anh bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Khoa đã xóa thành công!', 'success', false, 800);
                dispatch(getDmChungChiTiengAnhAll());
            }
        }, () => T.notify('Xóa chứng chỉ tiếng Anh bị lỗi!', 'danger'));
    };
}

export function updateDmChungChiTiengAnh(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/chung-chi-tieng-anh';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin chứng chỉ tiếng Anh bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin chứng chỉ tiếng Anh thành công!', 'success');
                dispatch(getDmChungChiTiengAnhAll());
            }
        }, () => T.notify('Cập nhật thông tin chứng chỉ tiếng Anh bị lỗi!', 'danger'));
    };
}

export function changeDmChungChiTiengAnh(item) {
    return { type: DmChungChiTiengAnhUpdate, item };
}
