// eslint-disable-next-line no-unused-vars
module.exports = app => {
    const {handleResult} = require('../../constant');

    // app.model.hcthCongVanDen.foo = () => { };
    app.model.hcthCongVanDen.getCVD = (condition) => new Promise((resolve, reject) => {
        app.model.hcthCongVanDen.get(condition, (error, item) => {
            handleResult(resolve, reject, item, error);
        });
    });



};