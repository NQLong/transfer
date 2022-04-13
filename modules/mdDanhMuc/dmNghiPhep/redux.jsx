import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmNghiPhepGetAll = 'DmNghiPhep:GetAll';
const DmNghiPhepGetPage = 'DmNghiPhep:GetPage';
const DmNghiPhepUpdate = 'DmNghiPhep:Update';

export default function DmNghiPhepReducer(state = null, data) {
    switch (data.type) {
        case DmNghiPhepGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmNghiPhepGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmNghiPhepUpdate:
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
T.initPage('pageDmNghiPhep');
export function getDmNghiPhepPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDmNghiPhep', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/nghi-phep/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nghỉ phép bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmNghiPhepGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách nghỉ phép bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function getDmNghiPhepAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/nghi-phep/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách nghỉ phép lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmNghiPhepGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách nghỉ phép bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function getDmNghiPhep(ma, done) {
    return () => {
        const url = `/api/danh-muc/nghi-phep/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin nghỉ phép lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function createDmNghiPhep(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/nghi-phep';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo dữ liệu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới dữ liệu thành công!', 'success');
                dispatch(getDmNghiPhepPage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo dữ liệu bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function deleteDmNghiPhep(ma) {
    return dispatch => {
        const url = '/api/danh-muc/nghi-phep';
        T.delete(url, { ma }, data => {
            if (data.error) {
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Xóa dữ liệu thành công!', 'success');
                dispatch(getDmNghiPhepPage());
            }
        }, error => T.notify('Xóa dữ liệu bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function updateDmNghiPhep(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/nghi-phep';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật dữ liệu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật dữ liệu thành công!', 'success');
                done && done(data.item);
                dispatch(getDmNghiPhepPage());
            }
        }, error => T.notify('Cập nhật dữ liệu bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export const SelectAdapter_DmNghiPhep = {
    ajax: false,
    getAll: getDmNghiPhepAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    // condition: { kichHoat: 1 },
};

export const SelectAdapter_DmNghiPhepV2 = {
    ajax: true,
    data: params => ({ condition: params.term }),
    url: '/api/danh-muc/nghi-phep/page/1/20',
    getOne: getDmNghiPhep,
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten + ': +' + item.soNgayPhep + ' ngày phép' , soNgayPhep: item.soNgayPhep})) : [] }),
    fetchOne: (ma, done) => (getDmNghiPhep(ma, item => done && done({ id: item.ma, text: item.ten, soNgayPhep: item.soNgayPhep })))(),
};
