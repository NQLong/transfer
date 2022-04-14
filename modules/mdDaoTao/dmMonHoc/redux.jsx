import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmMonHocGetPage = 'DmMonHoc:GetPage';
const DmMonHocUpdate = 'DmMonHoc:Update';
const DmMonHocDelete = 'DmMonHoc:Delete';
const DmMonHocCreate = 'DmMonHoc:Create';
const DmMonHocPendingGet = 'DmMonHocPending:Get';
const DmMonHocPendingCreate = 'DmMonHocPending:Create';

export function dmMonHoc(state = null, data) {
    switch (data.type) {
        case DmMonHocGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmMonHocUpdate:
            if (state) {
                let updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedPage) {
                    updatedPage.list = updatedPage.list.map(item => item.id != updatedItem.id ? item : updatedItem);
                }
                return Object.assign({}, state, { page: updatedPage });
            } else {
                return null;
            }
        case DmMonHocDelete:
            if (state) {
                let updatedPage = Object.assign({}, state.page),
                    deletedItem = data.item;
                if (updatedPage) {
                    updatedPage.list = updatedPage.list.filter(item => item.id != deletedItem.id);
                }
                return Object.assign({}, state, { page: updatedPage });
            } else {
                return null;
            }
        case DmMonHocCreate:
            if (state) {
                let updatedPage = Object.assign({}, state.page),
                    createdItem = data.item;
                if (updatedPage) {
                    updatedPage.list.unshift(createdItem);
                }
                return Object.assign({}, state, { page: updatedPage });
            } else {
                return null;
            }
        default:
            return state;
    }
}
export function dmMonHocPending(state = null, data) {
    switch (data.type) {
        case DmMonHocPendingGet:
            return Object.assign({}, state, { page: data.page });
        case DmMonHocUpdate:
            if (state) {
                let updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedPage) {
                    updatedPage.list = updatedPage.list.map(item => item.id != updatedItem.id ? item : updatedItem);
                }
                return Object.assign({}, state, { page: updatedPage });
            } else {
                return null;
            }
        case DmMonHocDelete:
            if (state) {
                let updatedPage = Object.assign({}, state.page),
                    deletedItem = data.item;
                if (updatedPage) {
                    updatedPage.list = updatedPage.list.filter(item => item.id != deletedItem.id);
                }
                return Object.assign({}, state, { page: updatedPage });
            } else {
                return null;
            }
        case DmMonHocPendingCreate:
            if (state) {
                let updatedPage = Object.assign({}, state.page),
                    createdItem = data.item;
                if (updatedPage) {
                    updatedPage.list.unshift(createdItem);
                }
                return Object.assign({}, state, { page: updatedPage });
            } else {
                return null;
            }
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------

T.initPage('pageDmMonHoc');
export function getDmMonHocPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDmMonHoc', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/dao-tao/mon-hoc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: pageCondition?.searchTerm, donViFilter: pageCondition?.donViFilter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách môn học bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: DmMonHocGetPage, page: data.page });
                done && done();
            }
        });
    };
}
T.initPage('monHocPendingPage');
export function getDmMonHocPending(pageNumber, pageSize, pageCondition) {
    const page = T.updatePage('monHocPendingPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/dao-tao/mon-hoc-pending/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: pageCondition?.searchTerm, donViFilter: pageCondition?.donViFilter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách môn học chờ cấp mã bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: DmMonHocPendingGet, page: data.page });
            }
        });
    };
}

export function createDmMonHoc(item, done) {
    return dispatch => {
        const url = '/api/dao-tao/mon-hoc';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo môn học bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                T.notify('Tạo môn học thành công!', 'success');
                data.item.ma ? dispatch({ type: DmMonHocCreate, item: data.item }) :
                    dispatch({ type: DmMonHocPendingCreate, item: data.item });
                if (done) done(data.item);
            }
        });
    };
}

export function getDmMonHoc(ma, done) {
    return () => {
        const url = `/api/dao-tao/mon-hoc/item/${ma}`;
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


export function deleteDmMonHoc(id) {
    return dispatch => {
        const url = '/api/dao-tao/mon-hoc';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa môn học bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Môn học đã xóa thành công!', 'success', false, 800);
                dispatch({ type: DmMonHocDelete, item: { id } });
            }
        }, () => T.notify('Xóa môn học bị lỗi!', 'danger'));
    };
}

export function updateDmMonHoc(id, changes, done) {
    return dispatch => {
        const url = '/api/dao-tao/mon-hoc';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật môn học bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin môn học thành công!', 'success');
                dispatch({ type: DmMonHocUpdate, item: data.item });
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin môn học bị lỗi!', 'danger'));
    };
}

export function changeDmMonHoc(item) {
    return { type: DmMonHocUpdate, item };
}

export const SelectAdapter_DmMonHoc = {
    ajax: true,
    url: '/api/dao-tao/mon-hoc/page/1/20',
    data: params => ({ searchTerm: params.term || '' }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: `${item.ma}: ${item.ten}` })) : [] }),
    fetchOne: (ma, done) => (getDmMonHoc(ma, item => done && done({ id: item.ma, text: `${item.ma}: ${item.ten}` })))(),
    fetchOneItem: (ma, done) => (getDmMonHoc(ma, item => done && done({ id: item.ma, item: item })))(),
};

export const SelectAdapter_DmMonHocFaculty = (donVi) => {
    return {
        ajax: true,
        url: '/api/dao-tao/mon-hoc/page/1/20',
        data: params => ({ searchTerm: params.term || '', donViFilter: donVi }),
        processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: `${item.ma}: ${T.parse(item.ten).vi}` })) : [] }),
        fetchOne: (ma, done) => (getDmMonHoc(ma, item => done && done({ id: item.ma, text: `${item.ma}: ${T.parse(item.ten).vi}` })))(),

    };
};

export const SelectAdapter_DmMonHocFacultyFilter = (donVi, ...selectedItems) => {
    return {
        ajax: true,
        url: '/api/dao-tao/mon-hoc/page/1/20',
        data: params => ({ searchTerm: params.term || '', donVi: donVi, selectedItems }),
        processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: `${item.ma}: ${T.parse(item.ten).vi}` })) : [] }),
        fetchOne: (ma, done) => (getDmMonHoc(ma, item => done && done({ id: item.ma, text: `${item.ma}: ${T.parse(item.ten).vi}` })))(),
    };
};
