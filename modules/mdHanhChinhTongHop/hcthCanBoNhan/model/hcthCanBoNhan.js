// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.hcthCanBoNhan.foo = () => { };
    const { handleResult } = require('../../constant');
    app.model.hcthCanBoNhan.getAllCanBoNhanFrom = (target, targettype, ids) => new Promise((resolve, reject) => {
        app.model.hcthCanBoNhan.getAllFrom(target, targettype, ids, (error, items) => handleResult(resolve, reject, items, error));
    });

    app.model.hcthCanBoNhan.asyncGet = (condition) => new Promise((resolve, reject) => {
        app.model.hcthCanBoNhan.get(condition, (error, item) => {
            handleResult(resolve, reject, item, error);
        });
    });

    app.model.hcthCanBoNhan.asyncUpdate = (condition, change) => new Promise((resolve, reject) => {
        app.model.hcthCanBoNhan.update(condition, change, (error, item) => {
            handleResult(resolve, reject, item, error);
        });
    });
};