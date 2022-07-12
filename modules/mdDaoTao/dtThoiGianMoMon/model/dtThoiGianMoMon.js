// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.dtThoiGianMoMon.foo = () => { };

    app.model.dtThoiGianMoMon.getActive = async () => {
        let allActive = await app.model.dtThoiGianMoMon.getAll({ kichHoat: 1 });
        allActive = allActive.map(async (item) => {
            const ctkdt = await app.model.dtCauTrucKhungDaoTao.get({ id: item.nam });
            if (ctkdt) {
                item.namDaoTao = ctkdt.namDaoTao;
                item.khoa = ctkdt.khoa;
            }
            return item;
        });
        const result = await Promise.all(allActive);
        return result;
    };
};