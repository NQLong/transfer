import T from 'view/js/common';
import { getStaffEdit } from '../tccbCanBo/redux';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtHocTapCongTacGetAll = 'QtHocTapCongTac:GetAll';
const QtHocTapCongTacGetPage = 'QtHocTapCongTac:GetPage';
const QtHocTapCongTacGetGroupPage = 'QtHocTapCongTac:GetGroupPage';
const QtHocTapCongTacUpdate = 'QtHocTapCongTac:Update';
const QtHocTapCongTacGet = 'QtHocTapCongTac:Get';

export default function QtHocTapCongTacReducer(state = null, data) {
    switch (data.type) {
        case QtHocTapCongTacGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtHocTapCongTacGetGroupPage:
            return Object.assign({}, state, { page_gr: data.page });
        case QtHocTapCongTacGetPage:
            return Object.assign({}, state, { page: data.page });
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
T.initPage('pageQtHocTapCongTac');
export function getQtHocTapCongTacPage(pageNumber, pageSize, pageCondition, ma, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtHocTapCongTac', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/hoc-tap-cong-tac/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, ma: ma, filter: page.filter }, data => {
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

T.initPage('groupPageQtHocTapCongTac', true);
export function getQtHocTapCongTacGroupPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('groupPageQtHocTapCongTac', pageNumber, pageSize, pageCondition, filter);
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

export function createQtHocTapCongTac(data, done, isEdit = null) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/hoc-tap-cong-tac';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo học tập, công tác bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo học tập, công tác thành công!', 'success');
                    if (isEdit) {
                        done();
                        dispatch(getStaffEdit(data.shcc));
                    }
                    else {
                        done(data);
                        dispatch(getQtHocTapCongTacPage());
                    }
                }
            }
        }, () => T.notify('Tạo học tập, công tác bị lỗi!', 'danger'));
    };
}

export function deleteQtHocTapCongTac(id, shcc, idEdit = null) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/hoc-tap-cong-tac';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa học tập, công tác bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('học tập, công tác đã xóa thành công!', 'success', false, 800);
                idEdit ? dispatch(getStaffEdit(shcc)) : dispatch(getQtHocTapCongTacPage());
            }
        }, () => T.notify('Xóa học tập, công tác bị lỗi!', 'danger'));
    };
}

export function updateQtHocTapCongTac(id, changes, done, isEdit = null) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/hoc-tap-cong-tac';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật học tập, công tác bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật học tập, công tác thành công!', 'success');
                isEdit ? (done && done()) : (done && done(data.item));
                isEdit ? dispatch(getStaffEdit(changes.shcc)) : dispatch(getQtHocTapCongTacPage());
            }
        }, () => T.notify('Cập nhật học tập, công tác bị lỗi!', 'danger'));
    };
}

export function updateQtHocTapCongTacGroupPageMa(id, shcc, changes, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/hoc-tap-cong-tac';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật học tập, công tác bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật học tập, công tác thành công!', 'success');
                done && done(data.item);
                dispatch(getQtHocTapCongTacPage(undefined, undefined, undefined, shcc));
            }
        }, () => T.notify('Cập nhật học tập, công tác bị lỗi!', 'danger'));
    };
}

export function createQtHocTapCongTacGroupPageMa(data, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/hoc-tap-cong-tac';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo học tập, công tác bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo học tập, công tác thành công!', 'success');
                    dispatch(getQtHocTapCongTacPage(undefined, undefined, undefined, data.shcc));
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo học tập, công tác bị lỗi!', 'danger'));
    };
}
export function deleteQtHocTapCongTacGroupPageMa(id, ma, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/hoc-tap-cong-tac';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa học tập, công tác bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('học tập, công tác đã xóa thành công!', 'success', false, 800);
                done && done(data.item);
                dispatch(getQtHocTapCongTacPage(undefined, undefined, undefined, ma));
            }
        }, () => T.notify('Xóa học tập, công tác bị lỗi!', 'danger'));
    };
}

export function createQTHTCTStaff(data, done) {
    return () => {
        const url = '/api/qua-trinh/htct';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình học tập, công tác bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình học tập, công tác thành công!', 'info');
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin quá trình học tập, công tác bị lỗi', 'danger'));
    };
}

export function updateQTHocTapCongTacStaff(id, changes, done) {
    return () => {
        const url = '/api/qua-trinh/htct';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình học tập, công tác bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình học tập, công tác thành công!', 'info');
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin quá trình học tập, công tác bị lỗi', 'danger'));
    };
}

export function deleteQTHocTapCongTacStaff(id, done) {
    return () => {
        const url = '/api/qua-trinh/htct';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình học tập, công tác bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình học tập, công tác được xóa thành công!', 'info', false, 800);
                if (done) done();
            }
        }, () => T.notify('Xóa thông tin quá trình học tập, công tác bị lỗi', 'danger'));
    };
}

export function createQTHocTapCongTacStaffUser(data, done) {
    return () => {
        const url = '/api/user/qua-trinh/htct';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình học tập, công tác bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình học tập, công tác thành công!', 'info');
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin quá trình học tập, công tác bị lỗi', 'danger'));
    };
}

export function updateQTHocTapCongTacStaffUser(id, changes, done) {
    return () => {
        const url = '/api/user/qua-trinh/htct';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình học tập, công tác bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình học tập, công tác thành công!', 'info');
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin quá trình học tập, công tác bị lỗi', 'danger'));
    };
}

export function deleteQTHocTapCongTacStaffUser(id, done) {
    return () => {
        const url = '/api/user/qua-trinh/htct';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình học tập, công tác bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình học tập, công tác được xóa thành công!', 'info', false, 800);
                done && done();
            }
        }, () => T.notify('Xóa thông tin quá trình học tập, công tác bị lỗi', 'danger'));
    };
}