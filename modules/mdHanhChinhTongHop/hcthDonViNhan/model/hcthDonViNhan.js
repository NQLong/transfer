// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.hcthDonViNhan.foo = () => { };


    app.model.hcthDonViNhan.createFromList = (listDonViNhan, ma, loai) => {
        const promises = listDonViNhan.map(donViNhan => app.model.hcthDonViNhan.create({ donViNhan, ma, loai }));
        return Promise.all(promises);
    };

};