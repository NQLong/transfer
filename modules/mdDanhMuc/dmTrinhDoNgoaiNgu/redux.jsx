import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmTrinhDoNgoaiNguGetAll = 'DmTrinhDoNgoaiNgu:GetAll';
const DmTrinhDoNgoaiNguGetPage = 'DmTrinhDoNgoaiNgu:GetPage';
const DmTrinhDoNgoaiNguUpdate = 'DmTrinhDoNgoaiNgu:Update';

export default function dmTrinhDoNgoaiNguReducer(state = null, data) {
    switch (data.type) {
        case DmTrinhDoNgoaiNguGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmTrinhDoNgoaiNguGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmTrinhDoNgoaiNguUpdate:
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
T.initPage('dmTrinhDoNgoaiNguPage', true);
export function getDmTrinhDoNgoaiNguPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmTrinhDoNgoaiNguPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/trinh-do-ngoai-ngu/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách trình độ ngoại ngữ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmTrinhDoNgoaiNguGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách trình độ ngoại ngữ bị lỗi!', 'danger'));
    };
}

export function getDmTrinhDoNgoaiNguAll(condition, done) {
    return dispatch => {
        const url = '/api/danh-muc/trinh-do-ngoai-ngu/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách trình độ ngoại ngữ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmTrinhDoNgoaiNguGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách trình độ ngoại ngữ bị lỗi!', 'danger'));
    };
}

export function getDmTrinhDoNgoaiNgu(ma, done) {
    return () => {
        const url = `/api/danh-muc/trinh-do-ngoai-ngu/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin trình độ ngoại ngữ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmTrinhDoNgoaiNgu(dmTrinhDoNgoaiNgu, done) {
    return dispatch => {
        const url = '/api/danh-muc/trinh-do-ngoai-ngu';
        T.post(url, { dmTrinhDoNgoaiNgu }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một trình độ ngoại ngữ bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới một trình độ ngoại ngữ thành công!', 'success');
                dispatch(getDmTrinhDoNgoaiNguPage());
                if (done) done(data);
            }
        }, () => T.notify('Tạo mới một trình độ ngoại ngữ bị lỗi!', 'danger'));
    };
}

export function updateDmTrinhDoNgoaiNgu(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/trinh-do-ngoai-ngu';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu trình độ ngoại ngữ bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật dữ liệu trình độ ngoại ngữ thành công!', 'success');
                done && done(data.item);
                dispatch(getDmTrinhDoNgoaiNguPage());
            }
        }, () => T.notify('Cập nhật dữ liệu trình độ ngoại ngữ bị lỗi!', 'danger'));
    };
}

export function deleteDmTrinhDoNgoaiNgu(ma, done) {
    return dispatch => {
        const url = '/api/danh-muc/trinh-do-ngoai-ngu';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa trình độ ngoại ngữ bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa trình độ ngoại ngữ thành công!', 'success', false, 800);
                dispatch(getDmTrinhDoNgoaiNguPage());
            }
            done && done();
        }, () => T.notify('Xóa trình độ ngoại ngữ bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_DmTrinhDoNgoaiNgu = {
    ajax: false,
    getAll: getDmTrinhDoNgoaiNguAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    condition: { kichHoat: 1 },
};