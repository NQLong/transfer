import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const WebsiteGioiThieuGetAll = 'WebsiteGioiThieu:GetAll';
const WebsiteGioiThieuGetPage = 'WebsiteGioiThieu:GetPage';
const WebsiteGioiThieuUpdate = 'WebsiteGioiThieu:Update';
const WebsiteGioiThieuGet = 'WebsiteGioiThieu:Get';
const WebsiteGioiThieuHinhGetAll = 'WebsiteGioiThieuHinh:GetAll';
const WebsiteGioiThieuHinhUpdate = 'WebsiteGioiThieuHinh:Update';
const WebsiteGioiThieuHomeDv = 'WebsiteGioiThieuHomeDv:Update';

export default function WebsiteGioiThieuReducer(state = null, data) {
    switch (data.type) {
        case WebsiteGioiThieuGetAll:
            return Object.assign({}, state, { items: data.items });
        case WebsiteGioiThieuGetPage:
            return Object.assign({}, state, { page: data.page });
        case WebsiteGioiThieuGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case WebsiteGioiThieuHomeDv:
            return Object.assign({}, state, { homeDv: data.items });

        case WebsiteGioiThieuUpdate:
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

        case WebsiteGioiThieuHinhGetAll:
            return Object.assign({}, state, { items: data.items });

        case WebsiteGioiThieuHinhUpdate:
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
T.initPage('pageWebsiteGioiThieu', true);
export function getWebsiteGioiThieuPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageWebsiteGioiThieu', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/website/intro/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách giới thiệu website đơn vị bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: WebsiteGioiThieuGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách giới thiệu website đơn vị bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    }
}

export function getWebsiteGioiThieuAll(maDonVi, done) {
    return dispatch => {
        const url = `/api/website/intro/all/` + maDonVi;
        T.get(url, { maDonVi }, data => {
            if (data.error) {
                T.notify('Lấy danh sách giới thiệu website đơn vị bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: WebsiteGioiThieuGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách giới thiệu website đơn vị bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    }
}

export function getWebsiteGioiThieu(ma, done) {
    return dispatch => {
        const url = `/api/website/intro/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin giới thiệu website đơn vị bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
                dispatch({ type: WebsiteGioiThieuGet, item: data.item });
            }
        }, error => console.error(`GET: ${url}.`, error));
    }
}

export function createWebsiteGioiThieu(item, done) {
    return dispatch => {
        const url = `/api/website/intro`;
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo giới thiệu website đơn vị bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo thông tin website đơn vị thành công!', 'success');
                dispatch(getWebsiteGioiThieuAll(item.maDonVi));
                if (done) done(data);
            }
        }, error => T.notify('Tạo giới thiệu website đơn vị bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    }
}

export function deleteWebsiteGioiThieu(maDonVi, ma) {
    return dispatch => {
        const url = `/api/website/intro`;
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa mục giới thiệu website đơn vị bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Mục giới thiệu Website đơn vị đã xóa thành công!', 'success', false, 800);
                dispatch(getWebsiteGioiThieuAll(maDonVi));
            }
        }, error => T.notify('Xóa giới thiệu website đơn vị bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    }
}

export function updateWebsiteGioiThieu(maDonVi, ma, changes, done) {
    return dispatch => {
        const url = `/api/website/intro`;
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin giới thiệu website đơn vị bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin giới thiệu website đơn vị thành công!', 'success');
                if (done) done(data.items);
                dispatch(getWebsiteGioiThieuAll(maDonVi));
            }
        }, error => T.notify('Cập nhật thông tin giới thiệu website đơn vị bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    }
}

export function swapWebsiteGioiThieu(maDonVi, ma, thuTu, isMoveUp, done) {
    return dispatch => {
        const url = '/api/website/intro/swap';
        T.put(url, { ma, thuTu, isMoveUp, maDonVi }, data => {
            if (data.error) {
                T.notify('Thay đổi vị trí mục giới thiệu khoa bị lỗi!', 'danger')
                console.error('PUT: ' + url + '. ' + data.error);
            } else {
                dispatch(getWebsiteGioiThieuAll(maDonVi));
                done && done();
            }
        }, error => T.notify('Thay đổi vị trí mục giới thiệu khoa bị lỗi!', 'danger'));
    }
}

export function changeWebsiteGioiThieu(item) {
    return { type: WebsiteGioiThieuUpdate, item };
}

//WebsiteGioiThieuHinh
export function getWebsiteGioiThieuHinhAll(condition, done) {
    return dispatch => {
        const url = `/api/website/intro/image/all`;
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hinh giới thiệu website đơn vị bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: WebsiteGioiThieuHinhGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách hình giới thiệu website đơn vị bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    }
}

export function getWebsiteGioiThieuHinhAllById(maWebsiteGioiThieu, done) {
    return dispatch => {
        const url = `/api/website/intro/image/all/${maWebsiteGioiThieu}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách hinh giới thiệu website đơn vị bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: WebsiteGioiThieuHinhGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách hình giới thiệu website đơn vị bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    }
}

export function getWebsiteGioiThieuHinh(ma, done) {
    return dispatch => {
        const url = `/api/website/intro/image/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin hình giới thiệu website đơn vị bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    }
}

export function createWebsiteGioiThieuHinh(item, done) {
    return dispatch => {
        const url = `/api/website/intro/image`;
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo hình giới thiệu website đơn vị bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo hình giới thiệu website đơn vị thành công!', 'success');
                dispatch(getWebsiteGioiThieu(item.maWebsiteGioiThieu));
                if (done) done(data);
            }
        }, error => T.notify('Tạo hình giới thiệu website đơn vị bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    }
}

export function deleteWebsiteGioiThieuHinh(item) {
    return dispatch => {
        const url = `/api/website/intro/image`;
        T.delete(url, { ma: item.ma }, data => {
            if (data.error) {
                T.notify('Xóa hình giới thiệu website đơn vị bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Hình giới thiệu Website đơn vị đã xóa thành công!', 'success', false, 800);
                dispatch(getWebsiteGioiThieu(item.maWebsiteGioiThieu));
            }
        }, error => T.notify('Xóa hình giới thiệu website đơn vị bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    }
}

export function updateWebsiteGioiThieuHinh(maWebsiteGioiThieu, ma, changes, done) {
    return dispatch => {
        const url = `/api/website/intro/image`;
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin hình giới thiệu website đơn vị bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin hình giới thiệu website đơn vị thành công!', 'success');
                if (done) done(data.items);
                dispatch(getWebsiteGioiThieu(maWebsiteGioiThieu));
            }
        }, error => T.notify('Cập nhật thông tin hình giới thiệu website đơn vị bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    }
}

export function swapWebsiteGioiThieuHinh(maWebsiteGioiThieu, ma, thuTu, isMoveUp, done) {
    return dispatch => {
        const url = '/api/website/intro/image/swap';
        T.put(url, { ma, thuTu, isMoveUp, maWebsiteGioiThieu }, data => {
            if (data.error) {
                T.notify('Thay đổi vị trí hình giới thiệu khoa bị lỗi!', 'danger')
                console.error('PUT: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch(getWebsiteGioiThieu(maWebsiteGioiThieu));
            }
        }, error => T.notify('Thay đổi vị trí hình giới thiệu khoa bị lỗi!', 'danger'));
    }
}

export function getThongTinGioiThieu(maDonVi, done) {
    return dispatch => {
        const url = `/website/intro/all/` + maDonVi;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách giới thiệu website đơn vị bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: WebsiteGioiThieuHomeDv, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách giới thiệu website đơn vị bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    }
}

export function changeWebsiteGioiThieuHinh(item) {
    return { type: WebsiteGioiThieuHinhUpdate, item };
}