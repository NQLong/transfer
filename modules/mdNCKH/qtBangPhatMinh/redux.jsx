import T from 'view/js/common';

import { userGetStaff } from '../../mdTccb/tccbCanBo/redux';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtBangPhatMinhGetAll = 'QtBangPhatMinh:GetAll';
const QtBangPhatMinhGetPage = 'QtBangPhatMinh:GetPage';
const QtBangPhatMinhGetUserPage = 'QtBangPhatMinh:GetUserPage';
const QtBangPhatMinhGetGroupPage = 'QtBangPhatMinh:GetGroupPage';
const QtBangPhatMinhGetGroupPageMa = 'QtBangPhatMinh:GetGroupPageMa';
const QtBangPhatMinhUpdate = 'QtBangPhatMinh:Update';
const QtBangPhatMinhGet = 'QtBangPhatMinh:Get';

export default function QtBangPhatMinhReducer(state = null, data) {
    switch (data.type) {
        case QtBangPhatMinhGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtBangPhatMinhGetGroupPage:
            return Object.assign({}, state, { pageGr: data.page });
        case QtBangPhatMinhGetGroupPageMa:
            return Object.assign({}, state, { pageMa: data.page });
        case QtBangPhatMinhGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtBangPhatMinhGetUserPage:
            return Object.assign({}, state, { userPage: data.page });
        case QtBangPhatMinhGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtBangPhatMinhUpdate:
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
T.initPage('userPageQtBangPhatMinh');
export function getQtBangPhatMinhUserPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('userPageQtBangPhatMinh', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/user/qua-trinh/bang-phat-minh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách bằng phát minh bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtBangPhatMinhGetUserPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách bằng phát minh bị lỗi!', 'danger'));
    };
}

export function updateQtBangPhatMinhUserPage(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/bang-phat-minh';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật bằng phát minh bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật bằng phát minh thành công!', 'success');
                done && done(data.item);
                dispatch(getQtBangPhatMinhUserPage());
            }
        }, () => T.notify('Cập nhật bằng phát minh bị lỗi!', 'danger'));
    };
}

export function createQtBangPhatMinhUserPage(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/bang-phat-minh';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo bằng phát minh bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo bằng phát minh thành công!', 'success');
                    dispatch(getQtBangPhatMinhUserPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo bằng phát minh bị lỗi!', 'danger'));
    };
}

export function deleteQtBangPhatMinhUserPage(id, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/bang-phat-minh';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa bằng phát minh bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa thành công!', 'success', false, 800);
                done && done(data.item);
                dispatch(getQtBangPhatMinhUserPage());
            }
        }, () => T.notify('Xóa bằng phát minh bị lỗi!', 'danger'));
    };
}

T.initPage('pageQtBangPhatMinh');
export function getQtBangPhatMinhPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtBangPhatMinh', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/khcn/qua-trinh/bang-phat-minh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách bằng phát minh bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtBangPhatMinhGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách bằng phát minh bị lỗi!', 'danger'));
    };
}

export function getQtBangPhatMinhGroupPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtBangPhatMinh', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/khcn/qua-trinh/bang-phat-minh/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách bằng phát minh bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtBangPhatMinhGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

T.initPage('groupPageMaQtBangPhatMinh');
export function getQtBangPhatMinhGroupPageMa(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('groupPageMaQtBangPhatMinh', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/khcn/qua-trinh/bang-phat-minh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách bằng phát minh bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtBangPhatMinhGetGroupPageMa, page: data.page });
            }
        }, () => T.notify('Lấy danh sách bằng phát minh bị lỗi!', 'danger'));
    };
}

export function updateQtBangPhatMinhGroupPageMa(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/bang-phat-minh';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình bằng phát minh bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình bằng phát minh thành công!', 'info');
                done && done(data.item);
                dispatch(getQtBangPhatMinhGroupPageMa());
            }
        }, () => T.notify('Cập nhật thông tin quá trình bằng phát minh bị lỗi', 'danger'));
    };
}

export function deleteQtBangPhatMinhGroupPageMa(id, done) {
    return dispatch => {
        const url = '/api/qua-trinh/bang-phat-minh';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình bằng phát minh bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình bằng phát minh được xóa thành công!', 'info', false, 800);
                done && done(data.item);
                dispatch(getQtBangPhatMinhGroupPageMa());
            }
        }, () => T.notify('Xóa thông tin quá trình bằng phát minh bị lỗi', 'danger'));
    };
}

export function createQtBangPhatMinhGroupPageMa(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/bang-phat-minh';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo bằng phát minh bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo bằng phát minh thành công!', 'success');
                    dispatch(getQtBangPhatMinhGroupPageMa());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo bằng phát minh bị lỗi!', 'danger'));
    };
}

export function getQtBangPhatMinhAll(done) {
    return dispatch => {
        const url = '/api/khcn/qua-trinh/bang-phat-minh/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách bằng phát minh bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: QtBangPhatMinhGetAll, items: data.items ? data.items : {} });
            }
        }, () => T.notify('Lấy danh sách bằng phát minh bị lỗi!', 'danger'));
    };
}

export function getQtBangPhatMinh(id, done) {
    return () => {
        const url = `/api/khcn/qua-trinh/bang-phat-minh/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy bằng phát minh bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createQtBangPhatMinhStaff(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/bang-phat-minh';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình bằng phát minh bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình bằng phát minh thành công!', 'info');
                dispatch(getQtBangPhatMinhPage());
                done && done(data);
            }
        }, () => T.notify('Thêm thông tin quá trình bằng phát minh bị lỗi', 'danger'));
    };
}

export function createQtBangPhatMinhMultiple(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/bang-phat-minh/create-multiple';
        T.post(url, { data }, res => {
            if (res.error.length) {
                T.notify('Thêm thông tin quá trình bằng phát minh bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình bằng phát minh thành công!', 'info');
                dispatch(getQtBangPhatMinhPage());
                done && done(data);
            }
        }, () => T.notify('Thêm thông tin quá trình bằng phát minh bị lỗi', 'danger'));
    };
}

export function updateQtBangPhatMinhStaff(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/bang-phat-minh';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình bằng phát minh bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình bằng phát minh thành công!', 'info');
                done && done(data.item);
                dispatch(getQtBangPhatMinhPage());
            }
        }, () => T.notify('Cập nhật thông tin quá trình bằng phát minh bị lỗi', 'danger'));
    };
}

export function deleteQtBangPhatMinhStaff(id, done) {
    return dispatch => {
        const url = '/api/qua-trinh/bang-phat-minh';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình bằng phát minh bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình bằng phát minh được xóa thành công!', 'info', false, 800);
                dispatch(getQtBangPhatMinhPage());
                done && done(data.item);
            }
        }, () => T.notify('Xóa thông tin quá trình bằng phát minh bị lỗi', 'danger'));
    };
}

export function createQtBangPhatMinhStaffUser(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/bang-phat-minh';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình bằng phát minh bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình bằng phát minh thành công!', 'info');
                if (done) done(data);
                dispatch(userGetStaff(data.email));
            }
        }, () => T.notify('Thêm thông tin quá trình bằng phát minh bị lỗi', 'danger'));
    };
}

export function updateQtBangPhatMinhStaffUser(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/bang-phat-minh';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình bằng phát minh bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình bằng phát minh thành công!', 'info');
                if (done) done();
                dispatch(userGetStaff(changes.email));
            }
        }, () => T.notify('Cập nhật thông tin quá trình bằng phát minh bị lỗi', 'danger'));
    };
}

export function deleteQtBangPhatMinhStaffUser(id, email, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/bang-phat-minh';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình bằng phát minh bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình bằng phát minh được xóa thành công!', 'info', false, 800);
                done && done();
                dispatch(userGetStaff(email));
            }
        }, () => T.notify('Xóa thông tin quá trình bằng phát minh bị lỗi', 'danger'));
    };
}