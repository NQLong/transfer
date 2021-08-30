import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmNganhDaoTaoGetAll = 'DmNganhDaoTao:Get';
const DmNganhDaoTaoGetPage = 'DmNganhDaoTao:GetPage';
const DmNganhDaoTaoUpdate = 'DmNganhDaoTao:Update';

export default function dmNganhDaoTaoReducer(state = null, data) {
    switch (data.type) {
        case DmNganhDaoTaoGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmNganhDaoTaoGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmNganhDaoTaoUpdate:
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
                return Object.assign({}, state, { items: updatedItems, page: updatedPage })
            } else {
                return null;
            }
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getDmNganhDaoTaoAll(done) {
    return dispatch => {
        const url = `/api/danh-muc/nganh-dao-Tao/all`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách ngành đào tạo bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmNganhDaoTaoGetAll, items: data.items ? data.items : [] });
            }
        })
    }
}

T.initPage('pageDmNganhDaoTao');
export function getDmNganhDaoTaoPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDmNganhDaoTao', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/nganh-dao-Tao/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách ngành đào tạo bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmNganhDaoTaoGetPage, page: data.page });
            }
        })
    }
}

export function createDmNganhDaoTao(item, done) {
    return dispatch => {
        const url = `/api/danh-muc/nganh-dao-Tao`;
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo ngành đào tạo bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch(getDmNganhDaoTaoPage());
            }
        })
    }
}

export function deleteDmNganhDaoTao(_id) {
    return dispatch => {
        const url = `/api/danh-muc/nganh-dao-Tao`;
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa ngành đào tạo bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Ngành đào tạo đã xóa thành công!', 'success', false, 800);
                dispatch(getDmNganhDaoTaoPage());
            }
        }, error => T.notify('Xóa ngành đào tạo bị lỗi!', 'danger'));
    }
}

export function updateDmNganhDaoTao(_id, changes, done) {
    return dispatch => {
        const url = `/api/danh-muc/nganh-dao-Tao`;
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật ngành đào tạo bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin ngành đào tạo thành công!', 'success');
                dispatch(changeDmNganhDaoTao(changes));
                dispatch(getDmNganhDaoTaoPage());
            }
        }, error => T.notify('Cập nhật thông tin ngành đào tạo bị lỗi!', 'danger'));
    }
}

export function getDmNganhDaoTao(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/nganh-dao-Tao/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin ngành đào tạo bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    }
}

export function changeDmNganhDaoTao(item) {
    return { type: DmNganhDaoTaoUpdate, item };
}