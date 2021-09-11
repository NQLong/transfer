import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmNghiemThuXepLoaiKhcnGetAll = 'DmNghiemThuXepLoaiKhcn:GetAll';
const DmNghiemThuXepLoaiKhcnGetPage = 'DmNghiemThuXepLoaiKhcn:GetPage';
const DmNghiemThuXepLoaiKhcnUpdate = 'DmNghiemThuXepLoaiKhcn:Update';

export default function DmNghiemThuXepLoaiKhcnReducer(state = null, data) {
    switch (data.type) {
        case DmNghiemThuXepLoaiKhcnGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmNghiemThuXepLoaiKhcnGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmNghiemThuXepLoaiKhcnUpdate:
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
T.initPage('pageDmNghiemThuXepLoaiKhcn');
export function getDmNghiemThuXepLoaiKhcnPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmNghiemThuXepLoaiKhcn', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/nghiem-thu-xep-loai-khcn/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách nghiệm thu xếp loại KHCN bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmNghiemThuXepLoaiKhcnGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách nghiệm thu xếp loại KHCN bị lỗi!', 'danger'));
    };
}

export function getDmNghiemThuXepLoaiKhcnAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/nghiem-thu-xep-loai-khcn/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách nghiệm thu xếp loại KHCN bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmNghiemThuXepLoaiKhcnGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách nghiệm thu xếp loại KHCN bị lỗi!', 'danger'));
    };
}

export function getDmNghiemThuXepLoaiKhcn(ma, done) {
    return () => {
        const url = `/api/danh-muc/nghiem-thu-xep-loai-khcn/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin nghiệm thu xếp loại KHCN bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmNghiemThuXepLoaiKhcn(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/nghiem-thu-xep-loai-khcn';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo nghiệm thu xếp loại KHCN bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo thông tin nghiệm thu xếp loại KHCN thành công!', 'success');
                dispatch(getDmNghiemThuXepLoaiKhcnAll());
                if (done) done(data);
            }
        }, () => T.notify('Tạo nghiệm thu xếp loại KHCN bị lỗi!', 'danger'));
    };
}

export function deleteDmNghiemThuXepLoaiKhcn(ma) {
    return dispatch => {
        const url = '/api/danh-muc/nghiem-thu-xep-loai-khcn';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục nghiệm thu xếp loại KHCN bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmNghiemThuXepLoaiKhcnAll());
            }
        }, () => T.notify('Xóa nghiệm thu xếp loại KHCN bị lỗi!', 'danger'));
    };
}

export function updateDmNghiemThuXepLoaiKhcn(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/nghiem-thu-xep-loai-khcn';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin nghiệm thu xếp loại KHCN bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin nghiệm thu xếp loại KHCN thành công!', 'success');
                dispatch(getDmNghiemThuXepLoaiKhcnAll());
            }
        }, () => T.notify('Cập nhật thông tin nghiệm thu xếp loại KHCN bị lỗi!', 'danger'));
    };
}

export function changeDmNghiemThuXepLoaiKhcn(item) {
    return { type: DmNghiemThuXepLoaiKhcnUpdate, item };
}
