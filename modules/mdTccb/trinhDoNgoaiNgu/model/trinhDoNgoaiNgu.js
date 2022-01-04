// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.trinhDoNgoaiNgu.foo = () => { };
    app.model.trinhDoNgoaiNgu.getTrinhDoNNByShcc = (isShcc, done) => {
        app.dbConnection.execute('BEGIN :ret:=trinh_do_ngoai_ngu_by_shcc(:isShcc); END;',
        { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, isShcc}, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
};