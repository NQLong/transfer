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
            console.log(Object.assign({}, state, { page: data.page }));
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
    const page = T.updatePage('pageStudentsAdmin', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/students/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, result => {
            if (result.error) {
                T.notify('Lấy danh sách sinh viên, học sinh bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: sinhVienGetPage, page: result.page });
                if (done) done(result.page);
            }
        }, () => T.notify('Lấy danh sách sinh viên, học sinh bị lỗi!', 'danger'));
    };
}

export function getStudentAdmin(mssv, done) {
    return dispatch => {
        const url = `/api/students/item/${mssv}`;
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
        const url = `/api/students/item/${mssv}`;
        T.put(url, { changes }, data => {
            if (data.error) {
                T.notify('Cập nhật không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật thành công!', 'success');
                done && done(data.items);
                dispatch(getStudentsPage());
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

export const SelectAdapter_FwStudent = {
    ajax: true,
    url: '/api/students/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.mssv, text: `${item.mssv}: ${item.ho} ${item.ten}` })) : [] }),
    fetchOne: (mssv, done) => (getStudentAdmin(mssv, item => done && done({ id: item.mssv, text: `${item.mssv}: ${item.ho} ${item.ten}` })))(),
};

export const SelectAdapter_FwNamTuyenSinh = {
    ajax: true,
    url: '/api/students/nam-tuyen-sinh',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.namTuyenSinh, text: `${item.namTuyenSinh}` })) : [] }),
    // fetchOne: (mssv, done) => (getStudentAdmin(mssv, item => done && done({ id: item.mssv, text: `${item.mssv}: ${item.ho} ${item.ten}` })))(),
};



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
                done && done(data.item);
                dispatch({ type: sinhVienUserGet, item: data.item });
            }
        }, () => T.notify('Cập nhật dữ liệu sinh viên bị lỗi', 'danger'));
    };
}

export function downloadWord(done) {
    return () => {
        const url = '/api/students-sent-syll';
        T.get(url, result => {
            done(result);
        });
    };
}

export function adminDownloadSyll(mssv, namTuyenSinh) {
    return () => {
        const url = '/api/student/get-syll';
        T.get(url, { mssv, namTuyenSinh }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Lỗi hệ thống', 'danger');
                console.error(result.error);
            } else {
                T.download(`${url}?mssv=${mssv}&namTuyenSinh=${namTuyenSinh}`, 'SYLL.pdf');
            }

        });
    };
}

export function loginStudentForTest(data) {
    return () => {
        const url = '/api/students-login-test';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
            } else {
                T.cookie('personId', result.user.studentId);
                location.reload();
            }
        });
    };
}
