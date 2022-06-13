// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.hcthLienKet.foo = () => { };
    const { handleResult } = require('../../constant');

    app.model.hcthLienKet.getAllLienKet = (targetA, targetTypeA, targetB, targettypeB) => new Promise((resolve, reject) => {
        app.model.hcthLienKet.getAllFrom(targetA, targetTypeA, targetB, targettypeB, (error, item) => {
            handleResult(resolve, reject, item, error);
        });
    });

    app.model.hcthLienKet.asyncCount = (condition) => new Promise((resolve, reject) => {
        app.model.hcthLienKet.count(condition, (error, item) => {
            handleResult(resolve, reject, item, error);
        });
    });

};