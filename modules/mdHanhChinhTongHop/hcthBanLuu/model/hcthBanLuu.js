// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.hcthBanLuu.foo = () => { };
    app.model.hcthBanLuu.createFromList = (listDonVi, ma, loai) => {
        const promises = listDonVi.map(donVi => app.model.hcthBanLuu.create({ donVi, ma, loai, }));
        return Promise.all(promises);
    };
};