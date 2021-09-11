import T from 'view/js/common';

const CategoryGetAll = 'Category:GetAll';
const CategoryCreate = 'Category:Create';
const CategoryUpdate = 'Category:Update';
const CategoryDelete = 'Category:Delete';

export default function categoryReducer(state = [], data) {
    switch (data.type) {
        case CategoryGetAll:
            return data.items;

        case CategoryCreate:
            return [data.item].concat(state);

        case CategoryUpdate: {
            let updateItemState = state.slice();
            for (let i = 0; i < updateItemState.length; i++) {
                if (updateItemState[i].id == data.item.id) {
                    updateItemState[i] = data.item;
                    break;
                }
            }
            return updateItemState;
        }


        case CategoryDelete: {
            let deleteItemState = state.slice();
            for (let i = 0; i < deleteItemState.length; i++) {
                if (deleteItemState[i].id == data.id) {
                    deleteItemState.splice(i, 1);
                    break;
                }
            }
            return deleteItemState;
        }

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getAll(type, done) {
    return dispatch => {
        const url = '/api/category/' + type;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh mục bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: CategoryGetAll, items: data.items });
                done && done(data.items);
            }
        }, () => T.notify('Lấy danh mục bị lỗi!', 'danger'));
    };
}
export function getByDonVi(type, done) {
    return dispatch => {
        const url = '/api/category-donvi/' + type;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh mục bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: CategoryGetAll, items: data.items });
                done && done(data.items);
            }
        }, () => T.notify('Lấy danh mục bị lỗi!', 'danger'));
    };
}

export function getTuyenSinh(type, done) {
    return () => {
        const url = '/api/category/' + type;
        T.get(url, { condition: 'TS' }, data => {
            if (data.error) {
                T.notify('Lấy danh mục bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                //dispatch({ type: CategoryGetAll, items: data.items });
                done && done(data.items);
            }
        }, () => T.notify('Lấy danh mục bị lỗi!', 'danger'));
    };
}

export function createCategory(data, done) {
    return dispatch => {
        const url = '/api/category';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo danh mục bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                T.notify('Tạo danh mục thành công', 'success');
                dispatch({ type: CategoryCreate, item: data.item });
                if (done) done(data);
            }
        }, () => T.notify('Tạo danh mục bị lỗi!', 'danger'));
    };
}

export function updateCategory(id, changes, done) {
    return dispatch => {
        const url = '/api/category';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật danh mục bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật danh mục thành công!', 'success');
                dispatch({ type: CategoryUpdate, item: data.item });
                done && done();
            }
        }, () => T.notify('Cập nhật danh mục bị lỗi!', 'danger'));
    };
}

export function swapCategory(id, isMoveUp, type) {
    return dispatch => {
        const url = '/api/category/swap/';
        T.put(url, { id, isMoveUp }, data => {
            if (data.error) {
                T.notify('Thay đổi vị trí danh mục bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                dispatch(getAll(type));
            }
        }, () => T.notify('Thay đổi vị trí danh mục bị lỗi!', 'danger'));
    };
}

export function deleteCategory(id) {
    return dispatch => {
        const url = '/api/category';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa danh mục bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Xóa danh mục thành công!', 'error', false, 800);
                dispatch({ type: CategoryDelete, id });
            }
        }, () => T.notify('Xóa danh mục bị lỗi!', 'danger'));
    };
}

export function changeCategory(category) {
    return { type: CategoryUpdate, item: category };
}