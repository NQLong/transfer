import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SdhLoaiHocVienGetAll = 'SdhLoaiHocVien:GetAll';
const SdhLoaiHocVienGetPage = 'SdhLoaiHocVien:GetPage';
const SdhLoaiHocVienUpdate = 'SdhLoaiHocVien:Update';

export default function SdhLoaiHocVienReducer(state = null, data) {
    switch (data.type) {
        case SdhLoaiHocVienGetAll:
            return Object.assign({}, state, { items: data.items });
        case SdhLoaiHocVienGetPage:
            return Object.assign({}, state, { page: data.page });
        case SdhLoaiHocVienUpdate:
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
export const PageName = 'pageSdhLoaiHocVien';
T.initPage(PageName);

export function getSdhLoaiHvPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return (dispatch) => {
        const url = `/api/sau-dai-hoc/loai-hoc-vien/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách loại học viên bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                console.log(data.page);
                dispatch({ type: SdhLoaiHocVienGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách loại học viên bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function updateSdhLoaiHv(ma, changes, done) {
    return (dispatch) => {
        const url = '/api/sau-dai-hoc/loai-hoc-vien';
        T.put(url, { ma, changes }, (data) => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin loại học viên bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin loại học viên thành công!', 'success');
                console.log(data);
                done && done(data.page);
                dispatch(getSdhLoaiHvPage());
            }
        }, (error) => T.notify('Cập nhật thông tin loại học viên bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function createSdhLoaiHv(changes, done) {
    return (dispatch) => {
        const url = '/api/sau-dai-hoc/loai-hoc-vien';
        T.post(url, { changes }, (data) => {
            if (data.error) {
                T.notify('Tạo học Sau đại học bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới thông tin loại học viên thành công!', 'success');
                dispatch(getSdhLoaiHvPage());
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo mới loại học viên bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function deleteSdhLoaiHv(ma) {
    return (dispatch) => {
        const url = '/api/sau-dai-hoc/loai-hoc-vien';
        T.delete(url, { ma }, (data) => {
            if (data.error) {
                T.notify('Xóa loại học viên bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Loại học viên đã xóa thành công!', 'success', false, 800);
                dispatch(getSdhLoaiHvPage());
            }
        }, (error) => T.notify('Xóa loại học viên bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function changeSdhLoaiHv(item) {
    return { type: SdhLoaiHocVienUpdate, item };
}
