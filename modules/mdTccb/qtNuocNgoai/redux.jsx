import T from 'view/js/common';

import { userGetStaff } from '../tccbCanBo/redux';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtNuocNgoaiGetAll = 'QtNuocNgoai:GetAll';
const QtNuocNgoaiGetPage = 'QtNuocNgoai:GetPage';
const QtNuocNgoaiGetUserPage = 'QtNuocNgoai:GetUserPage';
const QtNuocNgoaiGetGroupPage = 'QtNuocNgoai:GetGroupPage';
const QtNuocNgoaiGetGroupPageMa = 'QtNuocNgoai:GetGroupPageMa';
const QtNuocNgoaiUpdate = 'QtNuocNgoai:Update';
const QtNuocNgoaiGet = 'QtNuocNgoai:Get';

export default function QtNuocNgoaiReducer(state = null, data) {
    switch (data.type) {
        case QtNuocNgoaiGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtNuocNgoaiGetGroupPage:
            return Object.assign({}, state, { page_gr: data.page });
        case QtNuocNgoaiGetGroupPageMa:
            return Object.assign({}, state, { page_ma: data.page });
        case QtNuocNgoaiGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtNuocNgoaiGetUserPage:
            return Object.assign({}, state, { user_page: data.page });
        case QtNuocNgoaiGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtNuocNgoaiUpdate:
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
T.initPage('userPageQtNuocNgoai');
export function getQtNuocNgoaiUserPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('userPageQtNuocNgoai', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/user/qua-trinh/nuoc-ngoai/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách công tác ngoài nước bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtNuocNgoaiGetUserPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách công tác ngoài nước bị lỗi!', 'danger'));
    };
}

export function updateQtNuocNgoaiUserPage(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nuoc-ngoai';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật công tác ngoài nước bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật công tác ngoài nước thành công!', 'success');
                done && done(data.item);
                dispatch(getQtNuocNgoaiUserPage());
            }
        }, () => T.notify('Cập nhật công tác ngoài nước bị lỗi!', 'danger'));
    };
}

export function createQtNuocNgoaiUserPage(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nuoc-ngoai';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo công tác ngoài nước bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo công tác ngoài nước thành công!', 'success');
                    dispatch(getQtNuocNgoaiUserPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo công tác ngoài nước bị lỗi!', 'danger'));
    };
}
export function deleteQtNuocNgoaiUserPage(id, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nuoc-ngoai';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa công tác ngoài nước bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa thành công!', 'success', false, 800);
                done && done(data.item);
                dispatch(getQtNuocNgoaiUserPage());
            }
        }, () => T.notify('Xóa công tác ngoài nước bị lỗi!', 'danger'));
    };
}

T.initPage('pageQtNuocNgoai');
export function getQtNuocNgoaiPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtNuocNgoai', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/nuoc-ngoai/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách công tác ngoài nước bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtNuocNgoaiGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách công tác ngoài nước bị lỗi!', 'danger'));
    };
}

export function getQtNuocNgoaiGroupPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtNuocNgoai', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/nuoc-ngoai/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách công tác ngoài nước bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtNuocNgoaiGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

T.initPage('groupPageMaQtNuocNgoai');
export function getQtNuocNgoaiGroupPageMa(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('groupPageMaQtNuocNgoai', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/nuoc-ngoai/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách công tác ngoài nước bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtNuocNgoaiGetGroupPageMa, page: data.page });
            }
        }, () => T.notify('Lấy danh sách công tác ngoài nước bị lỗi!', 'danger'));
    };
}

export function updateQtNuocNgoaiGroupPageMa(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nuoc-ngoai';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình công tác ngoài nước bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình công tác ngoài nước thành công!', 'info');
                done && done(data.item);
                dispatch(getQtNuocNgoaiGroupPageMa());
            }
        }, () => T.notify('Cập nhật thông tin quá trình công tác ngoài nước bị lỗi', 'danger'));
    };
}

export function deleteQtNuocNgoaiGroupPageMa(id, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nuoc-ngoai';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình công tác ngoài nước bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình công tác ngoài nước được xóa thành công!', 'info', false, 800);
                done && done(data.item);
                dispatch(getQtNuocNgoaiGroupPageMa());
            }
        }, () => T.notify('Xóa thông tin quá trình công tác ngoài nước bị lỗi', 'danger'));
    };
}

export function createQtNuocNgoaiGroupPageMa(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nuoc-ngoai';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo công tác ngoài nước bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo công tác ngoài nước thành công!', 'success');
                    dispatch(getQtNuocNgoaiGroupPageMa());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo công tác ngoài nước bị lỗi!', 'danger'));
    };
}

export function getQtNuocNgoaiAll(done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/nuoc-ngoai/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách công tác ngoài nước bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: QtNuocNgoaiGetAll, items: data.items ? data.items : {} });
            }
        }, () => T.notify('Lấy danh sách công tác ngoài nước bị lỗi!', 'danger'));
    };
}

export function getQtNuocNgoai(id, done) {
    return () => {
        const url = `/api/tccb/qua-trinh/nuoc-ngoai/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy công tác ngoài nước bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createQtNuocNgoaiStaff(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nuoc-ngoai';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình công tác ngoài nước bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình công tác ngoài nước thành công!', 'info');
                dispatch(getQtNuocNgoaiPage());
                done && done(data);
            }
        }, () => T.notify('Thêm thông tin quá trình công tác ngoài nước bị lỗi', 'danger'));
    };
}

export function updateQtNuocNgoaiStaff(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nuoc-ngoai';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình công tác ngoài nước bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình công tác ngoài nước thành công!', 'info');
                done && done(data.item);
                dispatch(getQtNuocNgoaiPage());
            }
        }, () => T.notify('Cập nhật thông tin quá trình công tác ngoài nước bị lỗi', 'danger'));
    };
}

export function deleteQtNuocNgoaiStaff(id, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nuoc-ngoai';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình công tác ngoài nước bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình công tác ngoài nước được xóa thành công!', 'info', false, 800);
                dispatch(getQtNuocNgoaiPage());
                done && done(data.item);
            }
        }, () => T.notify('Xóa thông tin quá trình công tác ngoài nước bị lỗi', 'danger'));
    };
}

export function createQtNuocNgoaiStaffUser(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nuoc-ngoai';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình công tác ngoài nước bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình công tác ngoài nước thành công!', 'info');
                if (done) done(data);
                dispatch(userGetStaff(data.email));
            }
        }, () => T.notify('Thêm thông tin quá trình công tác ngoài nước bị lỗi', 'danger'));
    };
}

export function updateQtNuocNgoaiStaffUser(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nuoc-ngoai';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình công tác ngoài nước bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình công tác ngoài nước thành công!', 'info');
                if (done) done();
                dispatch(userGetStaff(changes.email));
            }
        }, () => T.notify('Cập nhật thông tin quá trình công tác ngoài nước bị lỗi', 'danger'));
    };
}

export function deleteQtNuocNgoaiStaffUser(id, email, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nuoc-ngoai';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình công tác ngoài nước bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình công tác ngoài nước được xóa thành công!', 'info', false, 800);
                done && done();
                dispatch(userGetStaff(email));
            }
        }, () => T.notify('Xóa thông tin quá trình công tác ngoài nước bị lỗi', 'danger'));
    };
}