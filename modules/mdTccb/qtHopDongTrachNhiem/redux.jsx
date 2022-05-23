import T from 'view/js/common';

const QtHopDongTrachNhiemGetPage = 'QtHopDongTrachNhiem:GetPage';
export default function QtHopDongTrachNhiemReducer(state = null, data) {
    switch (data.type) {
        case QtHopDongTrachNhiemGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

//Admin Page ---------------------------------------------------------------------------------------------------------
T.initPage('pageQtHopDongTrachNhiem');
export function getQtHopDongTrachNhiemPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtHopDongTrachNhiem', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/hop-dong-trach-nhiem/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: QtHopDongTrachNhiemGetPage, page: data.page });
                if (done) done(data.page);
            }
        }, () => T.notify('Lấy danh sách quá trình đào tạo bị lỗi!', 'danger'));
    };
}

export function getHopDongTrachNhiem(ma, done) {
    return () => {
        const url = `/api/tccb/qua-trinh/hop-dong-trach-nhiem/edit/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify(`Lỗi: ${data.error.message}`, 'danger');
                console.error(data.error);
            } else done(data.item);
        });
    };
}
export function handleSoHopDongTrachNhiem(done) {
    return () => {
        T.get('/api/tccb/qua-trinh/hop-dong-trach-nhiem/handle-so-hop-dong', data => {
            if (data.error) {
                T.notify('Tạo số hợp đồng bị lỗi', 'danger');
                console.error(data.error);
            } else {
                done && done(data);
            }
        });
    };
}