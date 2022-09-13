import T from 'view/js/common';

const getPage = 'fwSmsTemplateGetPage';

export default function fwSmsTemplateReducer(state = null, data) {
    switch (data.type) {
        case getPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}
T.initPage('fwSmsTemplatePage');
export function fwSmsTemplateGetPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('fwSmsTemplatePage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/sms/template/page/${page.pageNumber}/${page.pageSize}`;
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

export function fwSmsTemplateCreate(data, done) {
    return dispatch => {
        const url = 'api/sms/template-draft';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Lỗi tạo template SMS', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo template SMS thành công', 'success');
                dispatch(fwSmsTemplateGetPage());
                done && done();
            }
        });
    };
}

export function fwSmsTemplateUpdate(id, changes, done) {
    return dispatch => {
        const url = 'api/sms/template-draft';
        T.put(url, { id, changes }, result => {
            if (result.error) {
                T.notify('Lỗi cập nhật template SMS', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật template SMS thành công', 'success');
                dispatch(fwSmsTemplateGetPage());
                done && done();
            }
        });
    };
}