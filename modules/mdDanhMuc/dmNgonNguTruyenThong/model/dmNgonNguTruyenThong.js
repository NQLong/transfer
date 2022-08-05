// eslint-disable-next-line no-unused-vars
module.exports = app => {
    app.model.dmNgonNguTruyenThong.getLanguage = async () => {
        const items = await app.model.dmNgonNguTruyenThong.getAll();
        const returnMapper = {};
        if (items && items.length) {
            items.forEach(item => {
                returnMapper[item.maCode] = {
                    timKiem: item.timKiem || '',
                    trangCaNhan: item.trangCaNhan || '',
                    dangNhap: item.dangNhap || '',
                    dangXuat: item.dangXuat || '',
                    xemTatCa: item.xemTatCa || '',
                    tapTinDinhKem: item.tapTinDinhKem || '',
                };
            });
        }

        return returnMapper;
    };
};