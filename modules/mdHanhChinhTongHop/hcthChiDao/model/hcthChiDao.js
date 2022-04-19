// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.hcthChiDao.foo = () => { };
    const {handleResult} = require('../../constant');

    // app.model.hcthCongVanDen.foo = () => { };
    app.model.hcthChiDao.getAllChiDao = (idcongvan, type) => new Promise((resolve, reject) => {
        app.model.hcthChiDao.getCongVanChiDao(idcongvan, type, (error, item) => {
            handleResult(resolve, reject, item, error);
        });
    });

};