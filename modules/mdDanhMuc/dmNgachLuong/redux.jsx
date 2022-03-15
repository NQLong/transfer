import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmNgachLuongGetAll = 'DmNgachLuong:GetAll';
const BacLuongGetAll = 'BacLuong:GetAll';
const DmNgachLuongGetPage = 'DmNgachLuong:GetPage';
const DmNgachLuongUpdate = 'DmNgachLuong:Update';

export default function DmNgachLuongReducer(state = null, data) {
    switch (data.type) {
        case BacLuongGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmNgachLuongGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmNgachLuongGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmNgachLuongUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].id == updatedItem.id) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].id == updatedItem.id) {
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
T.initPage('pageDmNgachLuong');
export function getDmNgachLuongPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmNgachLuong', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/ngach-luong/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách ngạch lương bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmNgachLuongGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách ngạch lương bị lỗi', 'danger'));
    };
}

export function getDmNgachLuongAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/ngach-luong/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách ngạch lương bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
                dispatch({ type: DmNgachLuongGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách ngạch lương bị lỗi', 'danger'));
    };
}

export function getDmNgachLuong(bac, idNgach, done) {
    return () => {
        const url = `/api/danh-muc/ngach-luong/item/${bac}/${idNgach}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin ngạch lương bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}
export function getBacLuongAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/bac-luong/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin bậc lương bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
                dispatch({ type: BacLuongGetAll, items: data.items ? data.items : [] });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}
export function getMaxBacLuong(idNgach, done) {
    return () => {
        const url = `/api/danh-muc/max-bac-luong/${idNgach}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin bậc lương bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmNgachLuong(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/ngach-luong';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo ngạch lương bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmNgachLuongAll());
                done && done(data);
            }
        }, () => T.notify('Tạo ngạch lương bị lỗi', 'danger'));
    };
}

export function deleteDmNgachLuong(idNgach, bac) {
    return dispatch => {
        const url = '/api/danh-muc/ngach-luong';
        T.delete(url, { idNgach, bac }, data => {
            if (data.error) {
                T.notify('Xóa danh mục ngạch lương bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Khoa đã xóa thành công!', 'success', false, 800);
                dispatch(getDmNgachLuongAll());
            }
        }, () => T.notify('Xóa ngạch lương bị lỗi', 'danger'));
    };
}

export function updateDmNgachLuong(idNgach, bac, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/ngach-luong';
        T.put(url, { idNgach, bac, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin ngạch lương bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin ngạch lương thành công!', 'success');
                dispatch(getDmNgachLuongAll());
            }
        }, () => T.notify('Cập nhật thông tin ngạch lương bị lỗi', 'danger'));
    };
}

export function changeDmNgachLuong(item) {
    return { type: DmNgachLuongUpdate, item };
}

export const SelectAdapter_DmNgachLuong = {
    ajax: false,
    getAll: getDmNgachLuongAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.id, text: `${item.maSoCdnn} (${item.ma}): ${item.ten}` })) : [] }),
    condition: { kichHoat: 1 },
};

export const SelectAdapter_DmNgachLuong_Ver2 = {
    ajax: true,
    url: '/api/danh-muc/ngach-luong/all',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.id, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDmNgachLuong(ma, (item) => done && done({ id: item.id, text: item.ten })))(),
    getOne: getDmNgachLuong,
    processResultOne: response => response && ({ value: response.id, text: response.ten }),
};

export const SelectAdapter_BacLuong = {
    ajax: false,
    getAll: getBacLuongAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: `${item.bac}-${item.idNgach}`, text: item.bac == 0 ? 'VK' : item.bac, idNgach: item.idNgach })) : [] }),
};

export const SelectAdapter_BacLuong_Filter = (idNgach = '00') => {
    return {
        ajax: true,
        url: `/api/danh-muc/filter-bac-luong/${idNgach}`,
        data: params => ({ condition: params.term }),
        processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.bac, text: item.bac == 0 ? 'VK' : item.bac })) : [] }),
        fetchOne: (ma, done) => (getDmNgachLuong(ma, idNgach, (item) => done && done({ id: item.bac, text: item.bac == 0 ? 'VK' : item.bac })))()
    };
};