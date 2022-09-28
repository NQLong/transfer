// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.hcthDonViNhan.foo = () => { };


    app.model.hcthDonViNhan.createFromList = (listDonViNhan, ma, loai, extension = {}) => {
        const promises = listDonViNhan.map(donViNhan => app.model.hcthDonViNhan.create({ donViNhan, ma, loai, ...extension }));
        return Promise.all(promises);
    };

};