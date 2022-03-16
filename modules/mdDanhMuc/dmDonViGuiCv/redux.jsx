import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmDonViGuiCvGetAll = 'DmDonViGuiCv:GetAll';
const DmDonViGuiCvGetPage = 'DmDonViGuiCv:GetPage';
const DmDonViGuiCvUpdate = 'DmDonViGuiCv:Update';

export default function dmDonViGuiCvReducer(state = null, data) {
    switch (data.type) {
        case DmDonViGuiCvGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmDonViGuiCvGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmDonViGuiCvUpdate:
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
export const PageName = 'pageDmDonViGuiCv';
T.initPage(PageName);
export function getDmDonViGuiCongVanPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/don-vi-gui-cong-van/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách đơn vị gửi công văn bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmDonViGuiCvGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách đơn vị gửi công văn bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmDonViGuiCvAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/don-vi-gui-cong-van/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách đơn vị gửi công văn bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmDonViGuiCvGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách đơn vị gửi công văn bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmDonViGuiCv(id, done) {
    return () => {
        const url = `/api/danh-muc/don-vi-gui-cong-van/item/${id}`;
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

export function createDmDonViGuiCv(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/don-vi-gui-cong-van';
        T.post(url, { item }, data => {
            if (data.error) {
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo đơn vị gửi công văn thành công!', 'success');
                dispatch(getDmDonViGuiCongVanPage());
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo đơn vị gửi công văn bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmDonViGuiCv(id) {
    return dispatch => {
        const url = '/api/danh-muc/don-vi-gui-cong-van';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa danh mục đơn vị gửi công văn bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đơn vị gửi công văn đã xóa thành công!', 'success', false, 800);
                dispatch(getDmDonViGuiCongVanPage());
            }
        }, (error) => T.notify('Xóa đơn vị gửi công văn bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmDonViGuiCv(id, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/don-vi-gui-cong-van';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông đơn vị gửi công văn bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin đơn vị gửi công văn thành công!', 'success');
                done && done(data.item);
                dispatch(getDmDonViGuiCongVanPage());
            }
        }, (error) => T.notify('Cập nhật thông tin đơn vị gửi công văn bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export const SelectAdapter_DmDonViGuiCongVan = {
    ajax: true,
    url: '/api/danh-muc/don-vi-gui-cong-van/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: item.ten })) : [] }),
    getOne: getDmDonViGuiCv,
    fetchOne: (id, done) => (getDmDonViGuiCv(id, ( item ) => done && done({ id: item.id, text: item.ten })))(),
    processResultOne: response => response &&  ({ value: response.id, text: response.ten }),
};