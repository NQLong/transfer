// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.hcthDonViNhan.foo = () => { };
    const { handleResult } = require('../../constant');

    app.model.hcthDonViNhan.getAllDVN = (condition, selectedColumns, orderBy) => new Promise((resolve, reject) => {
        app.model.hcthDonViNhan.getAll(condition, selectedColumns, orderBy, (error, item) => {
            handleResult(resolve, reject, item, error);
        });
    });

    app.model.hcthDonViNhan.createFromList = (listDonViNhan, ma, loai) => {
        const promises = listDonViNhan.map(donViNhan => new Promise((resolve, reject) => {
            app.model.hcthDonViNhan.create({ donViNhan, ma, loai }, (error, item) => {
                handleResult(resolve, reject, item, error);
            });
        }));
        return Promise.all(promises);
    };

    app.model.hcthDonViNhan.asyncDelete = (condition) => new Promise((resolve, reject) => {
        app.model.hcthDonViNhan.delete(condition, (error) => error ? reject(error) : resolve());
    });
};