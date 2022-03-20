import T from 'view/js/common';

import { userGetStaff } from '../tccbCanBo/redux';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtLamViecNgoaiGetAll = 'QtLamViecNgoai:GetAll';
const QtLamViecNgoaiGetPage = 'QtLamViecNgoai:GetPage';
const QtLamViecNgoaiGetUserPage = 'QtLamViecNgoai:GetUserPage';
const QtLamViecNgoaiGetGroupPage = 'QtLamViecNgoai:GetGroupPage';
const QtLamViecNgoaiGetGroupPageMa = 'QtLamViecNgoai:GetGroupPageMa';
const QtLamViecNgoaiUpdate = 'QtLamViecNgoai:Update';
const QtLamViecNgoaiGet = 'QtLamViecNgoai:Get';

export default function QtLamViecNgoaiReducer(state = null, data) {
    switch (data.type) {
        case QtLamViecNgoaiGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtLamViecNgoaiGetGroupPage:
            return Object.assign({}, state, { pageGr: data.page });
        case QtLamViecNgoaiGetGroupPageMa:
            return Object.assign({}, state, { pageMa: data.page });
        case QtLamViecNgoaiGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtLamViecNgoaiGetUserPage:
            return Object.assign({}, state, { userPage: data.page });
        case QtLamViecNgoaiGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtLamViecNgoaiUpdate:
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
T.initPage('userPageQtLamViecNgoai');
export function getQtLamViecNgoaiUserPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('userPageQtLamViecNgoai', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/user/qua-trinh/lam-viec-ngoai/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách làm việc ngoài bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtLamViecNgoaiGetUserPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách làm việc ngoài bị lỗi!', 'danger'));
    };
}

export function updateQtLamViecNgoaiUserPage(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/lam-viec-ngoai';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật làm việc ngoài bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật làm việc ngoài thành công!', 'success');
                done && done(data.item);
                dispatch(getQtLamViecNgoaiUserPage());
            }
        }, () => T.notify('Cập nhật làm việc ngoài bị lỗi!', 'danger'));
    };
}

export function createQtLamViecNgoaiUserPage(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/lam-viec-ngoai';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo làm việc ngoài bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo làm việc ngoài thành công!', 'success');
                    dispatch(getQtLamViecNgoaiUserPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo làm việc ngoài bị lỗi!', 'danger'));
    };
}
export function deleteQtLamViecNgoaiUserPage(id, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/lam-viec-ngoai';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa làm việc ngoài bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa thành công!', 'success', false, 800);
                done && done(data.item);
                dispatch(getQtLamViecNgoaiUserPage());
            }
        }, () => T.notify('Xóa làm việc ngoài bị lỗi!', 'danger'));
    };
}

T.initPage('pageQtLamViecNgoai');
export function getQtLamViecNgoaiPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtLamViecNgoai', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/lam-viec-ngoai/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách làm việc ngoài bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtLamViecNgoaiGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách làm việc ngoài bị lỗi!', 'danger'));
    };
}

export function getQtLamViecNgoaiGroupPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtLamViecNgoai', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/lam-viec-ngoai/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách làm việc ngoài bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtLamViecNgoaiGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

T.initPage('groupPageMaQtLamViecNgoai');
export function getQtLamViecNgoaiGroupPageMa(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('groupPageMaQtLamViecNgoai', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/lam-viec-ngoai/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách làm việc ngoài bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtLamViecNgoaiGetGroupPageMa, page: data.page });
            }
        }, () => T.notify('Lấy danh sách làm việc ngoài bị lỗi!', 'danger'));
    };
}

export function updateQtLamViecNgoaiGroupPageMa(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/lam-viec-ngoai';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình làm việc ngoài bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình làm việc ngoài thành công!', 'info');
                done && done(data.item);
                dispatch(getQtLamViecNgoaiGroupPageMa());
            }
        }, () => T.notify('Cập nhật thông tin quá trình làm việc ngoài bị lỗi', 'danger'));
    };
}

export function deleteQtLamViecNgoaiGroupPageMa(id, done) {
    return dispatch => {
        const url = '/api/qua-trinh/lam-viec-ngoai';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình làm việc ngoài bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình làm việc ngoài được xóa thành công!', 'info', false, 800);
                done && done(data.item);
                dispatch(getQtLamViecNgoaiGroupPageMa());
            }
        }, () => T.notify('Xóa thông tin quá trình làm việc ngoài bị lỗi', 'danger'));
    };
}

export function createQtLamViecNgoaiGroupPageMa(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/lam-viec-ngoai';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo làm việc ngoài bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo làm việc ngoài thành công!', 'success');
                    dispatch(getQtLamViecNgoaiGroupPageMa());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo làm việc ngoài bị lỗi!', 'danger'));
    };
}

export function getQtLamViecNgoaiAll(done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/lam-viec-ngoai/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách làm việc ngoài bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: QtLamViecNgoaiGetAll, items: data.items ? data.items : {} });
            }
        }, () => T.notify('Lấy danh sách làm việc ngoài bị lỗi!', 'danger'));
    };
}

export function getQtLamViecNgoai(id, done) {
    return () => {
        const url = `/api/tccb/qua-trinh/lam-viec-ngoai/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy làm việc ngoài bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createQtLamViecNgoaiStaff(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/lam-viec-ngoai';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình làm việc ngoài bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình làm việc ngoài thành công!', 'info');
                dispatch(getQtLamViecNgoaiPage());
                done && done(data);
            }
        }, () => T.notify('Thêm thông tin quá trình làm việc ngoài bị lỗi', 'danger'));
    };
}

export function updateQtLamViecNgoaiStaff(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/lam-viec-ngoai';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình làm việc ngoài bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình làm việc ngoài thành công!', 'info');
                done && done(data.item);
                dispatch(getQtLamViecNgoaiPage());
            }
        }, () => T.notify('Cập nhật thông tin quá trình làm việc ngoài bị lỗi', 'danger'));
    };
}

export function deleteQtLamViecNgoaiStaff(id, done) {
    return dispatch => {
        const url = '/api/qua-trinh/lam-viec-ngoai';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình làm việc ngoài bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình làm việc ngoài được xóa thành công!', 'info', false, 800);
                dispatch(getQtLamViecNgoaiPage());
                done && done(data.item);
            }
        }, () => T.notify('Xóa thông tin quá trình làm việc ngoài bị lỗi', 'danger'));
    };
}

export function createQtLamViecNgoaiStaffUser(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/lam-viec-ngoai';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình làm việc ngoài bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình làm việc ngoài thành công!', 'info');
                if (done) done(data);
                dispatch(userGetStaff(data.email));
            }
        }, () => T.notify('Thêm thông tin quá trình làm việc ngoài bị lỗi', 'danger'));
    };
}

export function updateQtLamViecNgoaiStaffUser(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/lam-viec-ngoai';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình làm việc ngoài bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình làm việc ngoài thành công!', 'info');
                if (done) done();
                dispatch(userGetStaff(changes.email));
            }
        }, () => T.notify('Cập nhật thông tin quá trình làm việc ngoài bị lỗi', 'danger'));
    };
}

export function deleteQtLamViecNgoaiStaffUser(id, email, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/lam-viec-ngoai';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình làm việc ngoài bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình làm việc ngoài được xóa thành công!', 'info', false, 800);
                done && done();
                dispatch(userGetStaff(email));
            }
        }, () => T.notify('Xóa thông tin quá trình làm việc ngoài bị lỗi', 'danger'));
    };
}