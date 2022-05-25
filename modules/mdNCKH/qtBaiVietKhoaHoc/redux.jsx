import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtBaiVietKhoaHocGetAll = 'QtBaiVietKhoaHoc:GetAll';
const QtBaiVietKhoaHocGetPage = 'QtBaiVietKhoaHoc:GetPage';
const QtBaiVietKhoaHocGetUserPage = 'QtBaiVietKhoaHoc:GetUserPage';
const QtBaiVietKhoaHocGetGroupPage = 'QtBaiVietKhoaHoc:GetGroupPage';
const QtBaiVietKhoaHocGetGroupPageMa = 'QtBaiVietKhoaHoc:GetGroupPageMa';
const QtBaiVietKhoaHocUpdate = 'QtBaiVietKhoaHoc:Update';
const QtBaiVietKhoaHocGet = 'QtBaiVietKhoaHoc:Get';

export default function QtBaiVietKhoaHocReducer(state = null, data) {
    switch (data.type) {
        case QtBaiVietKhoaHocGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtBaiVietKhoaHocGetGroupPage:
            return Object.assign({}, state, { pageGr: data.page });
        case QtBaiVietKhoaHocGetGroupPageMa:
            return Object.assign({}, state, { pageMa: data.page });
        case QtBaiVietKhoaHocGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtBaiVietKhoaHocGetUserPage:
            return Object.assign({}, state, { userPage: data.page });
        case QtBaiVietKhoaHocGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtBaiVietKhoaHocUpdate:
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
T.initPage('userPageQtBaiVietKhoaHoc');
export function getQtBaiVietKhoaHocUserPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('userPageQtBaiVietKhoaHoc', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/user/qua-trinh/bai-viet-khoa-hoc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách bài viết khoa học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtBaiVietKhoaHocGetUserPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách bài viết khoa học bị lỗi!', 'danger'));
    };
}

export function updateQtBaiVietKhoaHocUserPage(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/bai-viet-khoa-hoc';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật bài viết khoa học bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật bài viết khoa học thành công!', 'success');
                done && done(data.item);
                dispatch(getQtBaiVietKhoaHocUserPage());
            }
        }, () => T.notify('Cập nhật bài viết khoa học bị lỗi!', 'danger'));
    };
}

export function createQtBaiVietKhoaHocUserPage(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/bai-viet-khoa-hoc';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo bài viết khoa học bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo bài viết khoa học thành công!', 'success');
                    dispatch(getQtBaiVietKhoaHocUserPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo bài viết khoa học bị lỗi!', 'danger'));
    };
}
export function deleteQtBaiVietKhoaHocUserPage(id, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/bai-viet-khoa-hoc';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa bài viết khoa học bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('bài viết khoa học đã xóa thành công!', 'success', false, 800);
                done && done(data.item);
                dispatch(getQtBaiVietKhoaHocUserPage());
            }
        }, () => T.notify('Xóa bài viết khoa học bị lỗi!', 'danger'));
    };
}

T.initPage('pageQtBaiVietKhoaHoc');
export function getQtBaiVietKhoaHocPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtBaiVietKhoaHoc', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/khcn/qua-trinh/bai-viet-khoa-hoc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách bài viết khoa học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtBaiVietKhoaHocGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách bài viết khoa học bị lỗi!', 'danger'));
    };
}

export function getQtBaiVietKhoaHocGroupPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtBaiVietKhoaHoc', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/khcn/qua-trinh/bai-viet-khoa-hoc/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách bài viết khoa học bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtBaiVietKhoaHocGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

T.initPage('groupPageMaQtBaiVietKhoaHoc');
export function getQtBaiVietKhoaHocGroupPageMa(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('groupPageMaQtBaiVietKhoaHoc', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/khcn/qua-trinh/bai-viet-khoa-hoc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách bài viết khoa học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtBaiVietKhoaHocGetGroupPageMa, page: data.page });
            }
        }, () => T.notify('Lấy danh sách bài viết khoa học bị lỗi!', 'danger'));
    };
}

export function createQtBaiVietKhoaHocGroupPageMa(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/bai-viet-khoa-hoc';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình bài viết khoa học bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                if (done) {
                    T.notify('Thêm thông tin quá trình bài viết khoa học thành công!', 'info');
                    done(data);
                    dispatch(getQtBaiVietKhoaHocGroupPageMa());
                }
            }
        }, () => T.notify('Thêm thông tin quá trình bài viết khoa học bị lỗi', 'danger'));
    };
}

export function updateQtBaiVietKhoaHocGroupPageMa(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/bai-viet-khoa-hoc';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật bài viết khoa học bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật bài viết khoa học thành công!', 'success');
                done && done(data.item);
                dispatch(getQtBaiVietKhoaHocGroupPageMa());
            }
        }, () => T.notify('Cập nhật bài viết khoa học bị lỗi!', 'danger'));
    };
}

export function deleteQtBaiVietKhoaHocGroupPageMa(id, done) {
    return dispatch => {
        const url = '/api/qua-trinh/bai-viet-khoa-hoc';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình bài viết khoa học bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình bài viết khoa học được xóa thành công!', 'info', false, 800);
                done && done(data.item);
                dispatch(getQtBaiVietKhoaHocGroupPageMa());
            }
        }, () => T.notify('Xóa thông tin quá trình bài viết khoa học bị lỗi', 'danger'));
    };
}

export function createQtBaiVietKhoaHocStaff(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/bai-viet-khoa-hoc';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình bài viết khoa học bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình bài viết khoa học thành công!', 'info');
                dispatch(getQtBaiVietKhoaHocPage());
                done && done(data);
            }
        }, () => T.notify('Thêm thông tin quá trình bài viết khoa học bị lỗi', 'danger'));
    };
}

export function createQtBaiVietKhoaHocMultiple(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/bai-viet-khoa-hoc/create-multiple';
        T.post(url, { data }, res => {
            if (res.error.length) {
                T.notify('Thêm thông tin quá trình bài viết khoa học bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình bài viết khoa học thành công!', 'info');
                dispatch(getQtBaiVietKhoaHocPage());
                done && done(data);
            }
        }, () => T.notify('Thêm thông tin quá trình bài viết khoa học bị lỗi', 'danger'));
    };
}

export function updateQtBaiVietKhoaHocStaff(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/bai-viet-khoa-hoc';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình bài viết khoa học bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình bài viết khoa học thành công!', 'info');
                done && done(data.item);
                dispatch(getQtBaiVietKhoaHocPage());
            }
        }, () => T.notify('Cập nhật thông tin quá trình bài viết khoa học bị lỗi', 'danger'));
    };
}

export function deleteQtBaiVietKhoaHocStaff(id, done) {
    return dispatch => {
        const url = '/api/qua-trinh/bai-viet-khoa-hoc';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình bài viết khoa học bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình bài viết khoa học được xóa thành công!', 'info', false, 800);
                done && done(data.item);
                dispatch(getQtBaiVietKhoaHocPage());
            }
        }, () => T.notify('Xóa thông tin quá trình bài viết khoa học bị lỗi', 'danger'));
    };
}

export function createQtBaiVietKhoaHocStaffUser(data, done) {
    return () => {
        const url = '/api/user/qua-trinh/bai-viet-khoa-hoc';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình bài viết khoa học bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình bài viết khoa học thành công!', 'info');
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin quá trình bài viết khoa học bị lỗi', 'danger'));
    };
}

export function updateQtBaiVietKhoaHocStaffUser(id, changes, done) {
    return () => {
        const url = '/api/user/qua-trinh/bai-viet-khoa-hoc';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình bài viết khoa học bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình bài viết khoa học thành công!', 'info');
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật thông tin quá trình bài viết khoa học bị lỗi', 'danger'));
    };
}

export function deleteQtBaiVietKhoaHocStaffUser(id, done) {
    return () => {
        const url = '/api/user/qua-trinh/bai-viet-khoa-hoc';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình bài viết khoa học bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình bài viết khoa học được xóa thành công!', 'info', false, 800);
                done && done();
            }
        }, () => T.notify('Xóa thông tin quá trình bài viết khoa học bị lỗi', 'danger'));
    };
}