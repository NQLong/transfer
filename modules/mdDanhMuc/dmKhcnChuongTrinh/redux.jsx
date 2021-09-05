import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const dmKhcnChuongTrinhGetAll = 'dmKhcnChuongTrinh:GetAll';
const dmKhcnChuongTrinhGetPage = 'dmKhcnChuongTrinh:GetPage';
const dmKhcnChuongTrinhUpdate = 'dmKhcnChuongTrinh:Update';

export default function dmKhcnChuongTrinhReducer(state = null, data) {
    switch (data.type) {
        case dmKhcnChuongTrinhGetAll:
            return Object.assign({}, state, { items: data.items });
        case dmKhcnChuongTrinhGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}
export function getDmKhcnChuongTrinh(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/khcn-chuong-trinh/${ma}`;
        T.get(url, { ma }, data => {
            if (data.error) {
                T.notify('Lấy thông tin danh sách chương trình bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}
// Actions ------------------------------------------------------------------------------------------------------------
export const PageName = 'pagedmKhcnChuongTrinh';
T.initPage(PageName);

export const SelectAdapter_DmKhcnChuongTrinh = {
    ajax: true,
    url: '/api/danh-muc/khcn-chuong-trinh',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response ? response.items.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    getOne: getDmKhcnChuongTrinh,
    processResultOne: data => data && ({ value: data.ma, text: data.ma + ': ' + data.ten }),
};