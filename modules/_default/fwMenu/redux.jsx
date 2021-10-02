import T from 'view/js/common';

const MenuGetAll = 'Menu:GetAll';
export default function menuReducer(state = null, data) {
    switch (data.type) {
        case MenuGetAll:
            return data.items;
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getAll() {
    return dispatch => {
        const url = '/api/menu/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy menu bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                dispatch({ type: MenuGetAll, items: data.items });
            }
        }, () => T.notify('Lấy menu bị lỗi!', 'danger'));
    };
}

export function createMenu(id, done) {
    return dispatch => {
        const url = '/api/menu';
        T.post(url, { id }, data => {
            if (data.error) {
                T.notify('Tạo menu bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                dispatch(getAll());
                if (done) done(data);
            }
        }, () => T.notify('Tạo menu bị lỗi!', 'danger'));
    };
}

export function updateMenu(id, changes, done) {
    return dispatch => {
        const url = '/api/menu';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật menu bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật menu thành công!', 'success');
                dispatch(getAll());
                done && done();
            }
        }, () => T.notify('Cập nhật menu bị lỗi!', 'danger'));
    };
}

export function updateMenuPriorities(changes) {
    return dispatch => {
        const url = '/api/menu/priorities';
        T.put(url, { changes }, data => {
            if (data.error) {
                T.notify('Thay đổi vị trí menus bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật menu thành công!', 'success');
                dispatch(getAll());
            }
        }, () => T.notify('Thay đổi vị trí menus bị lỗi!', 'danger'));
    };
}

export function deleteMenu(id) {
    return dispatch => {
        const url = '/api/menu';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa menu bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Xóa menu thành công!', 'error', false, 800);
                dispatch(getAll());
            }
        }, () => T.notify('Xóa menu bị lỗi!', 'danger'));
    };
}


export function getMenu(menuId, done) {
    return () => {
        const url = `/api/menu/item/${menuId}`;
        T.get(url, data => done(data), error => done({ error }));
    };
}

export function createComponent(parentId, component, done) {
    return () => {
        const url = '/api/menu/component';
        T.post(url, { parentId, component }, data => {
            if (data.error) {
                T.notify('Tạo thành phần trang bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else if (done) {
                T.notify('Tạo mới thành phần trang thành công!', 'success');
                done(data);
            }
        }, () => T.notify('Tạo thành phần trang bị lỗi!', 'danger'));
    };
}

export function updateComponent(id, changes, done) {
    return () => {
        const url = '/api/menu/component';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thành phần trang bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else if (done) {
                T.notify('Cập nhật component thành công!', 'success');
                done(data);
            }
        }, () => T.notify('Cập nhật thành phần trang bị lỗi!', 'danger'));
    };
}

export function updateComponentPriorities(changes, done) {
    return () => {
        const url = '/api/menu/component/priorities/';
        T.put(url, { changes }, data => {
            if (data.error) {
                T.notify('Thay đổi vị trí component bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật component thành công!', 'success');
                done();
            }
        }, () => T.notify('Thay đổi vị trí component bị lỗi!', 'danger'));
    };
}

export function deleteComponent(id, done) {
    return () => {
        const url = '/api/menu/component';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thành phần lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.notify('Xóa thành phần thành công!', 'success');
                if (done) done(data);
            }
        }, () => T.notify('Xóa thành phần trang bị lỗi!', 'danger'));
    };
}

export function getComponentViews(type, done) {
    return () => {
        const url = `/api/menu/component/type/${type}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy menu bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done(data.items);
            }
        }, () => T.notify('Lấy menu bị lỗi!', 'danger'));
    };
}

export function buildMenu() {
    return () => {
        const url = '/api/menu/build';
        T.put(url, () => T.notify('Cập nhật menu thành công!', 'info'),
            () => T.notify('Cập nhật menu bị lỗi!', 'danger'));
    };
}
// division menu Actions ------------------------------------------------------------------------------------------------------------
export function divisionMenuGetAll(maDonVi, maWebsite) {
    return dispatch => {
        const url = `/api/dvWebsite/menu/${maDonVi}`;
        T.get(url, { maWebsite }, data => {
            if (data.error) {
                T.notify('Lấy menu bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                dispatch({ type: MenuGetAll, items: data.items });
            }
        }, () => T.notify('Lấy menu bị lỗi!', 'danger'));
    };
}

export function createDivisionMenu(id, maDonVi, maWebsite, done) {
    return dispatch => {
        const url = '/api/menu';
        T.post(url, { id, maDonVi, maWebsite }, data => {
            if (data.error) {
                T.notify('Tạo menu bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                dispatch(divisionMenuGetAll(maDonVi, maWebsite));
                if (done) done(data);
            }
        }, () => T.notify('Tạo menu bị lỗi!', 'danger'));
    };
}

export function updateDivisionMenu(id, changes, done) {
    return () => {
        const url = '/api/menu';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật menu bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật menu thành công!', 'success');
                done && done();
            }
        }, () => T.notify('Cập nhật menu bị lỗi!', 'danger'));
    };
}

export function updateDivisionMenuPriorities(changes, done) {
    return () => {
        const url = '/api/menu/priorities';
        T.put(url, { changes }, data => {
            if (data.error) {
                T.notify('Thay đổi vị trí menus bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else {
                done && done();
                T.notify('Cập nhật menu thành công!', 'success');
            }
        }, () => T.notify('Thay đổi vị trí menus bị lỗi!', 'danger'));
    };
}

export function deleteDivisionMenu(id, maDonVi, maWebsite) {
    return dispatch => {
        const url = '/api/menu';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa menu bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Xóa menu thành công!', 'error', false, 800);
                dispatch(divisionMenuGetAll(maDonVi, maWebsite));
            }
        }, () => T.notify('Xóa menu bị lỗi!', 'danger'));
    };
}

// home Actions ------------------------------------------------------------------------------------------------------------
export function divisionHomeMenuGetAll(maDonVi, maWebsite, done) {
    return () => {
        const url = `/home/dvWebsite/menu/${maDonVi}`;
        T.get(url, { maWebsite }, data => {
            if (data.error) {
                T.notify('Lấy menu bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data);
            }
        }, () => T.notify('Lấy menu bị lỗi!', 'danger'));
    };
}

export function homeMenuGet(link, done) {
    return () => {
        const url = '/home/menu';
        T.get(url, { link }, data => {
            if (data.error) {
                T.notify('Lấy menu bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data);
            }
        }, () => T.notify('Lấy menu bị lỗi!', 'danger'));
    };
}