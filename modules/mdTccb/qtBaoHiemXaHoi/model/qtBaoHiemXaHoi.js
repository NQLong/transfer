// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.qtBaoHiemXaHoi.foo = () => { };
    app.model.qtBaoHiemXaHoi.getByShcc = (isShcc, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_bao_hiem_xa_hoi_get_by_shcc(:isShcc); END;',
        { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, isShcc}, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
};