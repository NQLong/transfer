import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmHoSoCcvcNldGetAll = 'DmHoSoCcvcNld:GetAll';
const DmHoSoCcvcNldGetPage = 'DmHoSoCcvcNld:GetPage';
const DmHoSoCcvcNldUpdate = 'DmHoSoCcvcNld:Update';

export default function DmHoSoCcvcNldReducer(state = null, data) {
    switch (data.type) {
        case DmHoSoCcvcNldGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmHoSoCcvcNldGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmHoSoCcvcNldUpdate:
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
export function getDmHoSoCcvcNldAll(done) {
    return dispatch => {
        const url = `/api/danh-muc/ho-so-cong-chuc-vien-chuc-nguoi-lao-dong/all`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách Hồ sơ công chức viên chức - người lao động bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmHoSoCcvcNldGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách Hồ sơ công chức viên chức - người lao động bị lỗi!', 'danger'));
    }
}

export function getDmHoSoCcvcNld(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/ho-so-cong-chuc-vien-chuc-nguoi-lao-dong/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin Hồ sơ công chức viên chức - người lao động bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    }
}

export function createDmHoSoCcvcNld(item, done) {
    return dispatch => {
        const url = `/api/danh-muc/ho-so-cong-chuc-vien-chuc-nguoi-lao-dong`;
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo Hồ sơ công chức viên chức - người lao động bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmHoSoCcvcNldAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo Hồ sơ công chức viên chức - người lao động bị lỗi!', 'danger'));
    }
}

export function deleteDmHoSoCcvcNld(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/ho-so-cong-chuc-vien-chuc-nguoi-lao-dong`;
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục Hồ sơ công chức viên chức - người lao động bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmHoSoCcvcNldAll());
            }
            done && done(data.error);
        }, error => T.notify('Xóa Hồ sơ công chức viên chức - người lao động bị lỗi!', 'danger'));
    }
}

export function updateDmHoSoCcvcNld(ma, changes, done) {
    return dispatch => {
        const url = `/api/danh-muc/ho-so-cong-chuc-vien-chuc-nguoi-lao-dong`;
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin Hồ sơ công chức viên chức - người lao động bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật thông tin Hồ sơ công chức viên chức - người lao động thành công!', 'success');
                dispatch(getDmHoSoCcvcNldAll());
            }
            done && done(data.error);
        }, error => T.notify('Cập nhật thông tin Hồ sơ công chức viên chức - người lao động bị lỗi!', 'danger'));
    }
}

export function changeDmHoSoCcvcNld(item) {
    return { type: DmHoSoCcvcNldUpdate, item };
}
