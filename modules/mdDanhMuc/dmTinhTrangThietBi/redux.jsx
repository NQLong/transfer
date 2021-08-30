import T from 'view/js/common';

const LABEL = 'tình trạng thiết bị'

// Reducer ------------------------------------------------------------------------------------------------------------
const GET_PAGE = 'dmTinhTrangThietBi:GetPage';

export default function dmTinhTrangThietBi(state = null, data) {
    switch (data.type) {
        case GET_PAGE:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    };
};

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('dmTinhTrangThietBi', true);

export function getDanhSachTinhTrangThietBi(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmTinhTrangThietBi', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/tinh-trang-thiet-bi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify(data.error.message || `Tạo mới ${LABEL} bị lỗi`, 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: GET_PAGE, page: data.page });
            }
        }, error => T.notify(`Lấy danh sách ${LABEL} bị lỗi` + (error.error.message && (':<br>' + data.error.message)), 'danger'));
    }
}

export function createTinhTrangThietBi(tinhTrangThietBi, done) {
    return dispatch => {
        const url = `/api/danh-muc/tinh-trang-thiet-bi/`
        T.post(url, { tinhTrangThietBi }, data => {
            if (data.error) {
                T.notify(data.error.message || `Tạo mới ${LABEL} bị lỗi`, 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify(`Tạo mới ${LABEL} thành công`, 'success');
                dispatch(getDanhSachTinhTrangThietBi());
                if (done) {
                    done(data.error, data.item);
                }
            }
        })
    }
}

export function deleteTinhTrangThietBi(ma, done) {
    return dispatch => {
        const url = '/api/danh-muc/tinh-trang-thiet-bi';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify(data.error.message || `Xoá ${LABEL} bị lỗi`, 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert(`Xoá ${LABEL} thành công`, 'success', false, 800);
                dispatch(getDanhSachTinhTrangThietBi());
                if (done) {
                    done(data.error, data.item);
                }
            }
        })
    }
}

export function updateTinhTrangThietBi(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/tinh-trang-thiet-bi';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify(data.error.message || `Cập nhật ${LABEL} bị lỗi`, 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify(`Cập nhật ${LABEL} thành công`, 'success');
                dispatch(getDanhSachTinhTrangThietBi());
                if (done) {
                    done(data.error);
                }
            }
        })
    }
}

export function getTinhTrangThietBi(maTinhTrangThietBi, done) {
    return dispatch => {
        const url = `/api/danh-muc/tinh-trang-thiet-bi/${maTinhTrangThietBi}`;
        T.get(url, {}, data => {
            if (data.error) {
                T.notify(`Lấy thông tin ${LABEL} bị lỗi!`, 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) {
                    done(data);
                }
            }
        }, error => T.notify(`Lấy thông tin ${LABEL} bị lỗi!`, 'danger'));
    };
}