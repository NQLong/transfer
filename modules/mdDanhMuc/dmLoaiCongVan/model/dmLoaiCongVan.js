// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.dmLoaiCongVan.foo = () => { };
    const {handleResult} = require('../../../mdHanhChinhTongHop/constant');

    app.model.dmLoaiCongVan.getLoai = (condition, selectedColumns, orderBy) => new Promise((resolve, reject) => {
        app.model.dmLoaiCongVan.get(condition, selectedColumns, orderBy, (error, item) => {
            handleResult(resolve, reject, item, error);
        });
    });
};