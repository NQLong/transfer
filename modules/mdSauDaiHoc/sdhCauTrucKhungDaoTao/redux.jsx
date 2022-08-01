import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SdhCauTrucKhungDaoTaoGetAll = 'SdhCauTrucKhungDaoTao:GetAll';
const SdhCauTrucKhungDaoTaoGetPage = 'SdhCauTrucKhungDaoTao:GetPage';
const SdhCauTrucKhungDaoTaoUpdate = 'SdhCauTrucKhungDaoTao:Update';

export default function dtCauTrucKhungDaoTaoReducer(state = null, data) {
    switch (data.type) {
        case SdhCauTrucKhungDaoTaoGetAll:
            return Object.assign({}, state, { items: data.items });
        case SdhCauTrucKhungDaoTaoGetPage:
            return Object.assign({}, state, { page: data.page });
        case SdhCauTrucKhungDaoTaoUpdate:
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
export function getSdhCauTrucKhungDaoTaoAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }
    return dispatch => {
        const url = '/api/sau-dai-hoc/cau-truc-khung-dao-tao/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách cấu trúc khung đào tạo bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch({ type: SdhCauTrucKhungDaoTaoGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

T.initPage('pageSdhCauTrucKhungDaoTao');
export function getSdhCauTrucKhungDaoTaoPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageSdhCauTrucKhungDaoTao', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/sau-dai-hoc/cau-truc-khung-dao-tao/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: pageCondition?.searchTerm, donViFilter: pageCondition?.donViFilter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách cấu trúc khung đào tạo bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: SdhCauTrucKhungDaoTaoGetPage, page: data.page });
            }
        });
    };
}

export function getSdhCauTrucKhungDaoTao(id, done) {
    return () => {
        const url = `/api/sau-dai-hoc/cau-truc-khung-dao-tao/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy cấu trúc khung đào tạo bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.item);
            }
        });
    };
}


export function createMultiSdhCauTrucKhungDaoTao(data, done) {
    return () => {
        const url = '/api/sau-dai-hoc/cau-truc-khung-dao-tao/multiple';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo cấu trúc khung đào tạo có lỗi!', 'danger');
            } else {
                T.notify(`Cập nhật ${data && data.items ? data.items.length + ' ' : ''} môn thành công!`, 'success');
            }
            done && done();
        });
    };
}

export function deleteMultiSdhCauTrucKhungDaoTao(data, done) {
    return () => {
        const url = '/api/sau-dai-hoc/cau-truc-khung-dao-tao/multiple';
        T.delete(url, { data }, data => {
            if (data.error) {
                T.notify('Xóa cấu trúc khung đào tạo bị lỗi!', 'danger');
            }
            done && done();
        });
    };
}


export function createSdhCauTrucKhungDaoTao(item, done) {
    return dispatch => {
        const url = '/api/sau-dai-hoc/cau-truc-khung-dao-tao';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify(`Tạo mới bị lỗi: ${data.error.message}`, 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify('Tạo cấu trúc khung đào tạo thành công!', 'success');
                data.warning && T.notify(data.warning.message, 'warning');
                dispatch(getSdhCauTrucKhungDaoTaoPage());
                if (done) done(data.item);
            }
        });
    };
}

export function deleteSdhCauTrucKhungDaoTao(id, done) {
    return () => {
        const url = '/api/sau-dai-hoc/cau-truc-khung-dao-tao';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa cấu trúc khung đào tạo bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.alert('Cấu trúc khung đào tạo đã xóa thành công!', 'success', false, 800);
                done && done();
            }
        }, () => T.notify('Xóa cấu trúc khung đào tạo bị lỗi!', 'danger'));
    };
}

export function updateSdhCauTrucKhungDaoTao(id, changes, done) {
    return dispatch => {
        const url = '/api/sau-dai-hoc/cau-truc-khung-dao-tao';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật cấu trúc khung đào tạo bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin cấu trúc khung đào tạo thành công!', 'success');
                dispatch(getSdhCauTrucKhungDaoTaoPage());
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật thông tin cấu trúc khung đào tạo bị lỗi!', 'danger'));
    };
}



export function changeSdhCauTrucKhungDaoTao(item) {
    return { type: SdhCauTrucKhungDaoTaoUpdate, item };
}

export const SelectAdapter_SdhCauTrucKhungDaoTao = {
    ajax: true,
    url: '/api/sau-dai-hoc/cau-truc-khung-dao-tao/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: item.namDaoTao, data: { mucCha: item.mucCha, mucCon: item.mucCon } })) : [] }),
    fetchOne: (id, done) => (getSdhCauTrucKhungDaoTao(id, item => done && done({ id: item.id, text: item.namDaoTao, data: { mucCha: item.mucCha, mucCon: item.mucCon } })))()
};