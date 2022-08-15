import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------

const dashboardHcthGetPage = 'dashboardHcth:GetPage';

export default function dashboardHcthReducer(state = null, data) {
    switch (data.type) {
        case dashboardHcthGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

T.initPage('pageDashboardHcth');
export function getDashboardData(time, done) {
    return dispatch => {
        const url = '/api/hcth/dashboard/get-data';
        T.get(url, { time }, item => {
            if (item.error) {
                T.notify('Lấy dữ liệu bị lỗi', 'danger');
                console.error(`GET: ${url}.`, item.error);
            } else {
                dispatch({ type: dashboardHcthGetPage, page: item.data });
                if (done) done(item.data);
            }
        });
    };
}