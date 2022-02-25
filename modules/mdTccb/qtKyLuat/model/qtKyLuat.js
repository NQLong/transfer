// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.qtKyLuat.foo = () => { };
    app.model.qtKyLuat.searchPage = (pagenumber, pagesize, list_shcc, list_dv, fromYear, toYear, timeType, tinhTrang, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_ky_luat_search_page(:pagenumber, :pagesize, :list_shcc, :list_dv, :fromYear, :toYear, :timeType, :tinhTrang, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, list_shcc, list_dv, fromYear, toYear, timeType, tinhTrang, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtKyLuat.groupPage = (pagenumber, pagesize, list_shcc, list_dv, fromYear, toYear, timeType, tinhTrang, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_ky_luat_group_page(:pagenumber, :pagesize, :list_shcc, :list_dv, :fromYear, :toYear, :timeType, :tinhTrang, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, list_shcc, list_dv, fromYear, toYear, timeType, tinhTrang, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtKyLuat.download = (list_shcc, list_dv, fromYear, toYear, timeType, tinhTrang, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_ky_luat_download_excel(:list_shcc, :list_dv, :fromYear, :toYear, :timeType, :tinhTrang); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, list_shcc, list_dv, fromYear, toYear, timeType, tinhTrang }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
};