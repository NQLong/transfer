import T from 'view/js/common';

// Reducer -------------------------------------------------------------------------------------------------------------
const GET_PAGE = 'form:getPage';
const UPDATE = 'form:updateItem';
const GET = 'form:getForm';
const GET_PAGE_BY_USER = 'form:getPageByUser';
const GET_PAGE_NEW_BY_USER = 'form:getPageNewByUser';

export default function formReducer(state = null, data) {
    switch (data.type) {
        case GET_PAGE:
            return Object.assign({}, state, { page: data.page });

        case UPDATE: {
            let page = state && state.page ? state.page : { list: [] }, list = page.list;
            let i = 0;
            for (i; i < list.length; i++) {
                if (list[i].id == data.item.id) {
                    break;
                }
            }
            list.splice(i, 1, data.item);
            page.list = list;
            return Object.assign({}, state, { page });
        }
        case GET:
            return Object.assign({}, state, { form: data.item });

        case GET_PAGE_BY_USER:
            if (state == null || state.userCondition != data.condition) {
                return Object.assign({}, state, { userCondition: data.condition, userPage: data.page });
            } else {
                const userPage = Object.assign({}, data.page);
                userPage.list = state.userPage && state.userPage.list ? state.userPage.list.slice() : [];
                let ids = userPage.list.map(item => item.id);
                if (data.page && data.page.list && data.page.list.length > 0) {
                    data.page.list.forEach(item => {
                        if (ids.indexOf(item.id) == -1) {
                            ids.push(item.id);
                            userPage.list.push(item);
                        }
                    });
                }
                return Object.assign({}, state, { userPage });
            }

        case GET_PAGE_NEW_BY_USER:
            return Object.assign({}, state, { userPage: data.userPage });

        default:
            return state;
    }
}

// Actions (admin) ----------------------------------------------------------------------------------------------------
T.initPage('pageForm');
export function getFormInPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageForm', pageNumber, pageSize);
    return dispatch => {
        const url = '/api/form/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách bảng câu hỏi bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: GET_PAGE, page: data.page });
            }
        }, error => T.notify('Lấy danh sách bảng câu hỏi bị lỗi!', 'danger'));
    };
}

export function getForm(id, done) {
    return dispatch => {
        const url = '/api/form/item/' + id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy bảng câu hỏi bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: GET, item: data.item });
                done && done(data);
            }
        }, error => T.notify('Lấy bảng câu hỏi bị lỗi!', 'danger'));
    }
}

export function createForm(done) {
    return dispatch => {
        const url = '/api/form';
        const data = {
            title: JSON.stringify({ vi: 'Đề thi mới', en: 'New exam' }),
            duration: 90
        };
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo bảng câu hỏi bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                if (done) done(data);
            }
        }, error => T.notify('Tạo bảng câu hỏi bị lỗi!', 'danger'));
    }
}

export function duplicateForm(id, title, done) {
    return dispatch => {
        const url = `/api/form-duplicate/${id}`;
        T.post(url, { title }, data => {
            if (data.error) {
                T.notify('Sao chép bảng câu hỏi bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                if (done) done(data);
            }
        }, () => T.notify('Sao chép bảng câu hỏi bị lỗi!', 'danger'));
    }
}

export function updateForm(id, changes, done) {
    return dispatch => {
        const url = '/api/form';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin bảng câu hỏi bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch({ type: UPDATE, item: data.item });
                done && done();
            }
        }, error => T.notify('Cập nhật thông tin bảng câu hỏi bị lỗi!', 'danger'));
    }
}

export function swapForm(id, isMoveUp) {
    return dispatch => {
        const url = '/api/form/swap/';
        T.put(url, { id, isMoveUp }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự bảng câu hỏi bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Thay đổi thứ tự bảng câu hỏi thành công!', 'info');
                dispatch(getFormInPage());
            }
        }, error => T.notify('Thay đổi thứ tự bảng câu hỏi bị lỗi!', 'danger'));
    }
}

export function deleteForm(id) {
    return dispatch => {
        const url = '/api/form';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa bảng câu hỏi bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Đề thi được xóa thành công!', 'error', false, 800);
                dispatch(getFormInPage());
            }
        }, error => T.notify('Xóa bảng câu hỏi bị lỗi!', 'danger'));
    }
}

export function deleteFile(formId, type, done) {
    return dispatch => {
        const url = `/api/form-media`;
        T.delete(url, { formId, type }, data => {
            if (data.error) {
                T.notify('Xóa file bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                done && done();
            }
        });
    }
}

// Actions (user) -----------------------------------------------------------------------------------------------------
export function homeGetForm(id, done) {
    return dispatch => {
        const url = '/api/home/form/item/' + id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy bảng câu hỏi bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: GET, item: data.item });
                done && done(data.item, data.payment);
            }
        }, error => T.notify('Lấy bảng câu hỏi bị lỗi!', 'danger'));
    }
}

export function homeGetInstruction(id, paymentId, done) {
    return dispatch => {
        const url = '/api/home/form/item-instruction/' + id;
        T.get(url, { paymentId }, data => {
            if (data.error) {
                T.notify(data.error, 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: GET, item: data.item });
                done && done(data.item);
            }
        }, error => T.notify('Lấy clip hướng dẫn bị lỗi!', 'danger'));
    }
}

export function homeTestForm(id, done) {
    return dispatch => {
        const url = '/api/home/form/item-test/' + id;
        T.get(url, data => {
            if (data.error) {
                T.notify(data.error, 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: GET, item: data.item });
                done && done(data.item);
            }
        }, error => T.notify('Lấy bảng câu hỏi bị lỗi!', 'danger'));
    }
}

export function getFormInPageByUser(pageNumber, pageSize, isNew, pageCondition, done) {
    const page = T.updatePage('pageForm', pageNumber, pageSize);
    return dispatch => {
        const url = '/api/home/form/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách bảng câu hỏi bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data);
                dispatch({ type: isNew ? GET_PAGE_NEW_BY_USER : GET_PAGE_BY_USER, userPage: data.page });
            }
        }, error => T.notify('Lấy danh sách bảng câu hỏi bị lỗi!', 'danger'));
    };
}
