// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.hcthNhiemVu.foo = () => { };
    const { handleResult } = require('../../constant');

    // app.model.hcthCongVanDen.foo = () => { };
    app.model.hcthNhiemVu.asyncGet = (condition) => new Promise((resolve, reject) => {
        app.model.hcthNhiemVu.get(condition, (error, item) => {
            handleResult(resolve, reject, item, error);
        });
    });

    app.model.hcthNhiemVu.asyncCreate = (data) => new Promise((resolve, reject) => {
        app.model.hcthNhiemVu.create(data, (error, item) => {
            handleResult(resolve, reject, item, error);
        });
    });

    app.model.hcthNhiemVu.asyncUpdate = (condition, change) => new Promise((resolve, reject) => {
        app.model.hcthNhiemVu.update(condition, change, (error, item) => {
            handleResult(resolve, reject, item, error);
        });
    });

    app.model.hcthNhiemVu.asyncCreate = data => new Promise((resolve, reject) => {
        app.model.hcthNhiemVu.create(data, (error, item) => handleResult(resolve, reject, item, error));
    });
};