// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.hcthFile.foo = () => { };
    const {handleResult} = require('../../constant');

    app.model.hcthFile.getAllFile = (condition, selectedColumns, orderBy) => new Promise((resolve, reject) => {
        app.model.hcthFile.getAll(condition, selectedColumns, orderBy, (error, item) => {
            handleResult(resolve, reject, item, error);
        });
    });
};