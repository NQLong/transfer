// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.qtDaoTao.foo = () => { };
    app.model.qtDaoTao.getByShcc = (isShcc, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_dao_tao_get_by_shcc(:isShcc); END;',
        { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, isShcc}, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
};