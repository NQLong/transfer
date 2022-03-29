import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DnDoanhNghiepGetAll = 'DnDoanhNghiep:GetAll';
const DnDoanhNghiepGetItem = 'DnDoanhNghiep:GetItem';
const DnDoanhNghiepGetPage = 'DnDoanhNghiep:GetPage';
const DnDoanhNghiepUpdate = 'DnDoanhNghiep:Update';
const homeCompaniesGetAll = 'DnDoanhNghiep:GetAllCompanies';
const UserGetPage = 'UserDoanhNghiep:GetPage';

export default function DnDoanhNghiepReducer(state = null, data) {
    switch (data.type) {
        case DnDoanhNghiepGetAll:
            return Object.assign({}, state, { items: data.items });
        case DnDoanhNghiepGetItem:
            return Object.assign({}, state, { item: data.item });
        case DnDoanhNghiepGetPage:
            return Object.assign({}, state, { page: data.page });
        case UserGetPage:
            return Object.assign({}, state, { userDoanhNghiepPage: data.page });
        case homeCompaniesGetAll:
            return Object.assign({}, state, { items: data.items });
        case DnDoanhNghiepUpdate:
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
T.initPage('pageDnDoanhNghiep', true);

export function getDnDoanhNghiepPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDnDoanhNghiep', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/doi-ngoai/doanh-nghiep/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: { searchText: page.pageCondition } }, data => {
            if (data.error) {
                T.notify('Lấy danh sách doanh nghiệp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: DnDoanhNghiepGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách doanh nghiệp bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}


export function getDnDoanhNghiepAll(condition, done) {
    return dispatch => {
        const url = '/api/doi-ngoai/doanh-nghiep/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách doanh nghiệp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
                dispatch({ type: DnDoanhNghiepGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách doanh nghiệp bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDnDoanhNghiep(id, done) {
    return dispatch => {
        const url = `/api/doi-ngoai/doanh-nghiep/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin doanh nghiệp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: DnDoanhNghiepGetItem, item: data.item });
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDnDoanhNghiep(item, done) {
    return dispatch => {
        const url = '/api/doi-ngoai/doanh-nghiep';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo doanh nghiệp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
                done && done(data);
            } else if (data.duplicateShortName) {
                T.notify('Tên viết tắt của doanh nghiệp bị trùng, vui lòng thay đổi!', 'danger');
                done && done(data);
            } else {
                T.notify('Tạo doanh nghiệp thành công!', 'success');
                dispatch(getDnDoanhNghiepPage());
                done && done(data);
            }
        }, error => T.notify('Tạo doanh nghiệp bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDnDoanhNghiep(id) {
    return dispatch => {
        const url = '/api/doi-ngoai/doanh-nghiep';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa doanh nghiệp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Doanh nghiệp đã xóa thành công!', 'success', false, 800);
                dispatch(getDnDoanhNghiepPage());
            }
        }, error => T.notify('Xóa doanh nghiệp bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDnDoanhNghiep(id, changes, done) {
    return dispatch => {
        const url = '/api/doi-ngoai/doanh-nghiep';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin doanh nghiệp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else if (data.duplicateShortName) {
                T.notify('Tên viết tắt của doanh nghiệp bị trùng, vui lòng thay đổi!', 'danger');
            } else {
                T.notify('Cập nhật thông tin doanh nghiệp thành công!', 'success');
                dispatch(getDnDoanhNghiepPage());
            }
        }, error => T.notify('Cập nhật thông tin doanh nghiệp bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function approveDnDoanhNghiep(id, status, done) {
    return dispatch => {
        const url = '/api/doi-ngoai/doanh-nghiep-approval';
        T.put(url, { id, status }, data => {
            if (data.error) {
                T.notify('Thao tác duyệt doanh nghiệp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else if (data.duplicateShortName) {
                T.notify('Tên viết tắt mới của doanh nghiệp bị trùng, không thể duyệt', 'danger');
            } else {
                T.notify('Thao tác duyệt doanh nghiệp thành công!', 'success');
                dispatch(getDnDoanhNghiepPage());
                done && done();
            }
        }, error => T.notify('Thao tác duyệt doanh nghiệp bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function changeDnDoanhNghiep(item) {
    return { type: DnDoanhNghiepUpdate, item };
}

export function homeGetAllCompanies(loaiThanhPhan, done) {
    return dispatch => {
        const url = '/user/doi-ngoai/doanh-nghiep/all';
        T.get(url, { loaiThanhPhan }, data => {
            if (data.error) {
                T.notify('Lấy thông tin doanh nghiệp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: homeCompaniesGetAll, items: data.items ? data.items : [] });
                done && done(data.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function homeGetCompanies(id, done) {
    return () => {
        const url = '/user/doi-ngoai/doanh-nghiep/item/' + id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin doanh nghiệp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function homeGetCompanyDoiTac(hiddenShortName, done) {
    return () => {
        const url = '/user/doi-ngoai/doanh-nghiep/doitac/' + hiddenShortName;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin doanh nghiệp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getOneDnDoanhNghiep(id, done) {
    return () => {
        const url = `/api/doi-ngoai/doanh-nghiep/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin doanh nghiệp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export const SelectAdapter_DnDoanhNghiep = {
    ajax: true,
    url: '/api/doi-ngoai/doanh-nghiep/page/1/20',
    data: params => ({ condition: { searchText: params.term ? params.term : '' } }),
    processResults: response => {
        const results = response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: T.language.parse(item.tenDayDu || '', true).vi })) : [];
        return { results };
    },
    fetchOne: (id, done) => (getOneDnDoanhNghiep(id, (item) => done && done({ id: item.id, text: T.language.parse(item.tenDayDu || '', true).vi })))()
};