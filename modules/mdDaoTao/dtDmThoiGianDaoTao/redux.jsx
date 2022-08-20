import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtDmThoiGianDaoTaoGetAll = 'DtDmThoiGianDaoTao:GetAll';
const DtDmThoiGianDaoTaoUpdate = 'DtDmThoiGianDaoTao:Update';

export default function DtDmThoiGianDaoTaoReducer(state = null, data) {
    switch (data.type) {
        case DtDmThoiGianDaoTaoGetAll:
            return Object.assign({}, state, { items: data.items });
        case DtDmThoiGianDaoTaoUpdate:
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
export function dtDmThoiGianDaoTaoGetAll(searchTerm, done) {
    return dispatch => {
        const url = '/api/dao-tao/thoi-gian-dao-tao/all';
        T.get(url, { searchTerm }, result => {
            if (result.error) {
                T.notify('Lỗi khi lấy thời gian đào tạo', 'danger');
                console.error(`Error: ${result.error}`);
            } else {
                dispatch({ type: DtDmThoiGianDaoTaoGetAll, items: result.items });
                done && done(result.items);
            }
        });
    };
}

export function getDtDmThoiGianDaoTao(soNam, done) {
    return () => {
        const url = `/api/dao-tao/thoi-gian-dao-tao/item/${soNam}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thời gian đào tạo bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDtDmThoiGianDaoTao(item, done) {
    return dispatch => {
        const url = '/api/dao-tao/thoi-gian-dao-tao';
        T.post(url, { data: item }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo khối kiến thức bị lỗi', 'danger');
                console.error(`POST: ${url}.`, data.error);
                if (done) done(data.error);
            } else {
                T.notify('Tạo mới thời gian đào tạo thành công!', 'success');
                dispatch(dtDmThoiGianDaoTaoGetAll());
                if (done) done(data);
            }
        }, () => T.notify('Tạo khối kiến thức bị lỗi!', 'danger'));
    };
}

export function deleteDtDmThoiGianDaoTao(soNam) {
    return dispatch => {
        const url = '/api/dao-tao/thoi-gian-dao-tao';
        T.delete(url, { soNam }, data => {
            if (data.error) {
                T.notify('Xóa danh mục khối kiến thức bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(dtDmThoiGianDaoTaoGetAll());
            }
        }, () => T.notify('Xóa khối kiến thức bị lỗi!', 'danger'));
    };
}

export function updateDtDmThoiGianDaoTao(soNam, changes, done) {
    return dispatch => {
        const url = '/api/dao-tao/thoi-gian-dao-tao';
        T.put(url, { soNam, changes }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật thời gian đào tạo bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thời gian đào tạo thành công!', 'success');
                dispatch(dtDmThoiGianDaoTaoGetAll());
                if (done) done();
            }
        }, () => T.notify('Cập nhật thời gian đào tạo bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_DtDmThoiGianDaoTaoAll = ({
    ajax: true,
    url: '/api/dao-tao/thoi-gian-dao-tao/all',
    data: params => ({ searchTerm: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.soNam, text: `${item.soNam} năm` })) : [] }),
    fetchOne: (soNam, done) => (getDtDmThoiGianDaoTao(soNam, item => done && done({ id: item.soNam, text: `${item.soNam} năm` })))()
});