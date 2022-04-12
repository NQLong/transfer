import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtChuongTrinhDaoTaoGetAll = 'DtChuongTrinhDaoTao:GetAll';
const DtChuongTrinhDaoTaoGetPage = 'DtChuongTrinhDaoTao:GetPage';
const DtChuongTrinhDaoTaoGet = 'DtChuongTrinhDaoTao:GetByKhoa';
const DtChuongTrinhDaoTaoUpdate = 'DtChuongTrinhDaoTao:Update';

export default function dtChuongTrinhDaoTaoReducer(state = null, data) {
    switch (data.type) {
        case DtChuongTrinhDaoTaoGetAll:
        case DtChuongTrinhDaoTaoGet:
            return Object.assign({}, state, { items: data.items });
        case DtChuongTrinhDaoTaoGetPage:
            return Object.assign({}, state, { page: data.page });
        case DtChuongTrinhDaoTaoUpdate:
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
export function getDtChuongTrinhDaoTaoAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }
    return dispatch => {
        const url = '/api/dao-tao/chuong-trinh-dao-tao/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chương trình đào tạo bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch({ type: DtChuongTrinhDaoTaoGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

T.initPage('pageDtChuongTrinhDaoTao');
export function getDtChuongTrinhDaoTaoPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDtChuongTrinhDaoTao', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/dao-tao/chuong-trinh-dao-tao/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: pageCondition?.searchTerm, donViFilter: pageCondition?.donViFilter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chương trình đào tạo bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DtChuongTrinhDaoTaoGetPage, page: data.page });
            }
        });
    };
}

export function getDtChuongTrinhDaoTao(maKhungDaoTao, done) {
    return dispatch => {
        const url = `/api/dao-tao/chuong-trinh-dao-tao/${maKhungDaoTao}`;
        T.get(url, { condition: { maKhungDaoTao } }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chương trình đào tạo bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch({ type: DtChuongTrinhDaoTaoGet, items: data.items ? data.items : [] });
            }
        });
    };
}

export function getDtKhungDaoTao(id, done) {
    return () => {
        const url = `/api/dao-tao/khung-dao-tao/${id}`;
        T.get(url, { condition: { id } }, data => {
            if (data.error) {
                T.notify('Lấy danh sách khung đào tạo bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
            }
        });
    };
}


export function createMultiDtChuongTrinhDaoTao(data, done) {
    return () => {
        const url = '/api/dao-tao/chuong-trinh-dao-tao/multiple';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo chương trình đào tạo có lỗi!', 'danger');
            } else {
                T.notify(`Cập nhật ${data && data.items ? data.items.length + ' ' : ''} môn thành công!`, 'success');
            }
            done && done();
        });
    };
}

export function deleteMultiDtChuongTrinhDaoTao(data, done) {
    return () => {
        const url = '/api/dao-tao/chuong-trinh-dao-tao/multiple';
        T.delete(url, { data }, data => {
            if (data.error) {
                T.notify('Xóa chương trình đào tạo bị lỗi!', 'danger');
            }
            done && done();
        });
    };
}


export function createDtChuongTrinhDaoTao(item, done) {
    return dispatch => {
        const url = '/api/dao-tao/chuong-trinh-dao-tao';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo chương trình đào tạo bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                T.notify('Tạo chương trình đào tạo thành công!', 'success');
                if (done) done();
                dispatch(getDtChuongTrinhDaoTaoPage());
            }
        });
    };
}

export function deleteDtChuongTrinhDaoTao(id, done) {
    return () => {
        const url = '/api/dao-tao/chuong-trinh-dao-tao';
        console.log(id);
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa chương trình đào tạo bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.alert('Chương trình đào tạo đã xóa thành công!', 'success', false, 800);
                done && done();
            }
        }, () => T.notify('Xóa chương trình đào tạo bị lỗi!', 'danger'));
    };
}

export function updateDtChuongTrinhDaoTao(id, changes, done) {
    return dispatch => {
        const url = '/api/dao-tao/chuong-trinh-dao-tao';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật chương trình đào tạo bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin chương trình đào tạo thành công!', 'success');
                dispatch(getDtChuongTrinhDaoTaoPage());
            }
        }, () => T.notify('Cập nhật thông tin chương trình đào tạo bị lỗi!', 'danger'));
    };
}



export function changeDtChuongTrinhDaoTao(item) {
    return { type: DtChuongTrinhDaoTaoUpdate, item };
}