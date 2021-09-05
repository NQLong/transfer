import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmHoatDongKhcnAll = 'DmHoatDongKhcn:GetAll';
const DmHoatDongKhcnPage = 'DmHoatDongKhcn:GetPage';

export default function dmHoatDongKhcnReducer(state = null, data) {
    switch (data.type) {
        case DmHoatDongKhcnAll:
            return { ...state, items: data.items };
        case DmHoatDongKhcnPage:
            return { ...state, page: data.page };
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('DmHoatDongKhcnPage', true);
export function getDmHoatDongKhcnPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('DmHoatDongKhcnPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/khcn/dm-hoat-dong-khcn/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách danh mục hoạt động KH&CN bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: DmHoatDongKhcnPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách danh mục hoạt động KH&CN bị lỗi!', 'danger'));
    };
}

export function getDmHoatDongKhcnAll(done) {
    return dispatch => {
        const url = '/api/khcn/dm-hoat-dong-khcn/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách danh mục hoạt động KH&CN bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DmHoatDongKhcnAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách danh mục hoạt động KH&CN bị lỗi!', 'danger'));
    };
}

export function getDmHoatDongKhcn(ma, done) {
    return dispatch => {
        const url = `/api/khcn/dm-hoat-dong-khcn/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin danh mục hoạt động KH&CN bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmHoatDongKhcn(dmHoatDongKhcn, done) {
    return dispatch => {
        const url = '/api/khcn/dm-hoat-dong-khcn';
        T.post(url, { dmHoatDongKhcn }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một danh mục hoạt động KH&CN bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.alert('Tạo danh mục hoạt động KH&CN thành công!', 'success', false, 800);
                if (done) done(data);
                dispatch(getDmHoatDongKhcnPage());
            }
        }, error => T.notify('Tạo mới một danh mục hoạt động KH&CN bị lỗi!', 'danger'));
    };
}

export function updateDmHoatDongKhcn(ma, changes, done) {
    return dispatch => {
        const url = '/api/khcn/dm-hoat-dong-khcn';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu danh mục hoạt động KH&CN bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                done && done(data.item);
                T.alert('Cập nhập danh mục hoạt động KH&CN thành công!', 'success', false, 800);
                dispatch(getDmHoatDongKhcnPage());
            }
        }, () => T.notify('Cập nhật dữ liệu danh mục hoạt động KH&CN bị lỗi!', 'danger'));
    };
}

export function deleteDmHoatDongKhcn(ma, done) {
    return dispatch => {
        const url = '/api/khcn/dm-hoat-dong-khcn';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục hoạt động KH&CN bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa danh mục hoạt động KH&CN thành công!', 'success', false, 800);
                dispatch(getDmHoatDongKhcnPage());
            }
            done && done();
        }, error => T.notify('Xóa danh mục hoạt động KH&CN bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_DmHoatDongKhcnAll = {
    getAll: getDmHoatDongKhcnAll,
    processResults: (data) => ({ results: data.map(item => ({ value: item.ma, text: item.ten })) })
};