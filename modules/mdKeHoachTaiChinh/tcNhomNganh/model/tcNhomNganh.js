// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.tcNhomNganh.foo = () => { };
    app.model.tcNhomNganh.bulkCreate = (items) => {
        return Promise.all(items.map(item => app.model.tcNhomNganh.create(item)));
    };

};