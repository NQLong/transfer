import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const dmKhcnLinhVucKhoaHocGetAll = 'dmKhcnLinhVucKhoaHoc:GetAll';
const dmKhcnLinhVucKhoaHocGetPage = 'dmKhcnLinhVucKhoaHoc:GetPage';
const dmKhcnLinhVucKhoaHocUpdate = 'dmKhcnLinhVucKhoaHoc:Update';

export default function dmKhcnLinhVucKhoaHocReducer(state = null, data) {
    switch (data.type) {
        case dmKhcnLinhVucKhoaHocGetAll:
            return Object.assign({}, state, { items: data.items });
        case dmKhcnLinhVucKhoaHocGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

export function getDmKhcnLinhVucKhoaHoc(ma, done) {
    return dispatch => {
        const url = `/api/danh-muc/khcn-linh-vuc-khoa-hoc/${ma}`;
        T.get(url, { ma }, data => {
            if (data.error) {
                T.notify('Lấy thông tin lĩnh vực khoa học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}
// Actions ------------------------------------------------------------------------------------------------------------
export const PageName = 'pageDmKhcnLinhVucKhoaHoc';
T.initPage(PageName);

export const SelectAdapter_DmKhcnLinhVucKhoaHoc = {
    ajax: true,
    url: '/api/danh-muc/khcn-linh-vuc-khoa-hoc',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response ? response.items.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    getOne: getDmKhcnLinhVucKhoaHoc,
    processResultOne: data => data && ({ value: data.ma, text: data.ma + ': ' + data.ten }),
};