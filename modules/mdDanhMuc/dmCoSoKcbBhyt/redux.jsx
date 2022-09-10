
export function getDmCoSoKcbBhyt(ma, done) {
    return () => {
        const url = `/api/danh-muc/co-so-kcb-bhyt/item/${ma}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy thông tin cơ sở KCB BHYT', 'danger');
            } else {
                done && done(result.item);
            }
        });
    };
}

export const SelectAdapter_DmCoSoKcbBhyt = ({
    ajax: true,
    url: '/api/danh-muc/co-so-kcb-bhyt/get-all-for-adapter',
    data: (params) => ({ searchTerm: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: `[${item.ma}] ${item.ten}: ${item.diaChi}`, ten: item.ten, loaiDangKy: item.loaiDangKy })) : [] }),
    fetchOne: (ma, done) => (getDmCoSoKcbBhyt(ma, item => item && done && done({ id: item.ma, text: `[${item.ma}] ${item.ten}: ${item.diaChi}` })))(),
});