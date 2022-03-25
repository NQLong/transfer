// eslint-disable-next-line no-unused-vars
module.exports = app => {
    app.model.fwUser.getUserRoles = (pemail, done) => {
        app.database.oracle.connection.main.execute('BEGIN :ret:=fw_user_get_user_roles(:pemail); END;',
            { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pemail }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, done));
    };
};