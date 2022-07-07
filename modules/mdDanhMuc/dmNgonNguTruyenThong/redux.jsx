import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmNgonNguGetAll = 'DmNgonNgu:GetAll';
export default function DmNgonNguReducer(state = null, data) {
    switch (data.type) {
        case DmNgonNguGetAll:
            return Object.assign({}, state, { items: data.items });

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getDmNgonNguAll(condition, done) {
    return dispatch => {
        const url = '/api/danh-muc/ngon-ngu/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách ngôn ngữ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmNgonNguGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách ngôn ngữ bị lỗi!', 'danger'));
    };
}

export function getDmNgonNgu(maCode, done) {
    return () => {
        const url = `/api/danh-muc/ngon-ngu/item/${maCode}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin ngôn ngữ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function createDmNgonNgu(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/ngon-ngu';
        T.post(url, { item }, data => {
            if (data.error) {
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo ngôn ngữ thành công!', 'success');
                dispatch(getDmNgonNguAll());
                if (done) done(data);
            }
        }, () => T.notify('Tạo ngôn ngữ bị lỗi!', 'danger'));
    };
}

export function updateDmNgonNgu(maCode, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/ngon-ngu';
        T.put(url, { maCode, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật ngôn ngữ bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật ngôn ngữ thành công!', 'success');
                done && done(data.item);
                dispatch(getDmNgonNguAll());
            }
        }, () => T.notify('Cập nhật ngôn ngữ bị lỗi!', 'danger'));
    };
}

export function deleteDmNgonNgu(maCode) {
    return dispatch => {
        const url = '/api/danh-muc/ngon-ngu';
        T.delete(url, { maCode }, data => {
            if (data.error) {
                T.notify('Xóa danh mục ngôn ngữ bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Ngôn ngữ đã xóa thành công!', 'success', false, 800);
                dispatch(getDmNgonNguAll());
            }
        }, () => T.notify('Xóa danh mục ngôn ngữ bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_DmNgonNgu = {
    ajax: false,
    data: params => ({ condition: params.term }),
    url: '/api/danh-muc/ngon-ngu/all',
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.maCode, text: `${item.maCode}: ${item.tenNgonNgu}` })) : [] }),
    fetchOne: (id, done) => getDmNgonNgu(id, item => done && done({ id: item.maCode, text: `${item.maCode}: ${item.tenNgonNgu}` }))()
};