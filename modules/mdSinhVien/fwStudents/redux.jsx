import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const sinhVienGetAll = 'sinhVien:GetAll';
const sinhVienGetPage = 'sinhVien:GetPage';
const sinhVienUpdate = 'sinhVien:Update';
const sinhVienUserGet = 'sinhVien:UserGet';
const sinhVienGetEditPage = 'sinhVien:GetEditPage';

export default function sinhVienReducer(state = null, data) {
    switch (data.type) {
        case sinhVienGetAll:
            return Object.assign({}, state, { items: data.items });
        case sinhVienGetPage:
            return Object.assign({}, state, { page: data.page });
        case sinhVienUserGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case sinhVienGetEditPage:
            return Object.assign({}, state, { items: data.items });
        case sinhVienUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i]._id == updatedItem._id) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i]._id == updatedItem._id) {
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

//ACTIONS--------------------------------------------------------------------------------------------------

//Admin -----------------------------------------------------------------------------------------------------
T.initPage('pageStudentsAdmin');
export function getStudentsPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageStudentsAdmin', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/students/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sinh viên, học sinh bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: sinhVienGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách sinh viên, học sinh bị lỗi!', 'danger'));
    };
}

export function getStudentAdmin(mssv, done) {
    return dispatch => {
        const url = `/api/students/${mssv}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin sinh viên, học sinh không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
                dispatch({ type: sinhVienGetEditPage, items: data.items });
            }
        });
    };
}

export function updateStudentAdmin(mssv, changes, done) {
    return dispatch => {
        const url = `/api/students/${mssv}`;
        T.put(url, { changes }, data => {
            if (data.error) {
                T.notify('Cập nhật không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật thành công!', 'success');
                done && done(data.items);
                dispatch({ type: sinhVienGetEditPage, items: data.items });
            }
        });
    };
}

export function deleteSinhVienAdmin(mssv, done) {
    return dispatch => {
        const url = '/api/students';
        T.delete(url, { mssv }, data => {
            if (data.error) {
                T.notify('Xoá sinh viên, học sinh không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done();
                dispatch({ type: sinhVienGetPage });
            }
        });
    };
}


//User -----------------------------------------------------------------------------------------------
export function getSinhVienEditUser(done) {
    return dispatch => {
        const url = '/api/user/sinh-vien/edit/item';
        T.get(url, data => {
            if (data.error) {
                T.notify(data.error.message, 'danger');
                console.error(`GET: ${url}.`, data.error.message);
            } else {
                done && done(data);
                dispatch({ type: sinhVienUserGet, item: data.item });
            }
        }, () => console.log('Lấy thông tin sinh viên bị lỗi!'));
    };
}

export function updateStudentUser(changes, done) {
    return dispatch => {
        const url = '/api/user/student';
        T.put(url, { changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu sinh viên bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật thông tin sinh viên thành công!', 'success');
                done && done(data.item);
                dispatch({ type: sinhVienUserGet, item: data.item });
            }
        }, () => T.notify('Cập nhật dữ liệu sinh viên bị lỗi', 'danger'));
    };
}
