import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const canBoTheoDonViGetAll = 'canBoTheoDonVi:GetAll';
const canBoTheoDonViGetPage = 'canBoTheoDonVi:GetPage';
const canBoTheoDonViGetGroupPage = 'canBoTheoDonVi:GetGroupPage';
const canBoTheoDonViGetGroupPageMa = 'canBoTheoDonVi:GetGroupPageMa';
const canBoTheoDonViUpdate = 'canBoTheoDonVi:Update';
const canBoTheoDonViGet = 'canBoTheoDonVi:Get';

export default function canBoTheoDonViReducer(state = null, data) {
    switch (data.type) {
        case canBoTheoDonViGetAll:
            return Object.assign({}, state, { items: data.items });
        case canBoTheoDonViGetGroupPage:
            return Object.assign({}, state, { page_gr: data.page });
        case canBoTheoDonViGetGroupPageMa:
            return Object.assign({}, state, { page_ma: data.page });
        case canBoTheoDonViGetPage:
            return Object.assign({}, state, { page: data.page });
        case canBoTheoDonViGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case canBoTheoDonViUpdate:
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
T.initPage('pageCanBoTheoDonVi');
export function getCanBoTheoDonViAll(maDonVi, done) {
    const page = T.updatePage('pageCanBoTheoDonVi', maDonVi);
    return dispatch => {
        const url = `/api/staff/${maDonVi}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách cán bộ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                console.log('this is list: ', data);
                if (page.maDonVi) data.page.maDonVi = page.maDonVi;
                if (done) done(data.item);
                dispatch({ type: canBoTheoDonViGetAll, items: data.item });
            }
        }, () => T.notify('Lấy danh sách cán bộ bị lỗi!', 'danger'));
    };
}