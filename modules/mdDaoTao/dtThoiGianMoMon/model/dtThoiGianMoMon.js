// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.dtThoiGianMoMon.foo = () => { };

    app.model.dtThoiGianMoMon.getActive = () => new Promise(resolve =>
        app.model.dtThoiGianMoMon.get({ kichHoat: 1 }, (error, item) => {
            app.model.dtCauTrucKhungDaoTao.get({ id: item.nam }, (error, ctkdt) => {
                if (!error && item && ctkdt) {
                    resolve({ ...item, namDaoTao: ctkdt.namDaoTao, khoa: ctkdt.khoa });
                }
            });
        }));
};