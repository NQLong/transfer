// import { getStaffEdit } from '../../mdTccb/tccbCanBo/redux';

import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtNghienCuuKhoaHocGetAll = 'QtNghienCuuKhoaHoc:GetAll';
const QtNghienCuuKhoaHocGetPage = 'QtNghienCuuKhoaHoc:GetPage';
const QtNghienCuuKhoaHocGetGroupPage = 'QtNghienCuuKhoaHoc:GetGroupPage';
const QtNghienCuuKhoaHocGetGroupPageMa = 'QtNghienCuuKhoaHoc:GetGroupPageMa';
const QtNghienCuuKhoaHocUpdate = 'QtNghienCuuKhoaHoc:Update';
const QtNghienCuuKhoaHocGet = 'QtNghienCuuKhoaHoc:Get';
const QtNghienCuuKhoaHocUserPage = 'QtNghienCuuKhoaHoc:UserPage';

export default function QtNghienCuuKhoaHocReducer(state = null, data) {
    switch (data.type) {
        case QtNghienCuuKhoaHocGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtNghienCuuKhoaHocGetGroupPage:
            return Object.assign({}, state, { pageGr: data.page });
        case QtNghienCuuKhoaHocGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtNghienCuuKhoaHocGetGroupPageMa:
            return Object.assign({}, state, { pageMa: data.page });
        case QtNghienCuuKhoaHocGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtNghienCuuKhoaHocUpdate:
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
        case QtNghienCuuKhoaHocUserPage:
            return Object.assign({}, state, { pageUser: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageQtNghienCuuKhoaHoc');
export function getQtNghienCuuKhoaHocPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtNghienCuuKhoaHoc', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/khcn/qua-trinh/nghien-cuu-khoa-hoc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nghiên cứu khoa học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtNghienCuuKhoaHocGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách nghiên cứu khoa học bị lỗi!', 'danger'));
    };
}

export function getQtNghienCuuKhoaHocGroupPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtNghienCuuKhoaHoc', pageNumber, pageSize, pageCondition, filter);

    return dispatch => {
        const url = `/api/khcn/qua-trinh/nghien-cuu-khoa-hoc/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nghiên cứu khoa học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtNghienCuuKhoaHocGetGroupPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách nghiên cứu khoa học bị lỗi!', 'danger'));
    };
}


T.initPage('groupPageMaQtNghienCuuKhoaHoc');
export function getQtNghienCuuKhoaHocGroupPageMa(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('groupPageMaQtNghienCuuKhoaHoc', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/khcn/qua-trinh/nghien-cuu-khoa-hoc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nghiên cứu khoa học theo cán bộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtNghienCuuKhoaHocGetGroupPageMa, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getQtNghienCuuKhoaHocAll(done) {
    return dispatch => {
        const url = '/api/khcn/qua-trinh/nghien-cuu-khoa-hoc/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách nghiên cứu khoa học bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
                dispatch({ type: QtNghienCuuKhoaHocGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách nghiên cứu khoa học bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function createQtNckhStaffGroup(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nckh';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin nghiên cứu khoa học bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin nghiên cứu khoa học thành công!', 'success');
                if (done) {

                    done(data);
                    dispatch(getQtNghienCuuKhoaHocGroupPageMa());

                }
            }
        }, () => T.notify('Thêm thông tin nghiên cứu khoa học bị lỗi', 'danger'));
    };
}
export function updateQtNckhStaffGroup(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nckh';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật nghiên cứu khoa học bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật nghiên cứu khoa học thành công!', 'success');
                done && done(data.item);
                dispatch(getQtNghienCuuKhoaHocGroupPageMa());
            }
        }, () => T.notify('Cập nhật nghiên cứu khoa học bị lỗi!', 'danger'));
    };
}

export function deleteQtNckhStaffGroup(id, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nckh';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin nghiên cứu khoa học bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin nghiên cứu khoa học được xóa thành công!', 'success', false, 800);
                done && done(data.item);
                dispatch(getQtNghienCuuKhoaHocGroupPageMa());
            }
        }, () => T.notify('Xóa thông tin nghiên cứu khoa học bị lỗi', 'danger'));
    };
}

export function createQtNckhStaff(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nckh';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin nghiên cứu khoa học bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin nghiên cứu khoa học thành công!', 'success');
                dispatch(getQtNghienCuuKhoaHocPage());
                done && done(data);
            }
        }, () => T.notify('Thêm thông tin nghiên cứu khoa học bị lỗi', 'danger'));
    };
}

export function createQtNckhMultiple(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nckh/create-multiple';
        T.post(url, { data }, res => {
            if (res.error.length) {
                T.notify('Thêm thông tin nghiên cứu khoa học bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin nghiên cứu khoa học thành công!', 'success');
                dispatch(getQtNghienCuuKhoaHocPage());
                done && done(data);
            }
        }, () => T.notify('Thêm thông tin nghiên cứu khoa học bị lỗi', 'danger'));
    };
}

export function updateQtNckhStaff(id, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nckh';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin nghiên cứu khoa học bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin nghiên cứu khoa học thành công!', 'success');
                done && done(data.item);
                dispatch(getQtNghienCuuKhoaHocPage());
            }
        }, () => T.notify('Cập nhật thông tin nghiên cứu khoa học bị lỗi', 'danger'));
    };
}

export function deleteQtNckhStaff(id) {
    return dispatch => {
        const url = '/api/qua-trinh/nckh';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin nghiên cứu khoa học bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin nghiên cứu khoa học được xóa thành công!', 'success', false, 800);
                dispatch(getQtNghienCuuKhoaHocPage());
            }
        }, () => T.notify('Xóa thông tin nghiên cứu khoa học bị lỗi', 'danger'));
    };
}

export function deleteFile(shcc, id, index, file, done) {
    return () => {
        const url = '/api/khcn/de-tai-nckh/delete-file';
        T.put(url, { id, shcc, index, file }, data => {
            if (data.error) {
                console.error('PUT: ' + url + '.', data.error);
                T.notify('Xóa file đính kèm lỗi!', 'danger');
            } else {
                T.notify('Xóa file đính kèm thành công!', 'success');
                done && done();
            }
        }, () => T.notify('Xóa file đính kèm bị lỗi!', 'danger'));
    };
}

// User Action ----------------------------------------------------------
T.initPage('DeTaiKhoaHocCanBoPage');
export function getQtNckhUserPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('DeTaiKhoaHocCanBoPage', pageNumber, pageSize, pageCondition, filter);

    return dispatch => {
        const url = `/api/khcn/qua-trinh/nghien-cuu-khoa-hoc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách công trình NCKH cán bộ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtNghienCuuKhoaHocUserPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách công trình NCKH cán bộ bị lỗi!', 'danger'));
    };
}


export function createQtNckhStaffUser(data, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nckh';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin nghiên cứu khoa học bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin nghiên cứu khoa học thành công!', 'success');
                if (done) done(res);
                dispatch(getQtNckhUserPage());

            }
        }, () => T.notify('Thêm thông tin nghiên cứu khoa học bị lỗi', 'danger'));
    };
}

export function updateQtNckhStaffUser(id, changes, done, print = null) {
    return () => {
        const url = '/api/user/qua-trinh/nckh';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin nghiên cứu khoa học bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin nghiên cứu khoa học thành công!', 'success');
                print && T.notify('Đề tài sẽ được in trong lý lịch khoa học!', 'info');
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin nghiên cứu khoa học bị lỗi', 'danger'));
    };
}

export function deleteQtNckhStaffUser(id, shcc, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nckh';
        T.delete(url, { id, shcc }, data => {
            if (data.error) {
                T.notify('Xóa thông tin nghiên cứu khoa học bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin nghiên cứu khoa học được xóa thành công!', 'success', false, 800);
                done && done();
                dispatch(getQtNckhUserPage());
            }
        }, () => T.notify('Xóa thông tin nghiên cứu khoa học bị lỗi', 'danger'));
    };
}

export function updateQtNckhStaffPage(id, changes, done, print = null) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nckh';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin nghiên cứu khoa học bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                !print && T.notify('Cập nhật thông tin nghiên cứu khoa học thành công!', 'success');
                dispatch(getQtNckhUserPage());
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin nghiên cứu khoa học bị lỗi', 'danger'));
    };
}

export function deleteQtNckhStaffPage(id, shcc, done) {
    return dispatch => {
        const url = '/api/user/qua-trinh/nckh';
        T.delete(url, { id, shcc }, data => {
            if (data.error) {
                T.notify('Xóa thông tin nghiên cứu khoa học bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin nghiên cứu khoa học được xóa thành công!', 'success', false, 800);
                done && done();
                dispatch(getQtNckhUserPage());
            }
        }, () => T.notify('Xóa thông tin nghiên cứu khoa học bị lỗi', 'danger'));
    };
}


export function getDeTaiNckh(condition, done) {
    return () => {
        const url = `/api/user/qua-trinh/nckh/item/${condition.id}/${condition.shcc}`;
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy đề tài nghiên cứu khoa học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data);
            }
        }, () => T.notify('Lấy đề tài nghiên cứu khoa học bị lỗi!', 'danger'));
    };
}