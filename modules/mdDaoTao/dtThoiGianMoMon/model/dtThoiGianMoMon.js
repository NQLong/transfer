// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.dtThoiGianMoMon.foo = () => { };

    app.model.dtThoiGianMoMon.getActive = () => new Promise(resolve =>
        app.model.dtThoiGianMoMon.get({ kichHoat: 1 }, (error, item) => {
            if (!error && item) resolve(item);
        }));
};