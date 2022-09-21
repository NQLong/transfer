import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmDienDongBhytGetAll = 'DmDienDongBhyt:GetAll';
const DmDienDongBhytGetPage = 'DmDienDongBhyt:GetPage';
const DmDienDongBhytUpdate = 'DmDienDongBhyt:Update';

export default function dmDienDongBhytReducer(state = null, data) {
    switch (data.type) {
        case DmDienDongBhytGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmDienDongBhytGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmDienDongBhytUpdate:
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
T.initPage('dmDienDongBhytPage', true);
export function getDmDienDongBhytPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmDienDongBhytPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/students/dien-dong-bhyt/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách diện đóng BHYT bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmDienDongBhytGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách diện đóng BHYT bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmDienDongBhytAll(done) {
    return dispatch => {
        const url = '/api/students/dien-dong-bhyt/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách diện đóng BHYT bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmDienDongBhytGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách diện đóng BHYT bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmDienDongBhyt(ma, done) {
    return () => {
        const url = `/api/students/dien-dong-bhyt/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin diện đóng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmDienDongBhyt(dmDienDongBhyt, done) {
    return dispatch => {
        const url = '/api/students/dien-dong-bhyt';
        T.post(url, { dmDienDongBhyt }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một diện đóng BHYT bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới một diện đóng thành công!', 'success');
                dispatch(getDmDienDongBhytPage());
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo mới một diện đóng bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmDienDongBhyt(ma, changes, done) {
    return dispatch => {
        const url = '/api/students/dien-dong-bhyt';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu diện đóng BHYT bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật dữ liệu diện đóng thành công!', 'success');
                done && done(data.item);
                dispatch(getDmDienDongBhytPage());
            }
        }, (error) => T.notify('Cập nhật dữ liệu diện đóng BHYT bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmDienDongBhyt(ma, done) {
    return dispatch => {
        console.log('Begin');
        const url = '/api/students/dien-dong-bhyt/delete';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa diện đóng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                console.log('Inside');
                T.alert('Xóa diện đóng BHYT thành công!', 'success', false, 800);
                dispatch(getDmDienDongBhytPage());
            }
            done && done();
        }, () => T.notify('Xóa diện đóng BHYT bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_dmDienDongBhyt = {
    ajax: false,
    getAll: getDmDienDongBhytAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    condition: { kichHoat: 1 },
};