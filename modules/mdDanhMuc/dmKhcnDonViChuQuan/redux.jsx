import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const dmKhcnDonViChuQuanGetAll = 'dmKhcnDonViChuQuan:GetAll';
const dmKhcnDonViChuQuanGetPage = 'dmKhcnDonViChuQuan:GetPage';
const dmKhcnDonViChuQuanUpdate = 'dmKhcnDonViChuQuan:Update';

export default function dmKhcnDonViChuQuanReducer(state = null, data) {
    switch (data.type) {
        case dmKhcnDonViChuQuanGetAll:
            return Object.assign({}, state, { items: data.items });
        case dmKhcnDonViChuQuanGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export const PageName = 'pageDmKhcnDonViChuQuan';
T.initPage(PageName);

export const SelectAdapter_DmKhcnDonViChuQuan = {
    ajax: true,
    url: '/api/danh-muc/khcn-don-vi-chu-quan',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response ? response.items.map(item => ({id: item.ma , text:item.ten})) : [] })
};