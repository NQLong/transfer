import T from 'view/js/common';
import { getStaffEdit, userGetStaff } from '../tccbCanBo/redux';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtDaoTaoGetAll = 'QtDaoTao:GetAll';
const QtDaoTaoGetPage = 'QtDaoTao:GetPage';
const QtDaoTaoGetStaffPage = 'QtDaoTao:GetStaffPage';
const QtDaoTaoUpdate = 'QtDaoTao:Update';
const QtDaoTaoGet = 'QtDaoTao:Get';
const QtDaoTaoGetGroupPage = 'QtDaoTao:GetGroupPage';

export default function QtDaoTaoReducer(state = null, data) {
    switch (data.type) {
        case QtDaoTaoGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtDaoTaoGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtDaoTaoGetStaffPage:
            return Object.assign({}, state, { staff_page: data.page });
        case QtDaoTaoGetGroupPage:
            return Object.assign({}, state, { page_gr: data.page });
        case QtDaoTaoGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtDaoTaoUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].stt == updatedItem.stt) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].stt == updatedItem.stt) {
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


//Admin Page ---------------------------------------------------------------------------------------------------------
T.initPage('pageQtDaoTao');
export function getQtDaoTaoPage(pageNumber, pageSize, pageCondition, ma, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtDaoTao', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/qua-trinh/dao-tao/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, ma: ma, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách quá trình đào tạo sản bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtDaoTaoGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách quá trình đào tạo bị lỗi!', 'danger'));
    };
}

T.initPage('groupPageQtDaoTao', true);
export function getQtDaoTaoGroupPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('groupPageQtDaoTao', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/dao-tao/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách quá trình đào tạo bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtDaoTaoGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createQtDaoTao(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/dao-tao';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình đào tạo bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình đào tạo thành công!', 'info');
                done(data);
                dispatch(getQtDaoTaoPage());

            }
        }, () => T.notify('Thêm thông tin quá trình đào tạo bị lỗi', 'danger'));
    };
}

export function updateQtDaoTao(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/dao-tao';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình đào tạo bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình đào tạo thành công!', 'info');
                done && done(data.item);
                dispatch(getQtDaoTaoPage());
            }
        }, () => T.notify('Cập nhật thông tin quá trình đào tạo bị lỗi', 'danger'));
    };
}

export function deleteQtDaoTao(id) {
    return dispatch => {
        const url = '/api/qua-trinh/dao-tao';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình đào tạo bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình đào tạo được xóa thành công!', 'info', false, 800);
                dispatch(getQtDaoTaoPage());
            }
        }, () => T.notify('Xóa thông tin quá trình đào tạo bị lỗi', 'danger'));
    };
}

export function createQtDaoTaoStaffUser(data, isEdit, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/dao-tao';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình đào tạo bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình đào tạo thành công!', 'info');
                if (done) done(res.item);
                isEdit ? dispatch(userGetStaff(data.email)) : dispatch(getStaffEdit(data.shcc));
            }
        }, () => T.notify('Thêm thông tin quá trình đào tạo bị lỗi', 'danger'));
    };
}

export function updateQtDaoTaoStaffUser(id, changes, isEdit, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/dao-tao';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình đào tạo bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình đào tạo thành công!', 'info');
                if (done) done(data.item);
                isEdit ? dispatch(userGetStaff(changes.email)) : dispatch(getStaffEdit(changes.shcc));
            }
        }, () => T.notify('Cập nhật thông tin quá trình đào tạo bị lỗi', 'danger'));
    };
}

export function deleteQtDaoTaoStaffUser(id, email, isEdit, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/dao-tao';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình đào tạo bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình đào tạo được xóa thành công!', 'info', false, 800);
                // done && done();
                isEdit ? dispatch(userGetStaff(email, done && done())) : dispatch(getStaffEdit(email, done && done()));
            }
        }, () => T.notify('Xóa thông tin quá trình đào tạo bị lỗi', 'danger'));
    };
}

//StaffPage----------------------
T.initPage('staffPageQtDaoTao');
export function getQtDaoTaoStaffPage(pageNumber, pageSize, pageCondition, ma, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('staffPageQtDaoTao', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/qua-trinh/dao-tao/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, ma: ma, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách quá trình đào tạo bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtDaoTaoGetStaffPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách quá trình đào tạo bị lỗi!', 'danger'));
    };
}

export function createQtDaoTaoStaffPage(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/dao-tao';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo thông tin đào tạo lỗi', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                T.notify('Thêm thông tin quá trình đào tạo thành công!', 'info');
                if (done) done(data);
                dispatch(getQtDaoTaoStaffPage());
            }
        }, () => T.notify('Thêm thông tin quá trình đào tạo bị lỗi', 'danger'));
    };
}

export function updateQtDaoTaoStaffPage(id, changes, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/dao-tao';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin đào tạo lỗi', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                T.notify('Cập nhật thông tin đào tạo thành công!', 'info');
                if (done) done(data);
                dispatch(getQtDaoTaoStaffPage());
            }
        }, () => T.notify('Cập nhật thông tin đào tạo bị lỗi', 'danger'));
    };
}

export function deleteQtDaoTaoStaffPage(id, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/dao-tao';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xoá thông tin đào tạo lỗi', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                T.notify('Xoá thông tin đào tạo thành công!', 'info');
                if (done) done(data);
                dispatch(getQtDaoTaoStaffPage());
            }
        }, () => T.notify('Xoá thông tin đào tạo bị lỗi', 'danger'));
    };
}