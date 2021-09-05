import T from 'view/js/common';

const INewsGetPage = 'INews:GetPage';
const INewsGet = 'INews:Get';

export default function iNewsReducer(state = null, data) {
    switch (data.type) {
        case INewsGetPage: {
            return { ...state, page: data.page };
        }

        case INewsGet: {
            return { ...state, item: data.item, list: data.list };
        }

        default:
            return state;
    }
}

// Functions
T.initPage('inewsPage');

export function getINewsPage(pageNumber, pageSize, done) {
    const page = T.updatePage('inewsPage', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/inews/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách iNews bị lỗi !', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: INewsGetPage, page: data.page });
                done && done(data.page);
            }
        }, error => T.notify('Lấy danh sách iNews bị lỗi !', 'danger'));
    };
}

export function getInews(inewsId, done) {
    return dispatch => {
        const url = `/api/inews/item/${inewsId}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy iNews bị lỗi !', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: INewsGet, item: data.item, list: data.list });
                done && done(data.item, data.list);
            }
        }, error => T.notify('Lấy iNews bị lỗi !', 'danger'));
    };
}

export function createInews(done) {
    return dispatch => {
        const url = '/api/inews';
        T.post(url, { title: 'Tiêu đề mới' }, data => {
            if (data.error) {
                T.notify('Tạo mới iNews bị lỗi !', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                done && done(data);
            }
        }, error => T.notify('Tạo mới iNews bị lỗi !', 'danger'));
    };
}

export function updateInews(id, changes, done) {
    return dispatch => {
        const url = '/api/inews';
        T.put(url, { ...changes, id }, data => {
            if (data.error) {
                T.notify('Cập nhật iNews bị lỗi !', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Cập nhật iNews thành công !', 'success');
                done && done();
            }
        }, error => T.notify('Cập nhật iNews bị lỗi !', 'danger'));
    };
}

export function deleteInews(id, done) {
    return dispatch => {
        const url = '/api/inews';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xoá iNews bị lỗi !', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.notify('Xoá iNews thành công !', 'success');
                dispatch(getINewsPage());
                done && done();
            }
        }, error => T.notify('Xoá iNews bị lỗi !', 'danger'));
    };
}

export function createInewsItem(inewsId, changes, done) {
    return dispatch => {
        const url = '/api/inewsItem';
        T.post(url, { inewsId, ...changes }, data => {
            if (data.error) {
                T.notify('Tạo iNews item bị lỗi !', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                T.notify('Tạo iNews item thành công !', 'success');
                done && done(data.item);
            }
        }, error => T.notify('Tạo iNews item bị lỗi !', 'danger'));
    };
}

export function updateInewsItem(item, done) {
    return dispatch => {
        const url = '/api/inewsItem';
        const { id, ...changes } = item;
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật iNews item bị lỗi !', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Cập nhật iNews item thành công !', 'success');
                done && done(data.item);
            }
        }, error => T.notify('Cập nhật iNews item bị lỗi !', 'danger'));
    };
}

export function deleteInewsItem(item, done) {
    return dispatch => {
        const url = '/api/inewsItem';
        T.delete(url, { item }, data => {
            if (data.error) {
                T.notify('Xoá iNews item bị lỗi !', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.notify('Xoá iNews item thành công !', 'success');
                done && done(data.item);
            }
        }, error => T.notify('Xoá iNews item bị lỗi !', 'danger'));
    };
}

export function swapinewsItem(id, inewsId, isMoveUp, done) {
    return dispatch => {
        const url = '/api/inewsItem/swap';
        T.put(url, { id, inewsId, isMoveUp }, data => {
            if (data.error) {
                console.error('PUT: ' + url + '.', data.error);
            } else {
                done && done();
            }
        }, error => T.notify('Thay iNews item bị lỗi !', 'danger'));
    };
}