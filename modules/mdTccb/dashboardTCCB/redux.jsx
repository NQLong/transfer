import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const dashboardTccbGetPage = 'dashboardTccb:GetPage';
const dashboardTccbGet = 'dashboardTccb:Get';

export default function dashboardTccbReducer(state = null, data) {
    switch (data.type) {
        case dashboardTccbGetPage:
            return Object.assign({}, state, { page: data.page });
        case dashboardTccbGet:
            return Object.assign({}, state, { selectedItem: data.item });
        default:
            return state;
    }
}


T.initPage('pageDashboardTccb');
export function getDashboardData(time, done) {
    return dispatch => {
        const url = '/api/tccb/dashboard/get-data';
        T.get(url, { time }, item => {
            if (item.error) {
                T.notify('Lấy dữ liệu bị lỗi', 'danger');
                console.error(`GET: ${url}.`, item.error);
            } else {
                if (done) done(item.data);
                dispatch({ type: dashboardTccbGetPage, page: item.data });
            }
        });
    };
}