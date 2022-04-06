import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const HcthGiaoNhiemVuGetAll = 'HcthGiaoNhiemVu:GetAll';
const HcthGiaoNhiemVuGetPage = 'HcthGiaoNhiemVu:GetPage';
const HcthGiaoNhiemVuSearchPage = 'HcthGiaoNhiemVu:SearchPage';
const HcthGiaoNhiemVuGet = 'HcthGiaoNhiemVu:Get';
// const HcthGiaoNhiemVuUpdate = 'HcthGiaoNhiemVu:Update';

export default function HcthGiaoNhiemVuReducer(state = null, data) {
    switch (data.type) {
        case HcthGiaoNhiemVuGet:
            return Object.assign({}, state, { item: data.item });
        case HcthGiaoNhiemVuGetAll:
            return Object.assign({}, state, { items: data.items });
        case HcthGiaoNhiemVuGetPage:
            return Object.assign({}, state, { page: data.page });
        case HcthGiaoNhiemVuSearchPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageHcthGiaoNhiemVu');
export function getHcthGiaoNhiemVuPage(pageNumber, pageSize, pageCondition, done) {
    // if (typeof filter === 'function') {
    //     done = filter;
    //     filter = {};
    // }
    const page = T.updatePage('pageHcthGiaoNhiemVu', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/hcth/giao-nhiem-vu/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            console.log('data :', data);
            if (data.error) {
                T.notify('Lấy danh sách sách giao nhiệm vụ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: HcthGiaoNhiemVuGetPage, page: data.page });
                done && done(data.page);
            }
        }, () => T.notify('Lấy danh sách sách giao nhiệm vụ bị lỗi!', 'danger'));
    };
}

export function createHcthGiaoNhiemVu(data, done) {
    return dispatch => {
        const url = '/api/hcth/giao-nhiem-vu';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm giao nhiệm vụ bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm giao nhiệm vụ thành công!', 'success');
                dispatch(getHcthGiaoNhiemVuSearchPage());
                done && done(data);
            }
        }, () => T.notify('Thêm giao nhiệm vụ bị lỗi', 'danger'));
    };
}

export function getHcthGiaoNhiemVuAll(done) {
    return dispatch => {
        const url = '/api/hcth/giao-nhiem-vu/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin giao nhiệm vụ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                console.log(data);
                dispatch({ type: HcthGiaoNhiemVuGetAll, items: data.items ? data.items : [] });
                done && done(data.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function updateHcthGiaoNhiemVu(id, changes, done) {
    return dispatch => {
        const url = '/api/hcth/giao-nhiem-vu';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật giao nhiệm vụ bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật giao nhiệm vụ thành công!', 'success');
                dispatch(getHcthGiaoNhiemVuSearchPage());
                done && done();
            }
        }, () => T.notify('Cập nhật giao nhiệm vụ học bị lỗi!', 'danger'));
    };
}

export function deleteHcthGiaoNhiemVu(id) {
    return dispatch => {
        const url = '/api/hcth/giao-nhiem-vu';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa giao nhiệm vụ bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Xóa giao nhiệm vụ thành công!', 'success');
                dispatch(getHcthGiaoNhiemVuSearchPage());
            }
        }, () => T.notify('Xóa giao nhiệm vụ bị lỗi!', 'danger'));
    };
}

// export function getHcthGiaoNhiemVuSearchPage(pageNumber, pageSize, pageCondition, filter, done) {
//     console.log(pageNumber, pageSize, pageCondition, filter);
//     if (typeof filter === 'function') {
//         done = filter;
//         filter = {};
//     }
//     const page = T.updatePage('pageHcthGiaoNhiemVu', pageNumber, pageSize, pageCondition, filter);
//     console.log('page : ', page);
//     return dispatch => {
//         const url = `/api/hcth/giao-nhiem-vu/search/page/${page.pageNumber}/${page.pageSize}`;
//         console.log(url);
//         T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
//             console.log('data 1: ', data);
//             if (data.error) {
//                 T.notify('Lấy danh sách giao nhiệm vụ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
//                 console.error(`GET: ${url}.`, data.error);
//             } else {
//                 if (page.pageCondition) data.page.pageCondition = page.pageCondition;
//                 if (page.filter) data.page.filter = page.filter;
//                 dispatch({ type: HcthGiaoNhiemVuSearchPage, page: data.page });
//                 done && done(data.page);
//             }
//         }, error => console.error(`GET: ${url}.`, error));
//     };
// }

export function getHcthGiaoNhiemVuSearchPage(pageNumber, pageSize, pageCondition, filter, done) {
    console.log('filter = ', filter);
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageHcthGiaoNhiemVu', pageNumber, pageSize, pageCondition, filter);
    console.log('page : ', page);
    return dispatch => {
        const url = `/api/hcth/giao-nhiem-vu/search/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách công văn đến bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: HcthGiaoNhiemVuSearchPage, page: data.page });
                done && done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function deleteFile(id, index, file, done) {
    return () => {
        const url = '/api/hcth/giao-nhiem-vu/delete-file';
        T.put(url, { id, index, file }, data => {
            if (data.error) {
                console.error('PUT: ' + url + '.', data.error);
                T.notify('Xóa file đính kèm lỗi!', 'danger');
            } else {
                T.notify('Xóa file đính kèm thành công!', 'success');
                done && done();
            }
        }, () => T.notify('Xóa file đính kèm bị lỗi!', 'danger'));
    };
}


export function getGiaoNhiemVu(id, done) {
    return dispatch => {
        const url = `/api/hcth/giao-nhiem-vu/${id}`;
        T.get(url, data => {
            if (data.error) {
                console.error('GET: ' + url + '.', data.error);
                T.notify('Lấy giao nhiệm vụ bị lỗi!', 'danger');
            } else {
                dispatch({ type: HcthGiaoNhiemVuGet, item: data.item });
                done && done(data.item);
            }
        }, () => T.notify('Xóa file đính kèm bị lỗi!', 'danger'));
    };
}