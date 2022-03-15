import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmHoTroHocPhiCoSoGetAll = 'DmHoTroHocPhiCoSo:GetAll';
const DmHoTroHocPhiCoSoGetPage = 'DmHoTroHocPhiCoSo:GetPage';
const DmHoTroHocPhiCoSoUpdate = 'DmHoTroHocPhiCoSo:Update';

export default function DmHoTroHocPhiCoSoReducer(state = null, data) {
    switch (data.type) {
        case DmHoTroHocPhiCoSoGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmHoTroHocPhiCoSoGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmHoTroHocPhiCoSoUpdate:
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
T.initPage('pageDmHoTroHocPhiCoSo');

export function getDmHoTroHocPhiCoSoPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDmHoTroHocPhiCoSo', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/ho-tro-hoc-phi-co-so/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách cơ sở đào tạo hỗ trợ học phí bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: DmHoTroHocPhiCoSoGetPage, page: data.page });
                done && done(data.page);
            }
        }, error => T.notify('Lấy danh sách cơ sở đào tạo hỗ trợ học phí bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function getDmHoTroHocPhiCoSoAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/ho-tro-hoc-phi-co-so/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách cơ sở đào tạo hỗ trợ học phí lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: DmHoTroHocPhiCoSoGetAll, items: data.items ? data.items : [] });
                done && done(data.items);
            }
        }, error => T.notify('Lấy danh sách cơ sở đào tạo hỗ trợ học phí bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function getDmHoTroHocPhiCoSo(ma, done) {
    return () => {
        const url = `/api/danh-muc/ho-tro-hoc-phi-co-so/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin cơ sở đào tạo hỗ trợ học phí bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}


export function createDmHoTroHocPhiCoSo(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/ho-tro-hoc-phi-co-so';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo dữ liệu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới dữ liệu thành công!', 'success');
                dispatch(getDmHoTroHocPhiCoSoPage());
                done && done(data);
            }
        }, error => T.notify('Tạo dữ liệu bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function deleteDmHoTroHocPhiCoSo(ma) {
    return dispatch => {
        const url = '/api/danh-muc/ho-tro-hoc-phi-co-so';
        T.delete(url, { ma }, data => {
            if (data.error) {
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Xóa dữ liệu thành công!', 'success');
                dispatch(getDmHoTroHocPhiCoSoPage());
            }
        }, error => T.notify('Xóa dữ liệu bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function updateDmHoTroHocPhiCoSo(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/ho-tro-hoc-phi-co-so';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật dữ liệu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật dữ liệu thành công!', 'success');
                dispatch(getDmHoTroHocPhiCoSoPage());
                done && done(data.item);
            }
        }, error => T.notify('Cập nhật dữ liệu bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export const SelectAdapter_DmHoTroHocPhiCoSo = {
    ajax: true,
    url: '/api/danh-muc/ho-tro-hoc-phi-co-so/page/1/20',
    data: params => ({ condition: params.term, kichHoat: 1 }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDmHoTroHocPhiCoSo(ma, item => item && done && done({ id: item.ma, text: item.ten })))()
};