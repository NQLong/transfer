// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.hcthDonViNhanCongVan.foo = () => { };
    const {handleResult} = require('../../constant');


    app.model.hcthDonViNhanCongVan.getAllDVN = (condition, selectedColumns, orderBy) => new Promise((resolve, reject) => {
        app.model.hcthDonViNhanCongVan.getAll(condition, selectedColumns, orderBy, (error, item) => {
            handleResult(resolve, reject, item, error);
        });
    });


};
