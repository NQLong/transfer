// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.qtKyLuat.foo = () => { };
    app.model.qtKyLuat.searchPage = (pagenumber, pagesize, listShcc, listDv, fromYear, toYear, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_ky_luat_search_page(:pagenumber, :pagesize, :listShcc, :listDv, :fromYear, :toYear, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, listShcc, listDv, fromYear, toYear, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtKyLuat.groupPage = (pagenumber, pagesize, listShcc, listDv, fromYear, toYear, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_ky_luat_group_page(:pagenumber, :pagesize, :listShcc, :listDv, :fromYear, :toYear, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, listShcc, listDv, fromYear, toYear, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtKyLuat.download = (listShcc, listDv, fromYear, toYear, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_ky_luat_download_excel(:listShcc, :listDv, :fromYear, :toYear); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, listShcc, listDv, fromYear, toYear }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
};