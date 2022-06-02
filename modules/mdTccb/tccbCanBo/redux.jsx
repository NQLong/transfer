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
            return Object.assign({}, state, { dataStaff: data.item });
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
        let condition = {};
        if (typeof shcc == 'object') condition = shcc;
        else condition = { shcc };
        const url = '/api/staff/edit/item';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy thông tin cán bộ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: StaffGet, item: data.item });
                if (done) done(data);
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
                dispatch(getStaffEdit(data.item.shcc));
                done && done(data.item);
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


export const SelectAdapter_FwCanBo = {
    ajax: true,
    url: '/api/staff/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({
        results: response && response.page && response.page.list ? response.page.list.map(item => ({
            id: item.shcc, text: `${item.shcc}: ${(item.ho + ' ' + item.ten).normalizedName()}`, ngayBatDauCongTac: item.ngayBatDauCongTac, data: {
                phai: item.phai,
                ngaySinh: item.ngaySinh,
                hocVi: item.hocVi,
                chucDanh: item.chucDanh,
            }
        })) : []
    }),
    getOne: getStaff,
    fetchOne: (shcc, done) => (getStaff(shcc, ({ item }) => done && done({ id: item.shcc, text: `${item.shcc}: ${(item.ho + ' ' + item.ten).normalizedName()}`, ngayBatDauCongTac: item.ngayBatDauCongTac })))(),
    processResultOne: response => response && response.item && ({ value: response.item.shcc, text: `${response.item.shcc}: ${(response.item.ho + ' ' + response.item.ten).normalizedName()}` }),
};

export const SelectAdapter_FwCanBoByDonVi = (listDonVi) => ({
    ajax: true,
    url: '/api/staff/page/1/20',
    data: params => ({ condition: params.term, filter: { listDonVi } }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.shcc, text: `${item.shcc}: ${(item.ho + ' ' + item.ten).normalizedName()}`, ngayBatDauCongTac: item.ngayBatDauCongTac })) : [] }),
    fetchOne: (shcc, done) => (getStaff(shcc, ({ item }) => done && done({ id: item.shcc, text: `${item.shcc}: ${(item.ho + ' ' + item.ten).normalizedName()}`, ngayBatDauCongTac: item.ngayBatDauCongTac })))(),
});

export const SelectAdapter_FwCanBoGiangVien = {
    ajax: true,
    url: '/api/staff/get-giang-vien',
    data: params => ({ searchTerm: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.shcc, text: `${item.tenDonVi.getFirstLetters().toUpperCase()}: ${item.trinhDo + ' ' || ''}${(item.ho + ' ' + item.ten).normalizedName()}`, ngayBatDauCongTac: item.ngayBatDauCongTac })) : [] }),
    fetchOne: (shcc, done) => (getStaff(shcc, ({ item }) => done && done({ id: item.shcc, text: `${item.tenDonVi.getFirstLetters().toUpperCase()}: ${item.trinhDo + ' ' || ''}${(item.ho + ' ' + item.ten).normalizedName()}` })))(),
};

export const SelectAdapter_FwCanBoFemale = {
    ajax: true,
    url: '/api/staff-female/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.shcc, text: `${item.shcc}: ${(item.ho + ' ' + item.ten).normalizedName()}` })) : [] }),
    getOne: getStaff,
    fetchOne: (shcc, done) => (getStaff(shcc, ({ item }) => done && done({ id: item.shcc, text: `${item.shcc}: ${(item.ho + ' ' + item.ten).normalizedName()}` })))(),
    processResultOne: response => response && response.item && ({ value: response.item.shcc, text: `${response.item.shcc}: ${(response.item.ho + ' ' + response.item.ten).normalizedName()}` }),
};

export const SelectAdapter_ChuyenNganhAll = {
    ajax: true,
    url: '/api/staff/get-chuyen-nganh-all',
    data: params => ({ condition: params.term }),
    processResults: response => {
        let listChuyenNganh = [];
        if (response && response.items) {
            let chuyenNganhGroupBy = response.items.groupBy('chuyenNganh');
            listChuyenNganh = Object.keys(chuyenNganhGroupBy);
        }
        return { results: listChuyenNganh.map(item => ({ id: item, text: item })) };
    },
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

export function downloadWord(shcc, type, done) {
    return () => {
        const url = `/api/staff/get-ly-lich/${shcc}`;
        T.get(url, { type }, data => {
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

export function getStaffByEmail(email, done) {
    return () => {
        const url = `/api/staff/by-email/${email}`;
        T.get(url, data => {
            if (data.error) {
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        });
    };
}

export const SelectAdapter_ChuyenNganhCanBo =
{
    ajax: true,
    url: '/api/staff/get-all-chuyen-nganh',
    data: params => ({ condition: params.term }),
    processResults: response => {
        let results = [];
        if (response && response.items) {
            let tempResults = Object.keys(response.items.filter(item => item.chuyenNganh).groupBy('chuyenNganh'));
            results = tempResults.map(item => ({ id: item, text: item }));
        }
        return { results };

    },
    fetchOne: (shcc, done) => (getStaff(shcc, ({ item }) => done && done({ id: item.chuyenNganh, text: item.chuyenNganh })))(),
};