import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmNgachCdnnGetAll = 'DmNgachCdnn:GetAll';
const DmNgachCdnnGetPage = 'DmNgachCdnn:GetPage';
const DmNgachCdnnUpdate = 'DmNgachCdnn:Update';

export default function DmNgachCdnnReducer(state = null, data) {
    switch (data.type) {
        case DmNgachCdnnGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmNgachCdnnGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmNgachCdnnUpdate:
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
T.initPage('pageDmNgachCdnn');
export function getDmNgachCdnnPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDmNgachCdnn', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/ngach-cdnn/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chức danh nghề nghiệp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmNgachCdnnGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách chức danh nghề nghiệp bị lỗi!', 'danger'));
    };
}

export function getDmNgachCdnnAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/ngach-cdnn/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách chức danh nghề nghiệp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmNgachCdnnGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách chức danh nghề nghiệp bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmNgachCdnn(ma, done) {
    return () => {
        const url = `/api/danh-muc/ngach-cdnn/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin Chức danh nghề nghiệp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmNgachCdnn(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/ngach-cdnn';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo chức danh nghề nghiệp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmNgachCdnnPage());
                T.notify('Tạo mới thông tin chức danh nghề nghiệp thành công!', 'success');
                if (done) done(data);
            }
        }, (error) => T.notify('Tạo chức danh nghề nghiệp bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmNgachCdnn(id) {
    return dispatch => {
        const url = '/api/danh-muc/ngach-cdnn';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa chức danh nghề nghiệp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Chức danh nghề nghiệp đã xóa thành công!', 'success', false, 800);
                dispatch(getDmNgachCdnnPage());
            }
        }, (error) => T.notify('Xóa chức danh nghề nghiệp bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmNgachCdnn(id, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/ngach-cdnn';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin chức danh nghề nghiệp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin chức danh nghề nghiệp thành công!', 'success');
                done && done(data.item);
                dispatch(getDmNgachCdnnPage());
            }
        }, (error) => T.notify('Cập nhật thông tin chức danh nghề nghiệp bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function changeDmNgachCdnn(item) {
    return { type: DmNgachCdnnUpdate, item };
}

export const SelectAdapter_DmNgachCdnn = {
    ajax: false,
    getAll: getDmNgachCdnnAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.id, text: `${item.ma}: ${item.ten}` })) : [] }),
    condition: { kichHoat: 1 },
};

export const SelectAdapter_DmNgachCdnnV2 = {
    ajax: true,
    data: params => ({ condition: params.term, kichHoat: 1 }),
    url: '/api/danh-muc/ngach-cdnn/page/1/20',
    getOne: getDmNgachCdnn,
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDmNgachCdnn(ma, item => done && done({ id: item.ma, text: item.ma + ': ' + item.ten })))(),
    processResultOne: response => response && ({ value: response.ma, text: `${response.ma}: ${response.ten}` }),
};

export const SelectAdapter_DmNgachCdnnV3 = {
    ajax: true,
    data: params => ({ condition: params.term, kichHoat: 1 }),
    url: '/api/danh-muc/ngach-cdnn/page/1/20',
    getOne: getDmNgachCdnn,
    processResults: response => {
        let results = [];
        if (response && response.page && response.page.list) {
            let obj = response.page.list.groupBy('ten');
            Object.keys(obj).forEach(ten => {
                let ma = [];
                for (let idx = 0; idx < obj[ten].length; idx++) {
                    ma.push(obj[ten][idx].ma);
                }
                results.push({ id: ma.toString() , text: ten });
            });
        }
        return ({ results });
    },
};