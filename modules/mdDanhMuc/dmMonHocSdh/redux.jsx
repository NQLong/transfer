import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmMonHocSdhGetAll = 'DmMonHocSdh:Get';
const DmMonHocSdhGetPage = 'DmMonHocSdh:GetPage';
const DmMonHocSdhUpdate = 'DmMonHocSdh:Update';

export default function dmMonHocSdhReducer(state = null, data) {
    switch (data.type) {
        case DmMonHocSdhGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmMonHocSdhGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmMonHocSdhUpdate:
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
export function getDmMonHocSdhAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/mon-hoc-sdh/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách môn học bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmMonHocSdhGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

T.initPage('pageDmMonHocSdh');
export function getDmMonHocSdhPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDmMonHocSdh', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/mon-hoc-sdh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách môn học bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmMonHocSdhGetPage, page: data.page });
            }
        });
    };
}

export function createDmMonHocSdh(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/mon-hoc-sdh';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo môn học bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                T.notify('Tạo môn học thành công!', 'success');
                if (done) done(data.items);
                dispatch(getDmMonHocSdhPage());
            }
        });
    };
}

export function deleteDmMonHocSdh(ma) {
    return dispatch => {
        const url = '/api/danh-muc/mon-hoc-sdh';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa môn học bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Ngành đào tạo đã xóa thành công!', 'success', false, 800);
                dispatch(getDmMonHocSdhPage());
            }
        }, () => T.notify('Xóa môn học bị lỗi!', 'danger'));
    };
}

export function updateDmMonHocSdh(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/mon-hoc-sdh';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật môn học bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin môn học thành công!', 'success');
                dispatch(changeDmMonHocSdh(changes));
                dispatch(getDmMonHocSdhPage());
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật thông tin môn học bị lỗi!', 'danger'));
    };
}

export function getDmMonHocSdh(ma, done) {
    return () => {
        const url = `/api/danh-muc/mon-hoc-sdh/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin môn học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function changeDmMonHocSdh(item) {
    return { type: DmMonHocSdhUpdate, item };
}

export const SelectAdapter_DmMonHocSdh = (maKhoaSdh) => {
    return { 
        ajax: true,
        url: '/api/danh-muc/mon-hoc-sdh/page/1/20',
        data: params => ({ condition: params.term, kichHoat: 1, maKhoaSdh }),
        processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.tenTiengViet })) : [] }),
        fetchOne: (id, done) => (getDmMonHocSdh(id, item => item && done && done({ id: item.ma, text: item.ten })))(),
    };
};