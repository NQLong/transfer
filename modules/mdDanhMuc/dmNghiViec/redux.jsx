import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmNghiViecGetAll = 'DmNghiViec:GetAll';
const DmNghiViecGetPage = 'DmNghiViec:GetPage';
const DmNghiViecUpdate = 'DmNghiViec:Update';

export default function dmNghiViecReducer(state = null, data) {
    switch (data.type) {
        case DmNghiViecGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmNghiViecGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmNghiViecUpdate:
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
T.initPage('dmNghiViecPage', true);
export function getDmNghiViecPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmNghiViecPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/ly-do-ngung-cong-tac/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmNghiViecGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách bị lỗi!', 'danger'));
    };
}

export function getDmNghiViecAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/ly-do-ngung-cong-tac/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmNghiViecGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách bị lỗi!', 'danger'));
    };
}

export function getDmNghiViec(ma, done) {
    return () => {
        const url = `/api/danh-muc/ly-do-ngung-cong-tac/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmNghiViec(dmNghiViec, done) {
    return dispatch => {
        const url = '/api/danh-muc/ly-do-ngung-cong-tac';
        T.post(url, { dmNghiViec }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmNghiViecAll());
                T.notify('Tạo mới dữ liệu thành công!', 'success');
                if (done) done(data);
            }
        }, () => T.notify('Tạo mới một bị lỗi!', 'danger'));
    };
}

export function updateDmNghiViec(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/ly-do-ngung-cong-tac';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                done && done(data.item);
                T.notify('Cập nhật dữ liệu thành công!', 'success');
                dispatch(getDmNghiViecAll());
            }
        }, () => T.notify('Cập nhật dữ liệu bị lỗi!', 'danger'));
    };
}

export function deleteDmNghiViec(ma, done) {
    return dispatch => {
        const url = '/api/danh-muc/ly-do-ngung-cong-tac';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa thành công!', 'success', false, 800);
                dispatch(getDmNghiViecAll());
            }
            done && done();
        }, () => T.notify('Xóa bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_DmNghiViec = {
    ajax: true,
    url: '/api/danh-muc/ly-do-ngung-cong-tac/all',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.filter(item => item.kichHoat).map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDmNghiViec(ma, item => done && done({ id: item.ma, text: item.ten })))(),
};
