import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SdhLoaiQuyetDinhGetAll = 'SdhLoaiQuyetDinh:GetAll';
const SdhLoaiQuyetDinhGetPage = 'SdhLoaiQuyetDinh:GetPage';
const SdhLoaiQuyetDinhUpdate = 'SdhLoaiQuyetDinh:Update';

export default function SdhLoaiQuyetDinhReducer(state = null, data) {
    switch (data.type) {
        case SdhLoaiQuyetDinhGetAll:
            return Object.assign({}, state, { items: data.items });
        case SdhLoaiQuyetDinhGetPage:
            return Object.assign({}, state, { page: data.page });
        case SdhLoaiQuyetDinhUpdate:
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
export const PageName = 'pageSdhLoaiQuyetDinh';
T.initPage(PageName);

export function getSdhLoaiQdPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return (dispatch) => {
        const url = `/api/sau-dai-hoc/loai-quyet-dinh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách học Sau đại học bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: SdhLoaiQuyetDinhGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách học Sau đại học bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function updateSdhLoaiQd(ma, changes, done) {
    return (dispatch) => {
        const url = '/api/sau-dai-hoc/loai-quyet-dinh';
        T.put(url, { ma, changes }, (data) => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin học Sau đại học bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin học Sau đại học thành công!', 'success');
                done && done(data.page);
                dispatch(getSdhLoaiQdPage());
            }
        }, (error) => T.notify('Cập nhật thông tin học Sau đại học bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function createSdhLoaiQd(changes, done) {
    return (dispatch) => {
        const url = '/api/sau-dai-hoc/loai-quyet-dinh';
        T.post(url, { changes }, (data) => {
            if (data.error) {
                T.notify('Tạo học Sau đại học bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới thông tin học Sau đại học thành công!', 'success');
                dispatch(getSdhLoaiQdPage());
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo học Sau đại học bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function deleteSdhLoaiQd(ma) {
    return (dispatch) => {
        const url = '/api/sau-dai-hoc/loai-quyet-dinh';
        T.delete(url, { ma }, (data) => {
            if (data.error) {
                T.notify('Xóa danh mục học Sau đại học bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Khoa đã xóa thành công!', 'success', false, 800);
                dispatch(getSdhLoaiQdPage());
            }
        }, (error) => T.notify('Xóa học Sau đại học bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function changeSdhLoaiQd(item) {
    return { type: SdhLoaiQuyetDinhUpdate, item };
}
