// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.tcThoiGianHocPhi.foo = () => { };
    app.model.tcThoiGianHocPhi.getActive = () => new Promise((resolve, reject) => {
        try {
            app.model.tcThoiGianHocPhi.get({ kichHoat: 1 }, (error, item) => {
                if (error) throw (error);
                else if (!item) throw ('Not in current time');
                else resolve(item);
            });
        } catch (error) {
            reject(error);
        }
    });
};