import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DnNguoiLienHeGetAll = 'DnNguoiLienHe:GetAll';
const DnNguoiLienHeGetPage = 'DnNguoiLienHe:GetPage';
const DnNguoiLienHeUpdate = 'DnNguoiLienHe:Update';

export default function DnNguoiLienHeReducer(state = null, data) {
    switch (data.type) {
        case DnNguoiLienHeGetAll:
            return Object.assign({}, state, { items: data.items });
        case DnNguoiLienHeGetPage:
            return Object.assign({}, state, { page: data.page });
        case DnNguoiLienHeUpdate:
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
T.initPage('pageDnNguoiLienHe');

export function getDnNguoiLienHePage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDnNguoiLienHe', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/doi-ngoai/nguoi-lien-he/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách người liên hệ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DnNguoiLienHeGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách người liên hệ bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDnNguoiLienHeAll(condition, done) {
    return dispatch => {
        const url = '/api/doi-ngoai/nguoi-lien-he/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách người liên hệ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
                dispatch({ type: DnNguoiLienHeGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách người liên hệ bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDnNguoiLienHe(id, done) {
    return () => {
        const url = `/api/doi-ngoai/nguoi-lien-he/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin người liên hệ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDnNguoiLienHe(item, done) {
    return dispatch => {
        const url = '/api/doi-ngoai/nguoi-lien-he';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo người liên hệ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
                done && done(data);
            } else if (data.duplicateEmail) {
                T.notify('Email của người liên hệ bị trùng, vui lòng thay đổi!', 'danger');
                done && done(data);
            } else {
                dispatch(getDnNguoiLienHePage());
                done && done(data);
            }
        }, error => T.notify('Tạo người liên hệ bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDnNguoiLienHe(id, done) {
    return dispatch => {
        const url = '/api/doi-ngoai/nguoi-lien-he';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa người liên hệ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Người liên hệ đã xóa thành công!', 'success', false, 800);
                done && done();
                dispatch(getDnNguoiLienHePage());
            }
        }, error => T.notify('Xóa người liên hệ bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDnNguoiLienHe(id, changes, done) {
    return dispatch => {
        const url = '/api/doi-ngoai/nguoi-lien-he';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin người liên hệ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data);
            } else if (data.duplicateEmail) {
                T.notify('Email của người liên hệ bị trùng, vui lòng thay đổi!', 'danger');
                done && done(data);
            } else {
                T.notify('Cập nhật thông tin người liên hệ thành công!', 'success');
                done && done(data);
                dispatch(getDnNguoiLienHePage());
            }
        }, error => T.notify('Cập nhật thông tin người liên hệ bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export const SelectAdapter_DnNguoiLienHe = {
    ajax: true,
    url: '/api/doi-ngoai/nguoi-lien-he/page/1/20',
    data: params => ({ condition: { searchText: params.term || '' } }),
    processResults: response => ({
        results: response && response.page && response.page.list ? response.page.list.map(item => {
            return { id: item.id, text: `${item.ho} ${item.ten}` + (item.doanhNghiepId ? `: ${(item.tenDoanhNghiep || '').viText()}` : (item.tenDonViKhac ? `: ${item.tenDonViKhac.viText()}` : '')) + (item.email ? ` - ${item.email} ` : '') + (item.soDienThoai ? `- ${item.soDienThoai}` : '') };
        }) : []
    }),
    fetchOne: (id, done) => (getDnNguoiLienHe(id, (item) => done && done({ value: item.id, text: item.ho + ' ' + item.ten })))()
};