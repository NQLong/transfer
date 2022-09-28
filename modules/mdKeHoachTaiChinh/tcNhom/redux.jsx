import T from 'view/js/common';


const TcNhomGetPage = 'TcNhom:GetPage';
const TcNhomGetItem = 'TcNhom:GetItem';
export default function tcNhomReducer(state = null, data) {
    switch (data.type) {
        case TcNhomGetPage:
            return Object.assign({}, state, { items: data.items });
        case TcNhomGetItem:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}

export const PageName = 'pageTcNhom';
T.initPage(PageName);
export function getPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/finance/nhom/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nhóm bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page);
                dispatch({ type: TcNhomGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách nhóm bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getNhom(id, done) {
    const url = `/api/finance/nhom/item/${id}`;
    return dispatch => {
        T.get(url, {}, (data) => {
            if (data.error) {
                T.notify('Lấy nhóm bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
                dispatch({ type: TcNhomGetItem, item: data.item });
            }
        }, () => T.notify('Lấy nhóm lỗi'));
    };
}

export function createNhom(data, done) {
    const url = '/api/finance/nhom';
    return () => {
        T.post(url, data, (res) => {
            if (res.error) {
                T.notify('Tạo nhóm bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
                // dispatch({ type: TcNhomGetItem, item: data.item });
            }
        }, () => T.notify('Tạo nhóm lỗi'));
    };
}

export const SelectAdapter_TcNhom = {
    ajax: true,
    data: params => ({ condition: params.term }),
    url: '/api/finance/nhom/page/1/20',
    processResults: response => ({ results: response?.page?.list?.length ? response.page.list.map(item => ({ id: item.id, text: item.ten })) : [] }),
    fetchOne: (id, done) => (getNhom(id, item => done && done({ id: item.id, text: item.ten })))(),
};