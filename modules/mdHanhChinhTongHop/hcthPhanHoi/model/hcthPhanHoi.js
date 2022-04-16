// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.hcthPhanHoi.foo = () => { };
    const {handleResult} = require('../../constant');

    app.model.hcthPhanHoi.getAllPhanHoiFrom = (target, type) => new Promise((resolve, reject) => {
        app.model.hcthPhanHoi.getAllFrom(target, type, (error, item) => {
            handleResult(resolve, reject, item.rows || [], error);
        });
    });
};