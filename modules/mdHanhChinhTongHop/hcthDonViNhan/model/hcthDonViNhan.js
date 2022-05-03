// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.hcthDonViNhan.foo = () => { };
    const {handleResult} = require('../../constant');

    app.model.hcthDonViNhan.getAllDVN = (condition, selectedColumns, orderBy) => new Promise((resolve, reject) => {
        app.model.hcthDonViNhan.getAll(condition, selectedColumns, orderBy, (error, item) => {
            handleResult(resolve, reject, item, error);
        });
    });
};