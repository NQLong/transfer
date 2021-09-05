import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmHocSdhGetAll = 'DmHocSdh:GetAll';
const DmHocSdhGetPage = 'DmHocSdh:GetPage';
const DmHocSdhUpdate = 'DmHocSdh:Update';

export default function DmHocSdhReducer(state = null, data) {
    switch (data.type) {
        case DmHocSdhGetAll:
            return Object.assign({}, state, { items: data.items });

        case DmHocSdhGetPage:
            return Object.assign({}, state, { page: data.page });

        case DmHocSdhUpdate:
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
export const PageName = 'pageDmHocSdh';
T.initPage(PageName);

export function getDmHocSdhPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return (dispatch) => {
        const url = `/api/danh-muc/hoc-sdh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách học Sau đại học bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmHocSdhGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách học Sau đại học bị lỗi' + (error.error.message && ':<br>' + data.error.message), 'danger'));
    };
}

export function getDmHocSdhAll(done) {
    return (dispatch) => {
        const url = '/api/danh-muc/hoc-sdh/all';
        T.get(url, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách học Sau đại học bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmHocSdhGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách học Sau đại học bị lỗi' + (error.error.message && ':<br>' + data.error.message), 'danger'));
    };
}

export function getDmHocSdh(ma, done) {
    return (dispatch) => {
        const url = `/api/danh-muc/hoc-sdh/item/${ma}`;
        T.get(url, (data) => {
            if (data.error) {
                T.notify('Lấy thông tin học Sau đại học bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else if (done) {
                done(data.item);
            }
        }, (error) => console.error(`GET: ${url}.`, error));
    };
}

export function createDmHocSdh(changes, done) {
    return (dispatch) => {
        const url = '/api/danh-muc/hoc-sdh';
        T.post(url, { changes }, (data) => {
            if (data.error) {
                T.notify('Tạo học Sau đại học bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmHocSdhPage());
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo học Sau đại học bị lỗi' + (error.error.message && ':<br>' + data.error.message), 'danger'));
    };
}

export function updateDmHocSdh(ma, changes, done) {
    return (dispatch) => {
        const url = '/api/danh-muc/hoc-sdh';
        T.put(url, { ma, changes }, (data) => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin học Sau đại học bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin học Sau đại học thành công!', 'success');
                dispatch(getDmHocSdhPage());
            }
        }, (error) => T.notify('Cập nhật thông tin học Sau đại học bị lỗi' + (error.error.message && ':<br>' + data.error.message), 'danger'));
    };
}

export function deleteDmHocSdh(ma) {
    return (dispatch) => {
        const url = '/api/danh-muc/hoc-sdh';
        T.delete(url, { ma }, (data) => {
            if (data.error) {
                T.notify('Xóa danh mục học Sau đại học bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Khoa đã xóa thành công!', 'success', false, 800);
                dispatch(getDmHocSdhPage());
            }
        }, (error) => T.notify('Xóa học Sau đại học bị lỗi' + (error.error.message && ':<br>' + data.error.message), 'danger'));
    };
}

export function changeDmHocSdh(item) {
    return { type: DmHocSdhUpdate, item };
}

export function createDmHocSdhByUpload(item, done) {
    return (dispatch) => {
        const url = '/api/danh-muc/hoc-sdh/createFromFile';
        T.post(url, { item }, (data) => {
            if (data.error) {
                console.error(`POST: ${url}.`, data.error);
            }
            dispatch(getDmHocSdhPage());
            if (done) done(data);
        }, (error) => T.notify('Tạo danh mục học Sau đại học bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_DmHocSdh = {
    ajax: true,
    url: '/api/danh-muc/hoc-sdh/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: `${item.ma}: ${item.ten}` })) : [] }),
    getOne: getDmHocSdh,
    processResultOne: (response) => response && { value: response.ma, text: response.ma + ': ' + response.ten },
};

