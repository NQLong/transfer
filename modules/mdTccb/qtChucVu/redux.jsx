import T from 'view/js/common';
import { getStaffEdit } from '../tccbCanBo/redux';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtChucVuGetAll = 'QtChucVu:GetAll';
const QtChucVuGetPage = 'QtChucVu:GetPage';
const QtChucVuUpdate = 'QtChucVu:Update';
const QtChucVuGet = 'QtChucVu:Get';
const QtChucVuGetGroupPage = 'QtChucVu:GetGroupPage';

export default function QtChucVuReducer(state = null, data) {
    switch (data.type) {
        case QtChucVuGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtChucVuGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtChucVuGetGroupPage:
            return Object.assign({}, state, { page_gr: data.page_gr });
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
T.initPage('pageQtChucVu', true);
export function getQtChucVuPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageQtChucVu', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/chuc-vu/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chức vụ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtChucVuGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách chức vụ bị lỗi!', 'danger'));
    };
}
T.initPage('pageGroupQtChucVu', true);
export function getQtChucVuGroupPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageGroupQtChucVu', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/chuc-vu/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chức vụ theo cán bộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                console.log(data);
                if (page.pageCondition) data.page_gr.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtChucVuGetGroupPage, page_gr: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
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

export function getQtChucVu(stt, done) {
    return () => {
        const url = `/api/tccb/qua-trinh/chuc-vu/item/${stt}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy chức vụ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getQtChucVuEdit(stt, done) {
    return dispatch => {
        const url = `/api/tccb/qua-trinh/chuc-vu/edit/item/${stt}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin chức vụ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data);
                dispatch({ type: QtChucVuGet, item: data.item });
            }
        }, () => T.notify('Lấy thông tin chức vụ bị lỗi', 'danger'));
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
        const url = `/api/tccb/qua-trinh/chuc-vu/item/${shcc}`;
        T.get(url, data => {
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

//--USER-ACTION-------------------------------------------
export function createQtChucVuUser(data, done) {
    return () => {
        const url = '/api/user/qua-trinh/chuc-vu';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình khen thưởng bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình khen thưởng thành công!', 'info');
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin quá trình khen thưởng bị lỗi', 'danger'));
    };
}

export function updateQtChucVuUser(stt, changes, done) {
    return () => {
        const url = '/api/user/qua-trinh/chuc-vu';
        T.put(url, { stt, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình khen thưởng bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình khen thưởng thành công!', 'info');
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin quá trình khen thưởng bị lỗi', 'danger'));
    };
}

export function deleteQtChucVuUser(stt, done) {
    return () => {
        const url = '/api/user/qua-trinh/chuc-vu';
        T.delete(url, { stt }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình khen thưởng bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình khen thưởng được xóa thành công!', 'info', false, 800);
                done && done();
            }
        }, () => T.notify('Xóa thông tin quá trình khen thưởng bị lỗi', 'danger'));
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
