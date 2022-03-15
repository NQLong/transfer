// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.qtHuongDanLuanVan.foo = () => { };
    app.model.qtHuongDanLuanVan.searchPage = (pagenumber, pagesize, listShcc, listDv, fromYear, toYear, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_huong_dan_luan_van_search_page(:pagenumber, :pagesize, :listShcc, :listDv, :fromYear, :toYear, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, listShcc, listDv, fromYear, toYear, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtHuongDanLuanVan.groupPage = (pagenumber, pagesize, listShcc, listDv, fromYear, toYear, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_huong_dan_luan_van_group_page(:pagenumber, :pagesize, :listShcc, :listDv, :fromYear, :toYear, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, listShcc, listDv, fromYear, toYear, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
};