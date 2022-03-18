// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.qtNghiPhep.foo = () => { };
    app.model.qtNghiPhep.searchPage = (pagenumber, pagesize, listShcc, listDv, fromYear, toYear, tinhTrang, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_nghi_phep_search_page(:pagenumber, :pagesize, :listShcc, :listDv, :fromYear, :toYear, :tinhTrang, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, listShcc, listDv, fromYear, toYear, tinhTrang, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtNghiPhep.groupPage = (pagenumber, pagesize, listShcc, listDv, fromYear, toYear, tinhTrang, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_nghi_phep_group_page(:pagenumber, :pagesize, :listShcc, :listDv, :fromYear, :toYear, :tinhTrang, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, listShcc, listDv, fromYear, toYear, tinhTrang, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
};