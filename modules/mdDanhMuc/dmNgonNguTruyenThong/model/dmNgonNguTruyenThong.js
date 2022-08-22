// eslint-disable-next-line no-unused-vars
module.exports = app => {
    app.model.dmNgonNguTruyenThong.init = async () => {
        // Create vi
        const checkVi = await app.model.dmNgonNguTruyenThong.get({ maCode: 'vi' });
        if (!checkVi) {
            const newViData = {
                maCode: 'vi',
                tenNgonNgu: 'Tiếng Việt',
                timKiem: 'TÌM KIẾM',
                trangCaNhan: 'TRANG CÁ NHÂN',
                dangNhap: 'ĐĂNG NHẬP',
                dangXuat: 'ĐĂNG XUẤT',
                xemTatCa: 'Xem tất cả',
                tapTinDinhKem: 'Tập tin đính kèm',
                khongTinTuc: 'Không có tin tức!',
                khongSuKien: 'Không có sự kiện!',
                ketNoi: 'KẾT NỐI VỚI USSH-VNUHCM',
                ketNoiVnu: 'KẾT NỐI VỚI VNUHCM',
                khongTuyenSinh: 'Không có tin tuyển sinh!'
            };
            await app.model.dmNgonNguTruyenThong.create(newViData);
        }

        // Create en
        const checkEn = await app.model.dmNgonNguTruyenThong.get({ maCode: 'en' });
        if (!checkEn) {
            const newEnData = {
                maCode: 'en',
                tenNgonNgu: 'Tiếng Anh',
                timKiem: 'SEARCH',
                trangCaNhan: 'DASHBOARD',
                dangNhap: 'SIGN IN',
                dangXuat: 'SIGN OUT',
                xemTatCa: 'View all',
                tapTinDinhKem: 'Attachment files',
                khongTinTuc: 'No latest news!',
                khongSuKien: 'No latest events!',
                ketNoi: 'CONNECT US',
                ketNoiVnu: 'CONNECT WITH VNUHCM',
                khongTuyenSinh: 'No admission news!'
            };
            await app.model.dmNgonNguTruyenThong.create(newEnData);
        }
    };

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
                    khongTinTuc: item.khongTinTuc || '',
                    khongSuKien: item.khongSuKien || '',
                    ketNoi: item.ketNoi || '',
                    ketNoiVnu: item.ketNoiVnu || '',
                    khongTuyenSinh: item.khongTuyenSinh || ''
                };
            });
        }

        return returnMapper;
    };
};