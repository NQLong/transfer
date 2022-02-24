import T from 'view/js/common';

import { userGetStaff } from '../tccbCanBo/redux';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtNghiPhepGetAll = 'QtNghiPhep:GetAll';
const QtNghiPhepGetPage = 'QtNghiPhep:GetPage';
const QtNghiPhepGetUserPage = 'QtNghiPhep:GetUserPage';
const QtNghiPhepGetGroupPage = 'QtNghiPhep:GetGroupPage';
const QtNghiPhepGetGroupPageMa = 'QtNghiPhep:GetGroupPageMa';
const QtNghiPhepUpdate = 'QtNghiPhep:Update';
const QtNghiPhepGet = 'QtNghiPhep:Get';

export default function QtNghiPhepReducer(state = null, data) {
    switch (data.type) {
        case QtNghiPhepGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtNghiPhepGetGroupPage:
            return Object.assign({}, state, { page_gr: data.page });
        case QtNghiPhepGetGroupPageMa:
            return Object.assign({}, state, { page_ma: data.page });
        case QtNghiPhepGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtNghiPhepGetUserPage:
            return Object.assign({}, state, { user_page: data.page });
        case QtNghiPhepGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtNghiPhepUpdate:
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
T.initPage('userPageQtNghiPhep');
export function getQtNghiPhepUserPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('userPageQtNghiPhep', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/user/qua-trinh/nghi-phep/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nghỉ phép bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtNghiPhepGetUserPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách nghỉ phép bị lỗi!', 'danger'));
    };
}

export function updateQtNghiPhepUserPage(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nghi-phep';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật nghỉ phép bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật nghỉ phép thành công!', 'success');
                done && done(data.item);
                dispatch(getQtNghiPhepUserPage());
            }
        }, () => T.notify('Cập nhật nghỉ phép bị lỗi!', 'danger'));
    };
}

export function createQtNghiPhepUserPage(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nghi-phep';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo nghỉ phép bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo nghỉ phép thành công!', 'success');
                    dispatch(getQtNghiPhepUserPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo nghỉ phép bị lỗi!', 'danger'));
    };
}
export function deleteQtNghiPhepUserPage(id, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nghi-phep';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa nghỉ phép bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa thành công!', 'success', false, 800);
                done && done(data.item);
                dispatch(getQtNghiPhepUserPage());
            }
        }, () => T.notify('Xóa nghỉ phép bị lỗi!', 'danger'));
    };
}

T.initPage('pageQtNghiPhep');
export function getQtNghiPhepPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtNghiPhep', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/nghi-phep/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nghỉ phép bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtNghiPhepGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách nghỉ phép bị lỗi!', 'danger'));
    };
}

export function getQtNghiPhepGroupPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtNghiPhep', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/nghi-phep/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nghỉ phép bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtNghiPhepGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

T.initPage('groupPageMaQtNghiPhep');
export function getQtNghiPhepGroupPageMa(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('groupPageMaQtNghiPhep', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/nghi-phep/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nghỉ phép bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtNghiPhepGetGroupPageMa, page: data.page });
            }
        }, () => T.notify('Lấy danh sách nghỉ phép bị lỗi!', 'danger'));
    };
}

export function updateQtNghiPhepGroupPageMa(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nghi-phep';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình nghỉ phép bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình nghỉ phép thành công!', 'info');
                done && done(data.item);
                dispatch(getQtNghiPhepGroupPageMa());
            }
        }, () => T.notify('Cập nhật thông tin quá trình nghỉ phép bị lỗi', 'danger'));
    };
}

export function deleteQtNghiPhepGroupPageMa(id, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nghi-phep';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình nghỉ phép bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình nghỉ phép được xóa thành công!', 'info', false, 800);
                done && done(data.item);
                dispatch(getQtNghiPhepGroupPageMa());
            }
        }, () => T.notify('Xóa thông tin quá trình nghỉ phép bị lỗi', 'danger'));
    };
}

export function createQtNghiPhepGroupPageMa(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nghi-phep';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo nghỉ phép bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo nghỉ phép thành công!', 'success');
                    dispatch(getQtNghiPhepGroupPageMa());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo nghỉ phép bị lỗi!', 'danger'));
    };
}

export function getQtNghiPhepAll(done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/nghi-phep/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách nghỉ phép bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: QtNghiPhepGetAll, items: data.items ? data.items : {} });
            }
        }, () => T.notify('Lấy danh sách nghỉ phép bị lỗi!', 'danger'));
    };
}

export function getQtNghiPhep(id, done) {
    return () => {
        const url = `/api/tccb/qua-trinh/nghi-phep/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy nghỉ phép bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createQtNghiPhepStaff(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nghi-phep';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình nghỉ phép bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình nghỉ phép thành công!', 'info');
                dispatch(getQtNghiPhepPage());
                done && done(data);
            }
        }, () => T.notify('Thêm thông tin quá trình nghỉ phép bị lỗi', 'danger'));
    };
}

export function updateQtNghiPhepStaff(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nghi-phep';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình nghỉ phép bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình nghỉ phép thành công!', 'info');
                done && done(data.item);
                dispatch(getQtNghiPhepPage());
            }
        }, () => T.notify('Cập nhật thông tin quá trình nghỉ phép bị lỗi', 'danger'));
    };
}

export function deleteQtNghiPhepStaff(id, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nghi-phep';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình nghỉ phép bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình nghỉ phép được xóa thành công!', 'info', false, 800);
                dispatch(getQtNghiPhepPage());
                done && done(data.item);
            }
        }, () => T.notify('Xóa thông tin quá trình nghỉ phép bị lỗi', 'danger'));
    };
}

export function createQtNghiPhepStaffUser(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nghi-phep';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình nghỉ phép bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình nghỉ phép thành công!', 'info');
                if (done) done(data);
                dispatch(userGetStaff(data.email));
            }
        }, () => T.notify('Thêm thông tin quá trình nghỉ phép bị lỗi', 'danger'));
    };
}

export function updateQtNghiPhepStaffUser(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nghi-phep';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình nghỉ phép bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình nghỉ phép thành công!', 'info');
                if (done) done();
                dispatch(userGetStaff(changes.email));
            }
        }, () => T.notify('Cập nhật thông tin quá trình nghỉ phép bị lỗi', 'danger'));
    };
}

export function deleteQtNghiPhepStaffUser(id, email, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nghi-phep';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình nghỉ phép bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình nghỉ phép được xóa thành công!', 'info', false, 800);
                done && done();
                dispatch(userGetStaff(email));
            }
        }, () => T.notify('Xóa thông tin quá trình nghỉ phép bị lỗi', 'danger'));
    };
}