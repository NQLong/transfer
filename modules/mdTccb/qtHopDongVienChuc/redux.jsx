import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtHopDongVienChucGetAll = 'QtHopDongVienChuc:GetAll';
const QtHopDongVienChucGetPage = 'QtHopDongVienChuc:GetPage';
const QtHopDongVienChucGetGroupPage = 'QtHopDongVienChuc:GetGroupPage';
const QtHopDongVienChucUpdate = 'QtHopDongVienChuc:Update';
const QtHopDongVienChucGet = 'QtHopDongVienChuc:Get';

export default function QtHopDongVienChucReducer(state = null, data) {
    switch (data.type) {
        case QtHopDongVienChucGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtHopDongVienChucGetGroupPage:
            return Object.assign({}, state, { page_gr: data.page });
        case QtHopDongVienChucGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtHopDongVienChucGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtHopDongVienChucUpdate:
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
T.initPage('pageQtHopDongVienChuc');
export function getQtHopDongVienChucPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtHopDongVienChuc', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/hop-dong-vien-chuc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (page.filter) data.page.filter = page.filter;
                done && done(data.page);
                dispatch({ type: QtHopDongVienChucGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger'));
    };
}

export function getQtHopDongVienChucGroupPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtHopDongVienChuc', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/hop-dong-vien-chuc/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hợp đồng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtHopDongVienChucGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

T.initPage('shccPageQtHopDongVienChuc', true);
export function getQtHopDongVienChucShccPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('shccPageQtHopDongVienChuc', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/hop-dong-vien-chuc/groupShcc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hợp đồng theo cán bộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtHopDongVienChucGetPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getQtHopDongVienChucAll(done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/hop-dong-vien-chuc/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: QtHopDongVienChucGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger'));
    };
}

export function getQtHopDongVienChuc(ma, done) {
    return () => {
        const url = `/api/tccb/qua-trinh/hop-dong-vien-chuc/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy hợp đồng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getQtHopDongVienChucEdit(ma, done) {
    return dispatch => {
        const url = `/api/tccb/qua-trinh/hop-dong-vien-chuc/edit/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin hợp đồng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data);
                dispatch({ type: QtHopDongVienChucGet, item: data.item });
            }
        }, () => T.notify('Lấy thông tin hợp đồng bị lỗi', 'danger'));
    };
}

export function createQtHopDongVienChuc(item, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/hop-dong-vien-chuc';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo hợp đồng bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo hợp đồng thành công!', 'success');
                dispatch(getQtHopDongVienChucPage());
                if (done) done(data);
            }
        }, () => T.notify('Tạo hợp đồng bị lỗi!', 'danger'));
    };
}

export function deleteQtHopDongVienChuc(ma, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/hop-dong-vien-chuc';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa hợp đồng bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Hợp đồng đã xóa thành công!', 'success', false, 800);
                dispatch(getQtHopDongVienChucPage());
            }
            done && done();
        }, () => T.notify('Xóa hợp đồng bị lỗi!', 'danger'));
    };
}

export function updateQtHopDongVienChuc(ma, changes, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/hop-dong-vien-chuc';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật hợp đồng bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật hợp đồng thành công!', 'success');
                done && done(data.item);
                dispatch(getQtHopDongVienChuc(ma));
            }
        }, () => T.notify('Cập nhật hợp đồng bị lỗi!', 'danger'));
    };
}

export function downloadWord(ma, done) {
    const url = `/api/tccb/qua-trinh/hop-dong-vien-chuc/download-word/${ma}`;
    T.get(url, data => {
        if (data.error) {
            T.notify('Tải file world bị lỗi', 'danger');
            console.error(`GET: ${url}.`, data.error);
        } else if (done) {
            done(data.data);
        }
    }, error => T.notify('Tải file world bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));

}

export function getTruongPhongTccb(done) {
    return () => {
        const url = '/api/tccb/qua-trinh/hop-dong-vien-chuc/get-truong-phong-tccb';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin trưởng phòng TCCB bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
                done && done();
            } else {
                done && done(data);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}