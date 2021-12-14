import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtNghiThaiSanGetAll = 'QtNghiThaiSan:GetAll';
const QtNghiThaiSanGetPage = 'QtNghiThaiSan:GetPage';
const QtNghiThaiSanUpdate = 'QtNghiThaiSan:Update';
const QtNghiThaiSanGet = 'QtNghiThaiSan:Get';

export default function QtNghiThaiSanReducer(state = null, data) {
    switch (data.type) {
        case QtNghiThaiSanGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtNghiThaiSanGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtNghiThaiSanGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtNghiThaiSanUpdate:
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
T.initPage('pageQtNghiThaiSan');
export function getQtNghiThaiSanPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageQtNghiThaiSan', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/qua-trinh/nghi-thai-san/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: QtNghiThaiSanGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger'));
    };
}

export function getQtNghiThaiSanAll(done) {
    // let newData = {}, tmpData = [];
    // let getMergedObjs = (...objs) => {
    //     Object.fromEntries(
    //         Object.entries([{}, ...objs].map((e, i, a) => i ? Object.entries(e).map(f => (a[0][f[0]] ? a[0][f[0]].push(...([f[1]].flat())) :
    //             (a[0][f[0]] = [f[1]].flat()))) : e)[0]).map(e => e.map((f, i) => i ? (f.length > 1 ? f : f[0]) : f)));

    // }

    return dispatch => {
        const url = '/api/qua-trinh/nghi-thai-san/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                // data.items.forEach(item => {
                //     newData[item.ho + ' ' + item.ten] = [];
                // });
                // data.items.forEach(item => {
                //     newData[item.ho + ' ' + item.ten].push(item);
                // });

                if (done) done(data.items);
                dispatch({ type: QtNghiThaiSanGetAll, items: data.items ? data.items : {} });
            }
        }, () => T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger'));
    };
}

export function getQtNghiThaiSan(ma, done) {
    return () => {
        const url = `/api/qua-trinh/nghi-thai-san/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy hợp đồng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getQtNghiThaiSanEdit(ma, done) {
    return dispatch => {
        const url = `/api/qua-trinh/nghi-thai-san/edit/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin hợp đồng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data);
                dispatch({ type: QtNghiThaiSanGet, item: data.item });
            }
        }, () => T.notify('Lấy thông tin hợp đồng bị lỗi', 'danger'));
    };
}

export function createQtNghiThaiSan(item, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nghi-thai-san';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo hợp đồng bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo hợp đồng thành công!', 'success');
                dispatch(getQtNghiThaiSanPage());
                if (done) done(data);
            }
        }, () => T.notify('Tạo hợp đồng bị lỗi!', 'danger'));
    };
}

export function deleteQtNghiThaiSan(ma, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nghi-thai-san';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa hợp đồng bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Hợp đồng đã xóa thành công!', 'success', false, 800);
                dispatch(getQtNghiThaiSanPage());
            }
            done && done();
        }, () => T.notify('Xóa hợp đồng bị lỗi!', 'danger'));
    };
}

export function updateQtNghiThaiSan(ma, changes, done) {
    return dispatch => {
        const url = '/api/qua-trinh/nghi-thai-san';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật hợp đồng bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật hợp đồng thành công!', 'success');
                done && done(data.item);
                dispatch(getQtNghiThaiSan(ma));
            }
        }, () => T.notify('Cập nhật hợp đồng bị lỗi!', 'danger'));
    };
}

export function downloadWord(ma, done) {
    return () => {
        const url = `/user/qua-trinh/nghi-thai-san/${ma}/word`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Tải file word bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else if (done) {
                done(data.data);
            }
        }, () => T.notify('Tải file word bị lỗi', 'danger'));
    };
}
