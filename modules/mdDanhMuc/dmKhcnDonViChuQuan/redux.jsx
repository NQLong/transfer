import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const dmKhcnDonViChuQuanGetAll = 'dmKhcnDonViChuQuan:GetAll';
const dmKhcnDonViChuQuanGetPage = 'dmKhcnDonViChuQuan:GetPage';
const dmKhcnDonViChuQuanUpdate = 'dmKhcnDonViChuQuan:Update';
export default function dmKhcnDonViChuQuanReducer(state = null, data) {
    switch (data.type) {
        case dmKhcnDonViChuQuanGetAll:
            return Object.assign({}, state, { items: data.items });
        case dmKhcnDonViChuQuanGetPage:
            return Object.assign({}, state, { page: data.page });
        case dmKhcnDonViChuQuanUpdate:
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
export const PageName = 'pageDmKhcnDonViChuQuan';
T.initPage(PageName);

export function getDmKhcnDonViChuQuanPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return (dispatch) => {
        const url = `/api/danh-muc/khcn-don-vi-chu-quan/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách KHCN Đơn vị chủ quản bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: dmKhcnDonViChuQuanGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách KHCN Đơn vị chủ quản bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function getKhcnDonViChuQuanAll(done) {
    return (dispatch) => {
        const url = '/api/danh-muc/khcn-don-vi-chu-quan/all';
        T.get(url, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách KHCN Đơn vị chủ quản bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: dmKhcnDonViChuQuanGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách KHCN Đơn vị chủ quản bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function getDmKhcnDonViChuQuan(ma, done) {
    return () => {
        const url = `/api/danh-muc/khcn-don-vi-chu-quan/item/${ma}`;
        T.get(url, (data) => {
            if (data.error) {
                T.notify('Lấy thông tin KHCN Đơn vị chủ quản bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else if (done) {
                done(data.item);
            }
        }, (error) => console.error(`GET: ${url}.`, error));
    };
}

export function createDmKhcnDonViChuQuan(changes, done) {
    return (dispatch) => {
        const url = '/api/danh-muc/khcn-don-vi-chu-quan';
        T.post(url, { changes }, (data) => {
            if (data.error) {
                T.notify('Tạo KHCN Đơn vị chủ quản bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới thông tin KHCN Đơn vị chủ quản thành công!', 'success');
                dispatch(getDmKhcnDonViChuQuanPage());
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo KHCN Đơn vị chủ quản bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function updateDmKhcnDonViChuQuan(ma, changes, done) {
    return (dispatch) => {
        const url = '/api/danh-muc/khcn-don-vi-chu-quan';
        T.put(url, { ma, changes }, (data) => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin KHCN Đơn vị chủ quản bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin KHCN Đơn vị chủ quản thành công!', 'success');
                done && done(data.item);
                dispatch(getDmKhcnDonViChuQuanPage());
            }
        }, (error) => T.notify('Cập nhật thông tin KHCN Đơn vị chủ quản bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function deleteDmKhcnDonViChuQuan(ma) {
    return (dispatch) => {
        const url = '/api/danh-muc/khcn-don-vi-chu-quan';
        T.delete(url, { ma }, (data) => {
            if (data.error) {
                T.notify('Xóa danh mục KHCN Đơn vị chủ quản bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Khoa đã xóa thành công!', 'success', false, 800);
                dispatch(getDmKhcnDonViChuQuanPage());
            }
        }, (error) => T.notify('Xóa KHCN Đơn vị chủ quản bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function changeDmHocSdh(item) {
    return { type: dmKhcnDonViChuQuanUpdate, item };
}

export const SelectAdapter_DmKhcnDonViChuQuan = {
    ajax: true,
    url: '/api/danh-muc/khcn-don-vi-chu-quan',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response ? response.items.map(item => ({ id: item.ma, text: item.ten })) : [] })
};