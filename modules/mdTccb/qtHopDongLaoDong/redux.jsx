import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtHopDongLaoDongGetAll = 'QtHopDongLaoDong:GetAll';
const QtHopDongLaoDongGetPage = 'QtHopDongLaoDong:GetPage';
const QtHopDongLaoDongGetGroupPage = 'QtHopDongLaoDong:GetGroupPage';
const QtHopDongLaoDongUpdate = 'QtHopDongLaoDong:Update';
const QtHopDongLaoDongGet = 'QtHopDongLaoDong:Get';

export default function QtHopDongLaoDongReducer(state = null, data) {
    switch (data.type) {
        case QtHopDongLaoDongGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtHopDongLaoDongGetGroupPage:
            return Object.assign({}, state, { page_gr: data.page });
        case QtHopDongLaoDongGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtHopDongLaoDongGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtHopDongLaoDongUpdate:
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
T.initPage('pageQtHopDongLaoDong', true);
export function getQtHopDongLaoDongPage(pageNumber, pageSize, maDonVi, pageCondition, done) {
    const page = T.updatePage('pageQtHopDongLaoDong', pageNumber, pageSize, pageCondition);
    if (!maDonVi) maDonVi = -1;
    return dispatch => {
        const url = `/api/tccb/qua-trinh/hop-dong-lao-dong/page/${maDonVi}/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtHopDongLaoDongGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger'));
    };
}

T.initPage('groupPageQtHopDongLaoDong', true);
export function getQtHopDongLaoDongGroupPage(pageNumber, pageSize, maDonVi, pageCondition, done) {
    const page = T.updatePage('groupPageQtHopDongLaoDong', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/hop-dong-lao-dong/group/page/${maDonVi}/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hợp đồng theo cán bộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtHopDongLaoDongGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

T.initPage('shccPageQtHopDongLaoDong', true);
export function getQtHopDongLaoDongShccPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('shccPageQtHopDongLaoDong', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/hop-dong-lao-dong/groupShcc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hợp đồng theo cán bộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtHopDongLaoDongGetPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getQtHopDongLaoDongAll(done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/hop-dong-lao-dong/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: QtHopDongLaoDongGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger'));
    };
}

export function getQtHopDongLaoDong(ma, done) {
    return () => {
        const url = `/api/tccb/qua-trinh/hop-dong-lao-dong/item/${ma}`;
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

export function getQtHopDongLaoDongEdit(ma, done) {
    return dispatch => {
        const url = `/api/tccb/qua-trinh/hop-dong-lao-dong/edit/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin hợp đồng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data);
                dispatch({ type: QtHopDongLaoDongGet, item: data.item });
            }
        }, () => T.notify('Lấy thông tin hợp đồng bị lỗi', 'danger'));
    };
}

export function createQtHopDongLaoDong(item, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/hop-dong-lao-dong';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo hợp đồng bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo hợp đồng thành công!', 'success');
                dispatch(getQtHopDongLaoDongPage());
                if (done) done(data);
            }
        }, () => T.notify('Tạo hợp đồng bị lỗi!', 'danger'));
    };
}

export function deleteQtHopDongLaoDong(ma, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/hop-dong-lao-dong';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa hợp đồng bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Hợp đồng đã xóa thành công!', 'success', false, 800);
                dispatch(getQtHopDongLaoDongPage());
            }
            done && done();
        }, () => T.notify('Xóa hợp đồng bị lỗi!', 'danger'));
    };
}

export function updateQtHopDongLaoDong(ma, changes, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/hop-dong-lao-dong';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật hợp đồng bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật hợp đồng thành công!', 'success');
                done && done(data.item);
                dispatch(getQtHopDongLaoDong(ma));
            }
        }, () => T.notify('Cập nhật hợp đồng bị lỗi!', 'danger'));
    };
}

export function downloadWord(ma, done) {
    const url = `/api/tccb/qua-trinh/hop-dong-lao-dong/download-word/${ma}`;
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
        const url = '/api/tccb/qua-trinh/hop-dong-lao-dong/get-truong-phong-tccb';
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