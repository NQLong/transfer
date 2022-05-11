// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.hcthHistory.foo = () => { };
    const { handleResult } = require('../../constant');

    app.model.hcthHistory.asyncCreate = (data) => new Promise((resolve, reject) => {
        app.model.hcthHistory.create({ ...data, thoiGian: new Date().getTime() }, (error, item) => {
            handleResult(resolve, reject, item, error);
        });
    });

    app.model.hcthHistory.asyncGet = (condition) => new Promise((resolve, reject) => {
        app.model.hcthHistory.get(condition, (error, item) => {
            handleResult(resolve, reject, item, error);
        });
    });

    app.model.hcthHistory.getAllHistoryFrom = (target, type) => new Promise((resolve, reject) => {
        app.model.hcthHistory.getAllFrom(target, type, (error, item) => {
            handleResult(resolve, reject, item, error);
        });
    });
};