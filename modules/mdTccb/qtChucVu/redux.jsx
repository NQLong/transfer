import T from 'view/js/common';
import { getStaffEdit } from '../tccbCanBo/redux';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtChucVuGetAll = 'QtChucVu:GetAll';
const QtChucVuGetPage = 'QtChucVu:GetPage';
const QtChucVuUpdate = 'QtChucVu:Update';
const QtChucVuGet = 'QtChucVu:Get';
const QtChucVuGetGroupPage = 'QtChucVu:GetGroupPage';
const QtChucVuGetGroupPageMa = 'QtChucVu:GetGroupPageMa';

export default function QtChucVuReducer(state = null, data) {
    switch (data.type) {
        case QtChucVuGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtChucVuGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtChucVuGetGroupPage:
            return Object.assign({}, state, { page_gr: data.page });
        case QtChucVuGetGroupPageMa:
            return Object.assign({}, state, { page_ma: data.page });
        case QtChucVuGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtChucVuUpdate:
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
T.initPage('pageQtChucVu');
export function getQtChucVuPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtChucVu', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/chuc-vu/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chức vụ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtChucVuGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách chức vụ bị lỗi!', 'danger'));
    };
}

export function getQtChucVuGroupPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtChucVu', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/chuc-vu/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chức vụ theo cán bộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtChucVuGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

T.initPage('groupPageMaQtChucVu');
export function getQtChucVuGroupPageMa(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('groupPageMaQtChucVu', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/chuc-vu/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chức vụ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtChucVuGetGroupPageMa, page: data.page });
            }
        }, () => T.notify('Lấy danh sách chức vụ bị lỗi!', 'danger'));
    };
}
export function updateQtChucVuGroupPageMa(stt, changes, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/chuc-vu';
        T.put(url, { stt, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật chức vụ bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật chức vụ thành công!', 'success');
                done && done(data.item);
                dispatch(getQtChucVuGroupPageMa());
            }
        }, () => T.notify('Cập nhật chức vụ bị lỗi!', 'danger'));
    };
}

export function deleteQtChucVuGroupPageMa(stt, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/chuc-vu';
        T.delete(url, { stt }, data => {
            if (data.error) {
                T.notify('Xóa thông tin chức vụ bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin chức vụ được xóa thành công!', 'info', false, 800);
                done && done(data.item);
                dispatch(getQtChucVuGroupPageMa());
            }
        }, () => T.notify('Xóa thông tin chức vụ bị lỗi', 'danger'));
    };
}

export function createQtChucVuGroupPageMa(data, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/chuc-vu';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo chức vụ bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo chức vụ thành công!', 'success');
                    dispatch(getQtChucVuGroupPageMa());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo chức vụ bị lỗi!', 'danger'));
    };
}

export function createQtChucVuStaff(data, done, isEdit = null) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/chuc-vu';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin chức vụ bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin chức vụ thành công!', 'info');
                if (done) {
                    if (isEdit) {
                        done();
                        dispatch(getStaffEdit(data.shcc));
                    }
                    else {
                        done(data);
                        dispatch(getQtChucVuPage());
                    }
                }
            }
        }, () => T.notify('Thêm thông tin chức vụ bị lỗi', 'danger'));
    };
}

export function updateQtChucVuStaff(stt, changes, done, isEdit = null) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/chuc-vu';
        T.put(url, { stt, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin chức vụ bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin chức vụ thành công!', 'info');
                isEdit ? (done && done()) : (done && done(data.item));
                isEdit ? dispatch(getStaffEdit(changes.shcc)) : dispatch(getQtChucVuPage());
            }
        }, () => T.notify('Cập nhật thông tin chức vụ bị lỗi', 'danger'));
    };
}

export function deleteQtChucVuStaff(stt, isEdit, shcc = null) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/chuc-vu';
        T.delete(url, { stt }, data => {
            if (data.error) {
                T.notify('Xóa thông tin chức vụ bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin chức vụ được xóa thành công!', 'info', false, 800);
                isEdit ? dispatch(getStaffEdit(shcc)) : dispatch(getQtChucVuPage());
            }
        }, () => T.notify('Xóa thông tin chức vụ bị lỗi', 'danger'));
    };
}

export function getQtChucVuAll(shcc, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/chuc-vu/all';
        T.get(url, { shcc }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chức vụ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: QtChucVuGetAll, items: data.items ? data.items : {} });
            }
        }, () => T.notify('Lấy danh sách chức vụ bị lỗi!', 'danger'));
    };
}


export function createQtChucVu(isStaffEdit, items, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/chuc-vu';
        T.post(url, { items }, data => {
            if (data.error) {
                T.notify('Tạo chức vụ bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo chức vụ thành công!', 'success');
                isStaffEdit ? dispatch(getStaffEdit(data.item.shcc)) : dispatch(getQtChucVuPage());
                isStaffEdit ? (done && done()) : (done && done(data));
            }
        }, () => T.notify('Tạo chức vụ bị lỗi!', 'danger'));
    };
}

export function deleteQtChucVu(isStaffEdit, stt, shcc = null) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/chuc-vu';
        T.delete(url, { stt }, data => {
            if (data.error) {
                T.notify('Xóa chức vụ bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Chức vụ đã xóa thành công!', 'success', false, 800);
                isStaffEdit ? dispatch(getStaffEdit(shcc)) : dispatch(getQtChucVuPage());
            }
        }, () => T.notify('Xóa chức vụ bị lỗi!', 'danger'));
    };
}

export function updateQtChucVu(isStaffEdit, stt, changes, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/chuc-vu';
        T.put(url, { stt, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật chức vụ bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else {
                T.notify('Cập nhật chức vụ thành công!', 'success');
                isStaffEdit ? (done && done()) : (done && done(data.item));
                isStaffEdit ? dispatch(getStaffEdit(data.item.shcc)) : dispatch(getQtChucVuPage());
            }
        }, () => T.notify('Cập nhật chức vụ bị lỗi!', 'danger'));
    };
}

export function getChucVuByShcc(shcc, done) {
    return dispatch => {
        const url = `/api/tccb/qua-trinh/chuc-vu-by-shcc/${shcc}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách chức vụ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
                dispatch({ type: QtChucVuGetAll, item: data.item ? data.item : {} });
            }
        }, () => T.notify('Lấy danh sách chức vụ bị lỗi!', 'danger'));
    };
}

//--USER-ACTION-------------------------------------------
export function createQtChucVuUser(data, done) {
    return () => {
        const url = '/api/user/qua-trinh/chuc-vu';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình chức vụ bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình chức vụ thành công!', 'info');
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin quá trình chức vụ bị lỗi', 'danger'));
    };
}

export function updateQtChucVuUser(stt, changes, done) {
    return () => {
        const url = '/api/user/qua-trinh/chuc-vu';
        T.put(url, { stt, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình chức vụ bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình chức vụ thành công!', 'info');
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin quá trình chức vụ bị lỗi', 'danger'));
    };
}

export function deleteQtChucVuUser(stt, done) {
    return () => {
        const url = '/api/user/qua-trinh/chuc-vu';
        T.delete(url, { stt }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình chức vụ bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình chức vụ được xóa thành công!', 'info', false, 800);
                done && done();
            }
        }, () => T.notify('Xóa thông tin quá trình chức vụ bị lỗi', 'danger'));
    };
}

export function downloadWord(stt, done) {
    return () => {
        const url = `/user/qua-trinh/chuc-vu/${stt}/word`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Tải file word bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else if (done) {
                done(data.data);
            }
        }, () => T.notify('Tải file word bị lỗi', 'danger'));
    };
}
