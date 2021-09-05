module.exports = app => {
    //  app.model.fwRole.foo = () => { };
    app.model.fwRole.getActivedRoles = done => {
        app.model.fwRole.getAll({ active: 1 }, (error, roles) => {
            if (error == null && roles) {
                app.data.roles = roles;
                done && done();
            }
        });
    };
};