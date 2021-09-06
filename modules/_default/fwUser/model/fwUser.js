// eslint-disable-next-line no-unused-vars
module.exports = app => {
    app.model.fwUser.getUserRoles = (pemail, done) => {
        app.dbConnection.execute('BEGIN :ret:=fw_user_get_user_roles(:pemail); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pemail }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
};