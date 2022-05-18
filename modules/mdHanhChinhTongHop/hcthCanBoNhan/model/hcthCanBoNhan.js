// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.hcthCanBoNhan.foo = () => { };
    const {handleResult} = require('../../constant');
    app.model.hcthCanBoNhan.getAllCanBoNhanFrom = (target, targettype, ids) => new Promise((resolve, reject) => {
        app.model.hcthCanBoNhan.getAllFrom(target, targettype, ids, (error, items) => handleResult(resolve, reject, items, error));
    });
};