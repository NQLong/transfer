// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.hcthFileCongVan.foo = () => { };
    const {handleResult} = require('../../constant');


    app.model.hcthFileCongVan.getAllFile = (condition, selectedColumns, orderBy) => new Promise((resolve, reject) => {
        app.model.hcthFileCongVan.getAll(condition, selectedColumns, orderBy, (error, item) => {
            handleResult(resolve, reject, item, error);
        });
    });


};