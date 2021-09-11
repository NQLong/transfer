import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmLuongDiNuocNgoaiAll = 'DmLuongDiNuocNgoai:Get';
const DmLuongDiNuocNgoaiGetPage = 'DmLuongDiNuocNgoai:GetPage';
const DmLuongDiNuocNgoaiUpdate = 'DmLuongDiNuocNgoai:Update';

export default function DmLuongDiNuocNgoaiReducer(state = null, data) {
    switch (data.type) {
        case DmLuongDiNuocNgoaiAll:
            return Object.assign({}, state, { items: data.items });
        case DmLuongDiNuocNgoaiGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmLuongDiNuocNgoaiUpdate:
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
export function getDmLuongDiNuocNgoaiAll(condition, done) {
    return dispatch => {
        const url = '/api/danh-muc/luong-di-nuoc-ngoai/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách lương đi nước ngoài bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmLuongDiNuocNgoaiAll, items: data.items ? data.items : [] });
            }
        });
    };
}

T.initPage('pageDmLuongDiNuocNgoai');
export function getDmLuongDiNuocNgoaiPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDmLuongDiNuocNgoai', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/luong-di-nuoc-ngoai/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách lương đi nước ngoài bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmLuongDiNuocNgoaiGetPage, page: data.page });
            }
        });
    };
}

export function createDmLuongDiNuocNgoai(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/luong-di-nuoc-ngoai';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo lương đi nước ngoài bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch(getDmLuongDiNuocNgoaiPage());
            }
        });
    };
}

export function deleteDmLuongDiNuocNgoai(ma) {
    return dispatch => {
        const url = '/api/danh-muc/luong-di-nuoc-ngoai';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa lương đi nước ngoài bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Lương đi nước ngoài đã xóa thành công!', 'success', false, 800);
                dispatch(getDmLuongDiNuocNgoaiPage());
            }
        }, (error) => T.notify('Xóa lương đi nước ngoài bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmLuongDiNuocNgoai(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/luong-di-nuoc-ngoai';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật lương đi nước ngoài bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin lương đi nước ngoài thành công!', 'success');
                dispatch(changeDmLuongDiNuocNgoai(changes));
                dispatch(getDmLuongDiNuocNgoaiPage());
            }
        }, (error) => T.notify('Cập nhật thông tin lương đi nước ngoài bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function changeDmLuongDiNuocNgoai(item) {
    return { type: DmLuongDiNuocNgoaiUpdate, item };
}

export const SelectAdapter_DmLuongDiNuocNgoai = {
    ajax: false,
    getAll: getDmLuongDiNuocNgoaiAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.moTa })) : [] }),
    condition: { kichHoat: 1 },
};