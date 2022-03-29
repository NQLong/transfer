import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const UserGetAll = 'User:GetAll';
const UserGetPage = 'User:GetPage';
const UserUpdate = 'User:Update';

export default function UserReducer(state = null, data) {
    switch (data.type) {
        case UserGetAll:
            return Object.assign({}, state, { items: data.items });
        case UserGetPage:
            return Object.assign({}, state, { page: data.page });
        case UserUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].email == updatedItem.email) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].email == updatedItem.email) {
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

export const SelectAdapter_FwUser = {
    ajax: true,
    url: '/api/user-switch/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.email, text: `${item.email}: ${item.firstName}` })) : [] }),
    getOne: getUser,
    processResultOne: response => response && response.item && ({ value: response.item.email, text: `${response.email}: ${response.firstName}` }),
};

// Actions ------------------------------------------------------------------------------------------------------------
export const PageName = 'pageUser';
T.initPage(PageName);
export function getUserPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/user/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách người dùng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: UserGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách người dùng bị lỗi!', 'danger'));
    };
}

export function getUserAll(done) {
    return dispatch => {
        const url = '/api/user/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách người dùng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: UserGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách người dùng bị lỗi!', 'danger'));
    };
}

export function switchUser(personId) {
    return () => {
        const url = '/api/debug/switch-user';
        T.post(url, { personId }, data => {
            if (data.error) {
                T.notify(data.error.message, 'danger');
            } else {
                T.cookie('personId', personId);
                location.reload();
            }
        }, () => T.notify('Switch user has some errors!', 'danger'));
    };
}

export function getUser(email, done) {
    return () => {
        const url = `/api/user/item/${email}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin người dùng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createUser(user, done) {
    return dispatch => {
        const url = '/api/user';
        T.post(url, { user }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một người dùng bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới người dùng thành công!', 'success');
                dispatch(getUserPage());
                if (done) done(data);
            }
        }, () => T.notify('Tạo mới một người dùng bị lỗi!', 'danger'));
    };
}

export function updateUser(email, changes, done) {
    return dispatch => {
        const url = '/api/user';
        T.put(url, { email, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu người dùng bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật người dùng thành công!', 'success');
                done && done(data.item);
                dispatch(getUserPage());
            }
        }, () => T.notify('Cập nhật dữ liệu người dùng bị lỗi!', 'danger'));
    };
}

export function deleteUser(email, done) {
    return dispatch => {
        const url = '/api/user';
        T.delete(url, { email }, data => {
            if (data.error) {
                T.notify('Xóa người dùng bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa người dùng thành công!', 'success', false, 800);
                dispatch(getUserPage());
            }
            done && done();
        }, () => T.notify('Xóa người dùng bị lỗi!', 'danger'));
    };
}

export function refreshSessionUser(email) {
    const url = '/api/user/session';
    T.put(url, { email }, () => T.notify('Cập nhật session thành công!', 'success'), () => T.notify('Cập nhật session bị lỗi!', 'danger'));
}

export function changeUser(user) {
    return { type: UserUpdate, item: user };
}

export const ajaxSelectCanBo = {
    url: '/api/can-bo/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.shcc, text: `${item.shcc}: ${item.ho} ${item.ten}` })) : [] })
};

export const ajaxSelectSinhVien = {
    url: '/api/sinh-vien/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.mssv, text: `${item.mssv}: ${item.ho} ${item.ten}` })) : [] })
};