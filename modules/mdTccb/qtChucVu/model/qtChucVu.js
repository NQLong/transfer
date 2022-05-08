// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.qtChucVu.foo = () => { };
    const LIST_MA_CV_TRUONG_KHOA_BM = ['011', '009', '013'];
    app.model.qtChucVu.getAllTruongKhoaEmail = () => new Promise(resolve => {
        const condition = {
            statement: '(ngayRaQd < :today) AND (ngayRaQdThoiChucVu < :today) AND chucVuChinh = 1 AND maChucVu IN (:maTruongKhoa)',
            parameter: {
                today: new Date().getTime(),
                maTruongKhoa: LIST_MA_CV_TRUONG_KHOA_BM
            }
        };
        app.model.qtChucVu.getAll(condition, 'shcc', 'shcc', (error, items) => {
            if (error) resolve({ listEmail: [] });
            else {
                let listEmail = [];
                items.forEach(async (item, index) => {
                    let email = await app.getEmailByShcc(item.shcc);
                    email && listEmail.push(email);
                    if (index == items.length - 1) resolve(listEmail);
                });
            }
        });
    });
};