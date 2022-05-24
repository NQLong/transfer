import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmSvToHopTsGetPage = 'DmSvToHopTs:GetPage';
const DmSvToHopTsUpdate = 'DmSvToHopTs:Update';

export default function DmSvToHopTsReducer(state = null, data) {
    switch (data.type) {
        case DmSvToHopTsGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmSvToHopTsUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].maToHop == updatedItem.maToHop) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].maToHop == updatedItem.maToHop) {
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
T.initPage('pageDmSvToHopTs');
export function getDmSvToHopTsPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDmSvToHopTs', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/dao-tao/to-hop-thi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách tổ hợp bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmSvToHopTsGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách tổ hợp bị lỗi!', 'danger'));
    };
}

export function getDmSvToHopTs(id, done) {
    return () => {
        const url = `/api/danh-muc/dao-tao/to-hop-thi/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin tổ hợp bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmSvToHopTs(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/dao-tao/to-hop-thi';
        T.post(url, { data: item }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo tổ hợp bị lỗi', 'danger');
                console.error(`POST: ${url}.`, data.error);
                if (done) done(data.error);
            } else {
                T.notify('Tạo mới thông tin tổ hợp thành công!', 'success');
                dispatch(getDmSvToHopTsPage());
                if (done) done(data);
            }
        }, () => T.notify('Tạo tổ hợp bị lỗi!', 'danger'));
    };
}

export function deleteDmSvToHopTs(maToHop) {
    return dispatch => {
        const url = '/api/danh-muc/dao-tao/to-hop-thi';
        T.delete(url, { maToHop: maToHop }, data => {
            if (data.error) {
                T.notify('Xóa danh mục tổ hợp bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmSvToHopTsPage());
            }
        }, () => T.notify('Xóa tổ hợp bị lỗi!', 'danger'));
    };
}

export function updateDmSvToHopTs(maToHop, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/dao-tao/to-hop-thi';
        T.put(url, { maToHop, changes }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật thông tin tổ hợp bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin tổ hợp thành công!', 'success');
                dispatch(getDmSvToHopTsPage());
                if (done) done();
            }
        }, () => T.notify('Cập nhật thông tin tổ hợp bị lỗi!', 'danger'));
    };
}

export function changeDmSvToHopTs(item) {
    return { type: DmSvToHopTsUpdate, item };
}

export const SelectAdapter_DmSvToHopTs = {
    ajax: true,
    url: '/api/danh-muc/dao-tao/to-hop-thi/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.maToHop, text: `${item.maToHop}: ${item.tenMon1} - ${item.tenMon2} - ${item.tenMon3}` })) : [] }),
    fetchOne: (id, done) => (getDmSvToHopTs(id, item => done && done({
        id: item.maToHop, text: `${item.maToHop}: ${item.tenMon1} - ${item.tenMon2} - ${item.tenMon3}`
    })))(),
};