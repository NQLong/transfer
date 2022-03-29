import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmDonViGetAll = 'DmDonVi:GetAll';
const DmDonViGetAllFaculty = 'DmDonVi:GetAllFaculty';
const DmDonViGetPage = 'DmDonVi:GetPage';
const DmDonViUpdate = 'DmDonVi:Update';

export default function dmDonViReducer(state = null, data) {
    switch (data.type) {
        case DmDonViGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmDonViGetAllFaculty:
            return Object.assign({}, state, { faculties: data.items });
        case DmDonViGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmDonViUpdate:
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
export const PageName = 'pageDmDonVi';
T.initPage(PageName);
export function getDmDonViPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/don-vi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách đơn vị trường đại học bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmDonViGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách đơn vị trường đại học bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmDonViAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/don-vi/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách đơn vị trường đại học bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmDonViGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách đơn vị trường đại học bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmDonVi(ma, done) {
    return () => {
        const url = `/api/danh-muc/don-vi/item/${ma}`;
        T.get(url, { ma }, data => {
            if (data.error) {
                T.notify('Lấy thông tin đơn vị trường đại học bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function createDmDonVi(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/don-vi';
        T.post(url, { item }, data => {
            if (data.error) {
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo đơn vị trường đại học thành công!', 'success');
                dispatch(getDmDonViPage());
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo đơn vị trường đại học bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmDonVi(ma) {
    return dispatch => {
        const url = '/api/danh-muc/don-vi';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục  bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đơn vị đã xóa thành công!', 'success', false, 800);
                dispatch(getDmDonViPage());
            }
        }, (error) => T.notify('Xóa đơn vị trường đại học bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmDonVi(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/don-vi';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông đơn vị trường đại học bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin đơn vị trường đại học thành công!', 'success');
                done && done(data.item);
                dispatch(getDmDonViPage());
            }
        }, (error) => T.notify('Cập nhật thông tin đơn vị trường đại học bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function changeDmDonVi(item) {
    return { type: DmDonViUpdate, item };
}

export function uploadDmDonVi(upload, history) {
    return () => {
        const url = '/api/danh-muc/don-vi/upload';
        T.post(url, { upload }, data => {
            if (data.error.length == 0) {
                T.notify('Upload thông tin đơn vị trường đại học thành công!', 'info');
                history.push('/user/danh-muc/don-vi');
            } else {
                T.notify('Upload thông tin đơn vị trường đại học có lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
            }
        });
    };
}
export function getDmDonViFaculty(done) {
    return dispatch => {
        const url = '/api/danh-muc/don-vi/faculty';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách khoa bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmDonViGetAllFaculty, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách khoa bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export const SelectAdapter_DmDonVi = {
    ajax: true,
    url: '/api/danh-muc/don-vi/page/1/50',
    data: params => ({ condition: params.term, kichHoat: 1 }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (id, done) => (getDmDonVi(id, item => item && done && done({ id: item.ma, text: item.ten })))(),
};

export const SelectAdapter_DmDonViFaculty = {
    ajax: true,
    getAll: getDmDonViFaculty,
    processResults: response => ({ results: response ? response.items.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    fetchOne: (id, done) => (getDmDonVi(id, item => item && done && done({ id: item.ma, text: item.ten })))(),
    condition: { kichHoat: 1 },
};

export const SelectAdapter_DmDonViFaculty_V2 = {
    ajax: true,
    url: '/api/danh-muc/don-vi/faculty',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.ten.normalizedName() })) : [] }),
    fetchOne: (id, done) => (getDmDonVi(id, item => item && done && done({ id: item.ma, text: item.ten })))(),
};

export const SelectAdapter_NoiKyHopDong = {
    ajax: true,
    url: '/api/danh-muc/don-vi/page/1/100',
    data: params => ({ condition: params.term }),
    processResults: response => {
        const list = response && response.page && response.page.list.filter((item) => {
            const ten = item.ten.toLowerCase();
            return (ten.includes('trung tâm') || ten.includes('công ty')) && item.kichHoat === 1;
        }).map(donVi => ({ id: donVi.ten, text: `${donVi.ten}` }));
        list.push({ id: 'Khác', text: 'Khác' });
        return ({ results: list });
    },
    processResultOne: response => response && ({ value: response.ma, text: response.ma + ': ' + response.ten }),
};

export const SelectAdapter_DmDonViFilter = (listDonViQuanLy) => {
    return {
        ajax: true,
        url: '/api/danh-muc/don-vi/get-in-list',
        data: () => ({ condition: listDonViQuanLy }),
        processResults: data => data && data.items ? data.items.map(item => ({ id: item.ma, text: item.ten })) : [],
        fetchOne: (id, done) => (getDmDonVi(id, item => item && done && done({ id: item.ma, text: item.ten })))()
    };
};