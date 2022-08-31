import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TccbDinhMucCongViecGvVaNcvGetAll = 'TccbDinhMucCongViecGvVaNcv:GetAll';
const TccbDinhMucCongViecGvVaNcvUpdate = 'TccbDinhMucCongViecGvVaNcv:Update';

export default function TccbDinhMucCongViecGvVaNcvReducer(state = null, data) {
    switch (data.type) {
        case TccbDinhMucCongViecGvVaNcvGetAll:
            return Object.assign({}, state, { items: data.items });
        case TccbDinhMucCongViecGvVaNcvUpdate:
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
export function getTccbDinhMucCongViecGvVaNcvAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }
    return dispatch => {
        const url = '/api/tccb/dinh-muc-cong-viec-gv-va-ncv/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách định mức bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch({ type: TccbDinhMucCongViecGvVaNcvGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

export function getTccbDinhMucCongViecGvVaNcvAllByYear(nam, done) {
    return () => {
        const url = '/api/tccb/dinh-muc-cong-viec-gv-va-ncv/all-by-year';
        T.get(url, { nam }, data => {
            if (data.error) {
                T.notify('Lấy danh sách định mức theo năm bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
            }
        });
    };
}

export function getTccbDinhMucCongViecGvVaNcv(id, done) {
    return () => {
        const url = `/api/tccb/dinh-muc-cong-viec-gv-va-ncv/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy mục định mức bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.item);
            }
        });
    };
}

export function createTccbDinhMucCongViecGvVaNcv(item, done) {
    return dispatch => {
        const url = '/api/tccb/dinh-muc-cong-viec-gv-va-ncv';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify(`Tạo mới bị lỗi: ${data.error.message}`, 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify('Tạo mới định mức thành công!', 'success');
                dispatch(getTccbDinhMucCongViecGvVaNcvAll());
                if (done) done(data.item);
            }
        });
    };
}

export function deleteTccbDinhMucCongViecGvVaNcv(id, done) {
    return dispatch => {
        const url = '/api/tccb/dinh-muc-cong-viec-gv-va-ncv';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa định mức bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xoá định mức thành công!', 'success', false, 800);
                dispatch(getTccbDinhMucCongViecGvVaNcvAll());
                done && done();
            }
        }, () => T.notify('Xóa định mức bị lỗi!', 'danger'));
    };
}

export function updateTccbDinhMucCongViecGvVaNcv(id, changes, done) {
    return dispatch => {
        const url = '/api/tccb/dinh-muc-cong-viec-gv-va-ncv';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật định mức bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật định mức thành công!', 'success');
                dispatch(getTccbDinhMucCongViecGvVaNcvAll());
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật định mức bị lỗi!', 'danger'));
    };
}

export function changeTccbDinhMucCongViecGvVaNcv(item) {
    return { type: TccbDinhMucCongViecGvVaNcvUpdate, item };
}

export const SelectAdapter_NgachCdnnVaChucDanhKhoaHoc = {
    ajax: true,
    data: params => ({ condition: params.term }),
    url: '/api/tccb/ngach-cdnn-va-chuc-danh-khoa-hoc/all',
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getNgachCdnnHoacChucDanhKhoaHoc(ma, item => done && done({ id: item.ma, text: item.ten })))(),
};

export function getNgachCdnnHoacChucDanhKhoaHoc(ma, done) {
    return () => {
        const url = `/api/tccb/ngach-cdnn-va-chuc-danh-khoa-hoc/item/${ma}`;
        T.get(url, {}, data => {
            if (data.error) {
                done && done(null);
            } else {
                done && done(data.result);
            }
        }, () => T.notify('Lấy ngạch hoặc chức danh khoa học bị lỗi!', 'danger'));
    };
}
