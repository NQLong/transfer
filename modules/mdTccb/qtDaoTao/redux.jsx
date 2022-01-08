import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtDaoTaoGetAll = 'QtDaoTao:GetAll';
const QtDaoTaoGetPage = 'QtDaoTao:GetPage';
const QtDaoTaoUpdate = 'QtDaoTao:Update';
const QtDaoTaoGet = 'QtDaoTao:Get';
const QtDaoTaoGetGroupPage = 'QtDaoTao:GetGroupPage';

export default function QtDaoTaoReducer(state = null, data) {
    switch (data.type) {
        case QtDaoTaoGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtDaoTaoGetPage:
            return Object.assign({}, state, { page: data.page });
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
T.initPage('pageQtDaoTao');
export function getQtDaoTaoPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageQtDaoTao', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/qua-trinh/dao-tao/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách quá trình đào tạo sản bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtDaoTaoGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách quá trình đào tạo bị lỗi!', 'danger'));
    };
}

// T.initPage('groupPageQtDaoTao', true);
// export function getQtDaoTaoGroupPage(pageNumber, pageSize, pageCondition, done) {
//     const page = T.updatePage('groupPageQtDaoTao', pageNumber, pageSize, pageCondition);
//     return dispatch => {
//         const url = `/api/tccb/qua-trinh/dao-tao/group/page/${page.pageNumber}/${page.pageSize}`;
//         T.get(url, { condition: page.pageCondition }, data => {
//             if (data.error) {
//                 T.notify('Lấy danh sách nghỉ thai sản theo cán bộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
//                 console.error(`GET: ${url}.`, data.error);
//             } else {
//                 if (page.pageCondition) data.page.pageCondition = page.pageCondition;
//                 done && done(data.page);
//                 dispatch({ type: QtDaoTaoGetGroupPage, page: data.page });
//             }
//         }, error => console.error(`GET: ${url}.`, error));
//     };
// }

export function getQtDaoTaoAll(done) {
    return dispatch => {
        const url = '/api/qua-trinh/dao-tao/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách quá trình đào tạo bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: QtDaoTaoGetAll, items: data.items ? data.items : {} });
            }
        }, () => T.notify('Lấy danh sách quá trình đào tạo bị lỗi!', 'danger'));
    };
}

export function getQtDaoTao(id, done) {
    return () => {
        const url = `/api/qua-trinh/dao-tao/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy quá trình đào tạo bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createQtDaoTao(data, done) {
    return () => {
        const url = '/api/qua-trinh/dao-tao';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình đào tạo bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình đào tạo thành công!', 'info');
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin quá trình đào tạo bị lỗi', 'danger'));
    };
}

export function updateQtDaoTao(id, changes, done) {
    return () => {
        const url = '/api/qua-trinh/dao-tao';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình đào tạo bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình đào tạo thành công!', 'info');
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin quá trình đào tạo bị lỗi', 'danger'));
    };
}

export function deleteQtDaoTao(id, done) {
    return () => {
        const url = '/api/qua-trinh/dao-tao';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình đào tạo bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình đào tạo được xóa thành công!', 'info', false, 800);
                if (done) done();
            }
        }, () => T.notify('Xóa thông tin quá trình đào tạo bị lỗi', 'danger'));
    };
}

export function createQtDaoTaoStaffUser(data, done) {
    return () => {
        const url = '/api/user/qua-trinh/dao-tao';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin quá trình đào tạo bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin quá trình đào tạo thành công!', 'info');
                if (done) done(res);
            }
        }, () => T.notify('Thêm thông tin quá trình đào tạo bị lỗi', 'danger'));
    };
}

export function updateQtDaoTaoStaffUser(id, changes, done) {
    return () => {
        const url = '/api/user/qua-trinh/dao-tao';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin quá trình đào tạo bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin quá trình đào tạo thành công!', 'info');
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin quá trình đào tạo bị lỗi', 'danger'));
    };
}

export function deleteQtDaoTaoStaffUser(id, done) {
    return () => {
        const url = '/api/user/qua-trinh/dao-tao';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin quá trình đào tạo bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình đào tạo được xóa thành công!', 'info', false, 800);
                done && done();
            }
        }, () => T.notify('Xóa thông tin quá trình đào tạo bị lỗi', 'danger'));
    };
}