import T from 'view/js/common';

import { userGetStaff } from '../tccbCanBo/redux';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtNghiKhongLuongGetAll = 'QtNghiKhongLuong:GetAll';
const QtNghiKhongLuongGetPage = 'QtNghiKhongLuong:GetPage';
const QtNghiKhongLuongGetUserPage = 'QtNghiKhongLuong:GetUserPage';
const QtNghiKhongLuongGetGroupPage = 'QtNghiKhongLuong:GetGroupPage';
const QtNghiKhongLuongGetGroupPageMa = 'QtNghiKhongLuong:GetGroupPageMa';
const QtNghiKhongLuongUpdate = 'QtNghiKhongLuong:Update';
const QtNghiKhongLuongGet = 'QtNghiKhongLuong:Get';

export default function QtNghiKhongLuongReducer(state = null, data) {
    switch (data.type) {
        case QtNghiKhongLuongGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtNghiKhongLuongGetGroupPage:
            return Object.assign({}, state, { page_gr: data.page });
        case QtNghiKhongLuongGetGroupPageMa:
            return Object.assign({}, state, { page_ma: data.page });
        case QtNghiKhongLuongGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtNghiKhongLuongGetUserPage:
            return Object.assign({}, state, { user_page: data.page });
        case QtNghiKhongLuongGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtNghiKhongLuongUpdate:
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
T.initPage('userPageQtNghiKhongLuong');
export function getQtNghiKhongLuongUserPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('userPageQtNghiKhongLuong', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/user/qua-trinh/nghi-khong-luong/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nghỉ không lương bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtNghiKhongLuongGetUserPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách nghỉ không lương bị lỗi!', 'danger'));
    };
}

export function updateQtNghiKhongLuongUserPage(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nghi-khong-luong';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật nghỉ không lương bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật nghỉ không lương thành công!', 'success');
                done && done(data.item);
                dispatch(getQtNghiKhongLuongUserPage());
            }
        }, () => T.notify('Cập nhật nghỉ không lương bị lỗi!', 'danger'));
    };
}

export function createQtNghiKhongLuongUserPage(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nghi-khong-luong';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo nghỉ không lương bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo nghỉ không lương thành công!', 'success');
                    dispatch(getQtNghiKhongLuongUserPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo nghỉ không lương bị lỗi!', 'danger'));
    };
}
export function deleteQtNghiKhongLuongUserPage(id, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nghi-khong-luong';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa nghỉ không lương bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa thành công!', 'success', false, 800);
                done && done(data.item);
                dispatch(getQtNghiKhongLuongUserPage());
            }
        }, () => T.notify('Xóa nghỉ không lương bị lỗi!', 'danger'));
    };
}

T.initPage('pageQtNghiKhongLuong');
export function getQtNghiKhongLuongPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtNghiKhongLuong', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/nghi-khong-luong/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nghỉ không lương bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtNghiKhongLuongGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách nghỉ không lương bị lỗi!', 'danger'));
    };
}

export function getQtNghiKhongLuongGroupPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtNghiKhongLuong', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/nghi-khong-luong/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nghỉ không lương bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtNghiKhongLuongGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

T.initPage('groupPageMaQtNghiKhongLuong');
export function getQtNghiKhongLuongGroupPageMa(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('groupPageMaQtNghiKhongLuong', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/nghi-khong-luong/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nghỉ không lương bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtNghiKhongLuongGetGroupPageMa, page: data.page });
            }
        }, () => T.notify('Lấy danh sách nghỉ không lương bị lỗi!', 'danger'));
    };
}

export function updateQtNghiKhongLuongGroupPageMa(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nghi-khong-luong';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình nghỉ không lương bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình nghỉ không lương thành công!', 'info');
                done && done(data.item);
                dispatch(getQtNghiKhongLuongGroupPageMa());
            }
        }, () => T.notify('Cập nhật thông tin quá trình nghỉ không lương bị lỗi', 'danger'));
    };
}

export function deleteQtNghiKhongLuongGroupPageMa(id, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nghi-khong-luong';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình nghỉ không lương bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình nghỉ không lương được xóa thành công!', 'info', false, 800);
                done && done(data.item);
                dispatch(getQtNghiKhongLuongGroupPageMa());
            }
        }, () => T.notify('Xóa thông tin quá trình nghỉ không lương bị lỗi', 'danger'));
    };
}

export function createQtNghiKhongLuongGroupPageMa(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nghi-khong-luong';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo nghỉ không lương bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo nghỉ không lương thành công!', 'success');
                    dispatch(getQtNghiKhongLuongGroupPageMa());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo nghỉ không lương bị lỗi!', 'danger'));
    };
}

export function getQtNghiKhongLuongAll(done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/nghi-khong-luong/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách nghỉ không lương bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: QtNghiKhongLuongGetAll, items: data.items ? data.items : {} });
            }
        }, () => T.notify('Lấy danh sách nghỉ không lương bị lỗi!', 'danger'));
    };
}

export function getQtNghiKhongLuong(id, done) {
    return () => {
        const url = `/api/tccb/qua-trinh/nghi-khong-luong/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy nghỉ không lương bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createQtNghiKhongLuongStaff(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nghi-khong-luong';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình nghỉ không lương bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình nghỉ không lương thành công!', 'info');
                dispatch(getQtNghiKhongLuongPage());
                done && done(data);
            }
        }, () => T.notify('Thêm thông tin quá trình nghỉ không lương bị lỗi', 'danger'));
    };
}

export function updateQtNghiKhongLuongStaff(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nghi-khong-luong';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình nghỉ không lương bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình nghỉ không lương thành công!', 'info');
                done && done(data.item);
                dispatch(getQtNghiKhongLuongPage());
            }
        }, () => T.notify('Cập nhật thông tin quá trình nghỉ không lương bị lỗi', 'danger'));
    };
}

export function deleteQtNghiKhongLuongStaff(id, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nghi-khong-luong';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình nghỉ không lương bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình nghỉ không lương được xóa thành công!', 'info', false, 800);
                dispatch(getQtNghiKhongLuongPage());
                done && done(data.item);
            }
        }, () => T.notify('Xóa thông tin quá trình nghỉ không lương bị lỗi', 'danger'));
    };
}

export function createQtNghiKhongLuongStaffUser(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nghi-khong-luong';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình nghỉ không lương bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình nghỉ không lương thành công!', 'info');
                if (done) done(data);
                dispatch(userGetStaff(data.email));
            }
        }, () => T.notify('Thêm thông tin quá trình nghỉ không lương bị lỗi', 'danger'));
    };
}

export function updateQtNghiKhongLuongStaffUser(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nghi-khong-luong';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình nghỉ không lương bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình nghỉ không lương thành công!', 'info');
                if (done) done();
                dispatch(userGetStaff(changes.email));
            }
        }, () => T.notify('Cập nhật thông tin quá trình nghỉ không lương bị lỗi', 'danger'));
    };
}

export function deleteQtNghiKhongLuongStaffUser(id, email, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nghi-khong-luong';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình nghỉ không lương bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình nghỉ không lương được xóa thành công!', 'info', false, 800);
                done && done();
                dispatch(userGetStaff(email));
            }
        }, () => T.notify('Xóa thông tin quá trình nghỉ không lương bị lỗi', 'danger'));
    };
}