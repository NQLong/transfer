// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.qtHopDongLaoDong.foo = () => { };
    app.model.qtHopDongLaoDong.getShccAuto = (maDonVi) => new Promise(resolve => {
        app.model.qtHopDongLaoDong.getMaxShccByDonVi(maDonVi, (error, item) => {
            resolve({ error, preShcc: item && item.outBinds && item.outBinds.ret ? item.outBinds.ret + 1 : 1 });
        });
    });
};