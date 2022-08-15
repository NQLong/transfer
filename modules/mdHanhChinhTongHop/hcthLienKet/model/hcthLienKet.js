// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.hcthLienKet.foo = () => { };
    app.model.hcthLienKet.createFromList = (listVanBan) => {
        const promises = listVanBan.map(vanBan => app.model.hcthLienKet.create(vanBan));
        return Promise.all(promises);
    };
};