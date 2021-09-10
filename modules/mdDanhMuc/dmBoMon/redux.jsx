import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmBoMonGetAll = 'DmBoMon:GetAll';
const DmBoMonGetPage = 'DmBoMon:GetPage';
const DmBoMonUpdate = 'DmBoMon:Update';

export default function DmBoMonReducer(state = null, data) {
    switch (data.type) {
        case DmBoMonGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmBoMonGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmBoMonUpdate:
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
export const PageName = 'pageDmBoMon';
T.initPage(PageName);
export function getDmBoMonPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/dm-bo-mon/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách bộ môn bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmBoMonGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách bộ môn bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function getDmBoMonAll(done) {
    return dispatch => {
        const url = '/api/dm-bo-mon/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách bộ môn bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmBoMonGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách bộ môn bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function getDmBoMon(ma, done) {
    return () => {
        const url = `/api/dm-bo-mon/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin bộ môn bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function getmaDonVi(done) {
    return () => {
        const url = '/api/dm-bo-mon/donVi';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin bộ môn bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function createDmBoMon(item, done) {
    return dispatch => {
        const url = '/api/dm-bo-mon';
        T.post(url, { item }, data => {
            if (data.error) {
                console.error(`POST: ${url}.`, data.error);
                T.notify(data.error, 'danger');
            } else {
                T.notify('Tạo bộ môn thành công!', 'success');
                dispatch(getDmBoMonPage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo bộ môn bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function deleteDmBoMon(ma) {
    return dispatch => {
        const url = '/api/dm-bo-mon';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa bộ môn bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Bộ môn đã xóa thành công!', 'success', false, 800);
                dispatch(getDmBoMonPage());
            }
        }, error => T.notify('Xóa Bộ môn bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function updateDmBoMon(ma, changes, done) {
    return dispatch => {
        const url = '/api/dm-bo-mon';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật bộ môn bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật bộ môn thành công!', 'success');
                dispatch(changeDmBoMon(changes));
                dispatch(getDmBoMonPage());
            }
        }, error => T.notify('Cập nhật bộ môn bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function changeDmBoMon(item) {
    return { type: DmBoMonUpdate, item };
}

export function createMultiDmBoMon(dmBoMon, done) {
    return () => {
        const url = '/api/dm-bo-mon/multiple';
        T.post(url, { dmBoMon }, data => {
            if (data.error && data.error.length) {
                T.notify('Cập nhật dữ liệu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error('PUT: ' + url + '. ' + data.error.toString());
            } else {
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật dữ liệu bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_DmBoMon = {
    ajax: true,
    url: '/api/dm-bo-mon/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    getOne: getDmBoMon,
    processResultOne: response => response && ({ value: response.ma, text: response.ma + ': ' + response.ten }),
};