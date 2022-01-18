import T from 'view/js/common';

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
                        if (updatedItems[i].ma == updatedItem.ma) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].ma == updatedItem.ma) {
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
export function getQtHocTapCongTacPage(pageNumber, pageSize, loaiDoiTuong, pageCondition, done) {
    const page = T.updatePage('pageQtHocTapCongTac', pageNumber, pageSize, pageCondition);
    if (!loaiDoiTuong) loaiDoiTuong = [];
    if (!Array.isArray(loaiDoiTuong)) loaiDoiTuong = [loaiDoiTuong];
    return dispatch => {
        const url = `/api/tccb/qua-trinh/htct/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, parameter: loaiDoiTuong}, data => {
            if (data.error) {
                T.notify('Lấy danh sách học tập công tác bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtHocTapCongTacGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách học tập công tác bị lỗi!', 'danger'));
    };
}

T.initPage('groupPageQtHocTapCongTac', true);
export function getQtHocTapCongTacGroupPage(pageNumber, pageSize, loaiDoiTuong, pageCondition, done) {
    const page = T.updatePage('groupPageQtHocTapCongTac', pageNumber, pageSize, pageCondition);
    if (!loaiDoiTuong) loaiDoiTuong = [];
    if (!Array.isArray(loaiDoiTuong)) loaiDoiTuong = [loaiDoiTuong];
    return dispatch => {
        const url = `/api/tccb/qua-trinh/htct/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, parameter: loaiDoiTuong}, data => {
            if (data.error) {
                T.notify('Lấy danh sách học tập công tác theo cán bộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtHocTapCongTacGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

T.initPage('groupPageMaQtHocTapCongTac', true);
export function getQtHocTapCongTacGroupPageMa(pageNumber, pageSize, loaiDoiTuong, pageCondition, done) {
    const page = T.updatePage('groupPageMaQtHocTapCongTac', pageNumber, pageSize, pageCondition);
    if (!loaiDoiTuong) loaiDoiTuong = '-1';
    return dispatch => {
        const url = `/api/tccb/qua-trinh/htct/group/page/${loaiDoiTuong}/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách học tập công tác theo cán bộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtHocTapCongTacGetPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createQTHocTapCongTacStaff(data, done) {
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

export function updateQtHocTapCongTacGroupPageMa(ma, changes, done) {
    return dispatch => {
        const url = '/api/staff/qua-trinh/htct';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật học tập công tác bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật học tập công tác thành công!', 'success');
                done && done(data.item);
                dispatch(getQtHocTapCongTacGroupPageMa(undefined, undefined, '-1', data.shcc));
            }
        }, () => T.notify('Cập nhật học tập công tác bị lỗi!', 'danger'));
    };
}


export function deleteQtHocTapCongTacGroupPageMa(id, shcc, done) {
    return dispatch => {
        const url = '/api/staff/qua-trinh/htct';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin học tập công tác bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin học tập công tác được xóa thành công!', 'info', false, 800);
                done && done(data.item);
                dispatch(getQtHocTapCongTacGroupPageMa(undefined, undefined, '-1', shcc));
            }
        }, () => T.notify('Xóa thông tin học tập công tác bị lỗi', 'danger'));
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