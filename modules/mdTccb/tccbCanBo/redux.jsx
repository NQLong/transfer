import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const StaffGetAll = 'Staff:GetAll';
const StaffGetPage = 'Staff:GetPage';
const StaffGet = 'Staff:Get';
const StaffUpdate = 'Staff:Update';
const UserGetStaff = 'Staff:UserGet';

export default function staffReducer(state = null, data) {
    switch (data.type) {
        case StaffGetAll:
            return Object.assign({}, state, { items: data.items });
        case StaffGetPage:
            return Object.assign({}, state, { page: data.page });
        case StaffGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case StaffUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].shcc == updatedItem.shcc) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].shcc == updatedItem.shcc) {
                            updatedPage.list.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                return Object.assign({}, state, { items: updatedItems, page: updatedPage });
            } else {
                return null;
            }
        case UserGetStaff:
            return Object.assign({}, state, { userItem: data.item });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export const PageName = 'staffPage';
T.initPage(PageName);
export function getStaffPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/staff/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách cán bộ bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: StaffGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách cán bộ bị lỗi', 'danger'));
    };
}

export function getStaff(shcc, done) {
    return () => {
        const url = `/api/staff/item/${shcc}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin cán bộ bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            }
            else if (done) {
                done(data);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getStaffAll(done) {
    return dispatch => {
        const url = '/api/staff/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách cán bộ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: StaffGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách cán bộ bị lỗi!', 'danger'));
    };
}

export function getStaffEdit(shcc, done) {
    return dispatch => {
        const url = `/api/staff/edit/item/${shcc}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin cán bộ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data);
                dispatch({ type: StaffGet, item: data.item });
            }
        }, () => T.notify('Lấy thông tin cán bộ bị lỗi', 'danger'));
    };
}

export function createStaff(canBo, done) {
    return () => {
        const url = '/api/staff';
        T.post(url, { canBo }, data => {
            if (data.error) {
                T.notify('Tạo mới một cán bộ bị lỗi', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới một cán bộ thành công!', 'success');
                if (done) done(data);
            }
        }, () => T.notify('Tạo mới một cán bộ bị lỗi', 'danger'));
    };
}

export function updateStaff(shcc, changes, done) {
    return dispatch => {
        const url = '/api/staff';
        T.put(url, { shcc, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu cán bộ bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật thông tin cán bộ thành công!', 'success');
                done && done(data.item);
                dispatch(getStaff(shcc));
            }
        }, () => T.notify('Cập nhật dữ liệu cán bộ bị lỗi', 'danger'));
    };
}

export function deleteStaff(shcc, done) {
    return dispatch => {
        const url = '/api/staff';
        T.delete(url, { shcc }, data => {
            if (data.error) {
                T.notify('Xóa cán bộ bị lỗi', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa cán bộ thành công!', 'success', false, 800);
                dispatch(getStaffPage());
            }
            done && done();
        }, () => T.notify('Xóa cán bộ bị lỗi', 'danger'));
    };
}

//ho, ten, ngaySinh, donVi: string
export function getShccCanBo(ho, ten, ngaySinh, donVi, done) {
    return () => {
        const url = '/api/staff/calc-shcc';
        T.get(url, {ho, ten, ngaySinh, donVi}, data => {
            if (data.error) {
                T.notify('Không tìm được mã cán bộ' + (data.error.message && (':<br> Lý do: ' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else if (done) {
                done(data);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}
export function getCanBoKy(shcc, done) {
    return () => {
        const url = `/api/can-bo-ky/${shcc}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin cán bộ đại diện trường bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else if (done) {
                done(data);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}
//#region quanHeCanBo
export function createQuanHeCanBo(data, done) {
    return dispatch => {
        const url = '/api/staff/quan-he';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin người thân bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin người thân thành công!', 'info');
                dispatch(getStaffEdit(res.item.shcc));
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin người thân bị lỗi', 'danger'));
    };
}

export function updateQuanHeCanBo(id, changes, done) {
    return dispatch => {
        const url = '/api/staff/quan-he';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin người thân bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin người thân thành công!', 'info');
                dispatch(getStaffEdit(data.item.shcc));
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin người thân bị lỗi', 'danger'));
    };
}

export function deleteQuanHeCanBo(id, shcc) {
    return dispatch => {
        const url = '/api/staff/quan-he';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin người thân bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin người thân được xóa thành công!', 'info', false, 800);
                dispatch(getStaffEdit(shcc));
            }
        }, () => T.notify('Xóa thông tin người thân bị lỗi', 'danger'));
    };
}
//#endregion quanHeCanBo

export const SelectAdapter_FwCanBo = {
    ajax: true,
    url: '/api/staff/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.shcc, text: `${item.shcc}: ${item.ho} ${item.ten}` })) : [] }),
    getOne: getStaff,
    fetchOne: (shcc, done) => (getStaff(shcc, ({ item }) => done && done({ id: item.shcc, text: `${item.shcc}: ${item.ho} ${item.ten}` })))(),
    processResultOne: response => response && response.item && ({ value: response.item.shcc, text: `${response.item.shcc}: ${response.item.ho} ${response.item.ten}` }),
};

export function createMultiCanBo(canBoList, done) {
    return () => {
        const url = '/api/staff/multiple';
        T.post(url, { canBoList }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error.toString());
            } else {
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật dữ liệu bị lỗi!', 'danger'));
    };
}

export function downloadWord(shcc, done) {
    return () => {
        const url = `/user/staff/${shcc}/word`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Tải file word bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else if (done) {
                done(data.data);
            }
        }, () => T.notify('Tải file word bị lỗi', 'danger'));
    };
}

export function downloadWordLlkh(shcc, done) {
    return () => {
        const url = `/user/staff/${shcc}/word-llkh`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Tải file word bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else if (done) {
                done(data.data);
            }
        }, () => T.notify('Tải file word bị lỗi', 'danger'));
    };
}

// User Actions ------------------------------------------------------------------------------------------------------------
export function userGetStaff(email, done) {
    return dispatch => {
        const url = `/api/staff-profile/${email}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin cán bộ bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: UserGetStaff, item: data.item });
                done && done(data);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function userStaff(email, done) {
    return () => {
        const url = `/api/staff-profile/${email}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin cán bộ bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function updateStaffUser(email, changes, done) {
    return dispatch => {
        const url = '/api/user/staff';
        T.put(url, { changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu cán bộ bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật thông tin cán bộ thành công!', 'success');
                done && done(data.item);
                dispatch(userStaff(email));
            }
        }, () => T.notify('Cập nhật dữ liệu cán bộ bị lỗi', 'danger'));
    };
}

//#region quanHeStaff User
export function createQuanHeStaffUser(data, done) {
    return dispatch => {
        const url = '/api/user/staff/quan-he';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin người thân bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin người thân thành công!', 'info');
                dispatch(userGetStaff(data.email));
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin người thân bị lỗi', 'danger'));
    };
}

export function updateQuanHeStaffUser(id, changes, done) {
    return dispatch => {
        const url = '/api/user/staff/quan-he';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin người thân bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin người thân thành công!', 'info');
                dispatch(userGetStaff(changes.email));
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin người thân bị lỗi', 'danger'));
    };
}

export function deleteQuanHeStaffUser(id, email) {
    return dispatch => {
        const url = '/api/user/staff/quan-he';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin người thân bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin người thân được xóa thành công!', 'info', false, 800);
                dispatch(userGetStaff(email));
            }
        }, () => T.notify('Xóa thông tin người thân bị lỗi', 'danger'));
    };
}
//#endregion quanHeCanBo User