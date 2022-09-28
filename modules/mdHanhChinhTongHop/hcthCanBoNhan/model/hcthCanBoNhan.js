// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.hcthCanBoNhan.foo = () => { };
    app.model.hcthCanBoNhan.listCreate = (list) => {
        const promises = list.map(canBoNhan => app.model.hcthCanBoNhan.create(canBoNhan));
        return Promise.all(promises);
    };
};