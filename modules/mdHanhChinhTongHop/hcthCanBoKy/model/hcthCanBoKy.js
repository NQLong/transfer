// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.hcthCanBoKy.foo = () => { };
    app.model.hcthCanBoKy.createFromList = (listCanBoKy) => {
        const promises = listCanBoKy.map(canBoKy => app.model.hcthCanBoKy.create(canBoKy));
        return Promise.all(promises);
    };
};