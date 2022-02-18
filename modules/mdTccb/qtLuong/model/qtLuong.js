// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.qtLuong.foo = () => { };
    app.model.qtLuong.searchPage = (pagenumber, pagesize, list_shcc, list_dv, fromYear, toYear, timeType, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_luong_search_page(:pagenumber, :pagesize, :list_shcc, :list_dv, :fromYear, :toYear, :timeType, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, list_shcc, list_dv, fromYear, toYear, timeType, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtLuong.groupPage = (pagenumber, pagesize, list_shcc, list_dv, fromYear, toYear, timeType, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_luong_group_page(:pagenumber, :pagesize, :list_shcc, :list_dv, :fromYear, :toYear, :timeType, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, list_shcc, list_dv, fromYear, toYear, timeType, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
};