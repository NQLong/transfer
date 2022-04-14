import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmLoaiCongVanGetAll = 'DmLoaiCongVan:GetAll';
const DmLoaiCongVanGetPage = 'DmLoaiCongVan:GetPage';
const DmLoaiCongVanUpdate = 'DmLoaiCongVan:Update';

export default function dmLoaiCongVanReducer(state = null, data) {
    switch (data.type) {
        case DmLoaiCongVanGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmLoaiCongVanGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmLoaiCongVanUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].id == updatedItem.id) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].id == updatedItem.id) {
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
export const PageName = 'pageDmLoaiCongVan';
T.initPage(PageName);
export function getDmLoaiCongVanPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/loai-cong-van/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại công văn bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmLoaiCongVanGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách loại công văn bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmLoaiCongVanAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/loai-cong-van/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại công văn bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmLoaiCongVanGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách loại công văn bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmLoaiCongVan(id, done) {
    return () => {
        const url = `/api/danh-muc/loai-cong-van/item/${id}`;
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify('Lấy thông tin loại công văn bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function createDmLoaiCongVan(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/loai-cong-van';
        T.post(url, { item }, data => {
            if (data.error) {
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo loại công văn thành công!', 'success');
                dispatch(getDmLoaiCongVanPage());
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo loại công văn bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmLoaiCongVan(id) {
    return dispatch => {
        const url = '/api/danh-muc/loai-cong-van';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa danh mục loại công văn bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục loại công văn đã xóa thành công!', 'success', false, 800);
                dispatch(getDmLoaiCongVanPage());
            }
        }, (error) => T.notify('Xóa loại công văn bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmLoaiCongVan(id, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/loai-cong-van';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông loại công văn bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin loại công văn thành công!', 'success');
                done && done();
                dispatch(getDmLoaiCongVanPage());
            }
        }, (error) => T.notify('Cập nhật thông tin loại công văn bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export const SelectAdapter_DmLoaiCongVan = {
    ajax: true,
    url: '/api/danh-muc/loai-cong-van/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: item.ten })) : [] }),
    getOne: getDmLoaiCongVan,
    fetchOne: (id, done) => (getDmLoaiCongVan(id, ( item ) => done && done({ id: item.id, text: item.ten })))(),
    processResultOne: response => response &&  ({ value: response.id, text: response.ten }),
};
