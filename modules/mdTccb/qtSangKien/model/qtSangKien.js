// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.qtSangKien.foo = () => { };
    app.model.qtSangKien.searchPage = (pagenumber, pagesize, list_shcc, list_dv, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_sang_kien_search_page(:pagenumber, :pagesize, :list_shcc, :list_dv, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, list_shcc, list_dv, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
};