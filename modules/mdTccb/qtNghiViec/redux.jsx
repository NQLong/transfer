import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtNghiViecGetAll = 'QtNghiViec:GetAll';
const QtNghiViecGetPage = 'QtNghiViec:GetPage';
const QtNghiViecGetGroupPage = 'QtNghiViec:GetGroupPage';
const QtNghiViecUpdate = 'QtNghiViec:Update';

export default function QtNghiViecReducer(state = null, data) {
    switch (data.type) {
        case QtNghiViecGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtNghiViecGetGroupPage:
            return Object.assign({}, state, { pageGr: data.page });
        case QtNghiViecGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtNghiViecUpdate:
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
T.initPage('pageQtNghiViec');
export function getQtNghiViecPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageQtNghiViec', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/nghi-viec/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sách nghỉ việc bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: QtNghiViecGetPage, page: data.page });
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
            }
        }, () => T.notify('Lấy danh sách sách nghỉ việc bị lỗi!', 'danger'));
    };
}

export function createQtNghiViecStaff(data, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nghi-viec';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin nghỉ việc bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin nghỉ việc thành công!', 'success');
                dispatch(getQtNghiViecPage());
                done && done();
            }
        }, () => T.notify('Thêm thông tin nghỉ việc bị lỗi', 'danger'));
    };
}

export function updateQtNghiViecStaff(ma, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nghi-viec';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin nghỉ việc bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error.message);
            } else if (data.item) {
                T.notify('Cập nhật thông tin nghỉ việc thành công!', 'success');
                data.isUpdatedStaff ? T.notify('Đã cập nhật ngày nghỉ cho cán bộ', 'info') : T.notify('Không tìm thấy cán bộ trong hệ thống', 'warning');
                dispatch(getQtNghiViecPage());
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin nghỉ việc bị lỗi', 'danger'));
    };
}

export function deleteQtNghiViecStaff(ma) {
    return dispatch => {
        const url = '/api/qua-trinh/nghi-viec';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa thông tin nghỉ việc bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin nghỉ việc được xóa thành công!', 'success', false, 800);
                dispatch(getQtNghiViecPage());
            }
        }, () => T.notify('Xóa thông tin nghỉ việc bị lỗi', 'danger'));
    };
}

export function getListNghiHuuInYear(year, done) {
    return () => {
        const url = '/api/tccb/qua-trinh/nghi-viec/get-nghi-huu-year';
        T.get(url, { year }, data => {
            if (data.error) {
                T.notify('Lấy danh sách dự kiến nghỉ hưu bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.items);
            }
        }, () => T.notify('Lấy danh sách dự kiến nghỉ hưu bị lỗi', 'danger'));
    };
}

export function createMultiQtNghiViecFromNghiHuu(listData, done) {
    return () => {
        const url = '/api/tccb/qua-trinh/nghi-viec/multiple-nghi-huu';
        T.post(url, { listData }, data => {
            if (data.error && data.error.length) {
                T.notify('Cập nhật dữ liệu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error('PUT: ' + url + '. ' + data.error.toString());
            } else {
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật dữ liệu bị lỗi!', 'danger'));
    };
}
