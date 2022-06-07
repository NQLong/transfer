import T from 'view/js/common';
import { userGetStaff } from '../tccbCanBo/redux';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtHocTapCongTacGetAll = 'QtHocTapCongTac:GetAll';
const QtHocTapCongTacGetPage = 'QtHocTapCongTac:GetPage';
const QtHocTapCongTacGetUserPage = 'QtHocTapCongTac:GetUserPage';
const QtHocTapCongTacGetGroupPage = 'QtHocTapCongTac:GetGroupPage';
const QtHocTapCongTacGetGroupPageMa = 'QtHocTapCongTac:GetGroupPageMa';
const QtHocTapCongTacUpdate = 'QtHocTapCongTac:Update';
const QtHocTapCongTacGet = 'QtHocTapCongTac:Get';

export default function QtHocTapCongTacReducer(state = null, data) {
    switch (data.type) {
        case QtHocTapCongTacGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtHocTapCongTacGetGroupPage:
            return Object.assign({}, state, { pageGr: data.page });
        case QtHocTapCongTacGetGroupPageMa:
            return Object.assign({}, state, { pageMa: data.page });
        case QtHocTapCongTacGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtHocTapCongTacGetUserPage:
            return Object.assign({}, state, { userPage: data.page });
        case QtHocTapCongTacGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtHocTapCongTacUpdate:
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
T.initPage('userPageQtHocTapCongTac');
export function getQtHocTapCongTacUserPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('userPageQtHocTapCongTac', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/user/qua-trinh/hoc-tap-cong-tac/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách học tập, công tác bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtHocTapCongTacGetUserPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách học tập, công tác bị lỗi!', 'danger'));
    };
}

export function updateQtHocTapCongTacUserPage(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/hoc-tap-cong-tac';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật học tập, công tác bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật học tập, công tác thành công!', 'success');
                done && done(data.item);
                dispatch(getQtHocTapCongTacUserPage());
            }
        }, () => T.notify('Cập nhật học tập, công tác bị lỗi!', 'danger'));
    };
}

export function createQtHocTapCongTacUserPage(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/hoc-tap-cong-tac';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo học tập, công tác bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo học tập, công tác thành công!', 'success');
                    dispatch(getQtHocTapCongTacUserPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo học tập, công tác bị lỗi!', 'danger'));
    };
}
export function deleteQtHocTapCongTacUserPage(id, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/hoc-tap-cong-tac';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa học tập, công tác bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('học tập, công tác đã xóa thành công!', 'success', false, 800);
                done && done(data.item);
                dispatch(getQtHocTapCongTacUserPage());
            }
        }, () => T.notify('Xóa học tập, công tác bị lỗi!', 'danger'));
    };
}

T.initPage('pageQtHocTapCongTac');
export function getQtHocTapCongTacPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtHocTapCongTac', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/hoc-tap-cong-tac/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách học tập, công tác bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtHocTapCongTacGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách học tập, công tác bị lỗi!', 'danger'));
    };
}

export function getQtHocTapCongTacGroupPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtHocTapCongTac', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/hoc-tap-cong-tac/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter}, data => {
            if (data.error) {
                T.notify('Lấy danh sách học tập, công tác bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtHocTapCongTacGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createQtHocTapCongTacStaff(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/htct';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo học tập, công tác bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                T.notify('Tạo học tập, công tác thành công!', 'success');
                dispatch(getQtHocTapCongTacPage());
                done && done(data);
            }
        }, () => T.notify('Tạo học tập, công tác bị lỗi!', 'danger'));
    };
}

export function createQtHocTapCongTacMultiple(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/htct/create-multiple';
        T.post(url, { data }, res => {
            if (res.error.length) {
                T.notify('Tạo học tập, công tác bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                T.notify('Tạo học tập, công tác thành công!', 'success');
                dispatch(getQtHocTapCongTacPage());
                done && done(data);
            }
        }, () => T.notify('Tạo học tập, công tác bị lỗi!', 'danger'));
    };
}

export function deleteQtHocTapCongTacStaff(id, done) {
    return dispatch => {
        const url = '/api/qua-trinh/htct';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa học tập, công tác bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('học tập, công tác đã xóa thành công!', 'success', false, 800);
                done && done(data.item);
                dispatch(getQtHocTapCongTacPage());
            }
        }, () => T.notify('Xóa học tập, công tác bị lỗi!', 'danger'));
    };
}

export function updateQtHocTapCongTacStaff(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/htct';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật học tập, công tác bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật học tập, công tác thành công!', 'success');
                done && done(data.item);
                dispatch(getQtHocTapCongTacPage());
            }
        }, () => T.notify('Cập nhật học tập, công tác bị lỗi!', 'danger'));
    };
}

T.initPage('groupPageMaQtHocTapCongTac');
export function getQtHocTapCongTacGroupPageMa(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('groupPageMaQtHocTapCongTac', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/hoc-tap-cong-tac/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách học tập, công tác bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtHocTapCongTacGetGroupPageMa, page: data.page });
            }
        }, () => T.notify('Lấy danh sách học tập, công tác bị lỗi!', 'danger'));
    };
}

export function updateQtHocTapCongTacGroupPageMa(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/htct';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật học tập, công tác bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật học tập, công tác thành công!', 'success');
                done && done(data.item);
                dispatch(getQtHocTapCongTacGroupPageMa());
            }
        }, () => T.notify('Cập nhật học tập, công tác bị lỗi!', 'danger'));
    };
}

export function createQtHocTapCongTacGroupPageMa(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/htct';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo học tập, công tác bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo học tập, công tác thành công!', 'success');
                    dispatch(getQtHocTapCongTacGroupPageMa());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo học tập, công tác bị lỗi!', 'danger'));
    };
}
export function deleteQtHocTapCongTacGroupPageMa(id, done) {
    return dispatch => {
        const url = '/api/qua-trinh/htct';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa học tập, công tác bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('học tập, công tác đã xóa thành công!', 'success', false, 800);
                done && done(data.item);
                dispatch(getQtHocTapCongTacGroupPageMa());
            }
        }, () => T.notify('Xóa học tập, công tác bị lỗi!', 'danger'));
    };
}

export function createQtHocTapCongTacStaffUser(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/htct';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình học tập, công tác bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình học tập, công tác thành công!', 'info');
                if (done) done(res);
                dispatch(userGetStaff(data.email));
            }
        }, () => T.notify('Thêm thông tin quá trình học tập, công tác bị lỗi', 'danger'));
    };
}

export function updateQtHocTapCongTacStaffUser(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/htct';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình học tập, công tác bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình học tập, công tác thành công!', 'info');
                if (done) done();
                dispatch(userGetStaff(changes.email));
            }
        }, () => T.notify('Cập nhật thông tin quá trình học tập, công tác bị lỗi', 'danger'));
    };
}

export function deleteQtHocTapCongTacStaffUser(id, email, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/htct';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình học tập, công tác bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình học tập, công tác được xóa thành công!', 'info', false, 800);
                done && done();
                dispatch(userGetStaff(email));
            }
        }, () => T.notify('Xóa thông tin quá trình học tập, công tác bị lỗi', 'danger'));
    };
}