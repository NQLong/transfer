// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.hcthCongVanDi.foo = () => { };
    const {handleResult} = require('../../constant');

    app.model.hcthCongVanDi.getCVD = (condition) => new Promise((resolve, reject) => {
        app.model.hcthCongVanDi.get(condition, (error, item) => {
            handleResult(resolve, reject, item, error);
        }); 
    });
};