// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.dmLoaiCongVan.foo = () => { };

    app.model.dmLoaiCongVan.getLoai = (condition, selectedColumns, orderBy) => new Promise((resolve, reject) => {
        app.model.dmLoaiCongVan.get(condition, selectedColumns, orderBy, (error, item) => {
            const { handleResult } = require('../../../mdHanhChinhTongHop/constant');
            handleResult(resolve, reject, item, error);
        });
    });
};