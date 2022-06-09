import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------

const TccbSupportGetPage = 'TccbSupport:GetPage';
const TccbSupportUpdate = 'TccbSupport:Update';
const TccbSupportCreate = 'TccbSupport:Create';
const GetTccbSupportReply = 'TccbSupportReply:Get';
export function tccbSupport(state = null, data) {
    switch (data.type) {
        case TccbSupportGetPage:
            return Object.assign({}, state, { page: data.page });
        case TccbSupportUpdate:
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
        case TccbSupportCreate:
            if (state) {
                let updatedPage = Object.assign({}, state.page),
                    createdItem = data.item;
                updatedPage && createdItem.id && updatedPage.list.unshift(createdItem);
                return Object.assign({}, state, { page: updatedPage });
            } else {
                return null;
            }
        default:
            return state;
    }
}

export function tccbSupportReply(state = null, data) {
    switch (data.type) {
        case GetTccbSupportReply:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}
export function getPageTccbSupport(pageNumber, pageSize, pageCondition, done) {
    return dispatch => {
        const url = `/api/tccb/support/page/${pageNumber || 1}/${pageSize || 50}`;
        T.get(url, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: TccbSupportGetPage, page: result.page });
                done && done(result.page);
            }
        });
    };
}

export function createTccbSupport(oldData, data, dataTccbSupport, done) {
    return dispatch => {
        const url = '/api/tccb/support';
        T.post(url, { oldData, data, dataTccbSupport }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: TccbSupportCreate, item: result.item });
                T.notify('Yêu cầu đã được tạo thành công!', 'success');
                done && done();
            }
        });
    };
}

export function updateTccbSupport(id, data, dataTccbSupport, done) {
    return dispatch => {
        const url = '/api/tccb/support';
        T.put(url, { id, data, dataTccbSupport }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: TccbSupportUpdate, item: result.item });
                done && done();
            }
        });
    };
}

export function createTccbSupportReply(dataPhanHoi, done) {
    return dispatch => {
        const url = '/api/tccb/support-reply';
        T.post(url, { dataPhanHoi }, result => {
            if (result.error) {
                T.notify('Lỗi tạo phản hồi', 'danger');
                console.error(result.error);
            } else {
                dispatch(getTccbReply(dataPhanHoi.maYeuCau));
                done && done(result.item);
            }
        });
    };
}

export function assignTccbSupport(data, done) {
    return dispatch => {
        const url = '/api/tccb/support/assign';
        T.get(url, { data }, result => {
            if (result.error) {
                T.notify('Lỗi duyệt yêu cầu', 'danger');
                console.error(result.error);
            } else {
                T.alert('Duyệt thành công', 'success', false, 1000);
                dispatch(getPageTccbSupport());
                done && done(result);
            }
        });
    };
}

export function getTccbReply(maYeuCau, done) {
    return dispatch => {
        const url = `/api/tccb/support-reply/${maYeuCau}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy các phản hồi bị lỗi', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: GetTccbSupportReply, items: result.items });
                done && done(result.items);
            }
        });
    };
}