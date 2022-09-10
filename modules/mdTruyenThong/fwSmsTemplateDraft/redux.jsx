import T from 'view/js/common';

const getPage = 'fwSmsTemplateDraftGetPage';

export default function fwSmsTemplateDraftReducer(state = null, data) {
    switch (data.type) {
        case getPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}
T.initPage('fwSmsTemplateDraftPage');
export function fwSmsTemplateDraftGetPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('fwSmsTemplateDraftPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/sms/template-draft/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy template sms chờ duyệt', 'danger');
                console.error(result.error);
            } else {
                if (page.pageCondition) result.page.pageCondition = page.pageCondition;
                dispatch({ type: getPage, page: result.page });
                done && done();
            }
        });
    };
}

export function fwSmsTemplateDraftCreate(data, done) {
    return dispatch => {
        const url = '/api/sms/template-draft';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Lỗi tạo template SMS chờ duyệt', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo template SMS thành công', 'success');
                dispatch(fwSmsTemplateDraftGetPage());
                done && done();
            }
        });
    };
}

export function fwSmsTemplateDraftUpdate(id, changes, done) {
    return dispatch => {
        const url = '/api/sms/template-draft';
        T.put(url, { id, changes }, result => {
            if (result.error) {
                T.notify('Lỗi cập nhật template SMS chờ duyệt', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật template SMS thành công', 'success');
                dispatch(fwSmsTemplateDraftGetPage());
                done && done();
            }
        });
    };
}