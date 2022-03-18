// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.qtNghiViec.foo = () => { };
    app.model.qtNghiViec.searchPage = (pagenumber, pagesize, listShcc, listDv, fromYear, toYear, dienNghi, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_nghi_viec_search_page(:pagenumber, :pagesize, :listShcc, :listDv, :fromYear, :toYear, :dienNghi, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, listShcc, listDv, fromYear, toYear, dienNghi, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtNghiViec.groupPage = (pagenumber, pagesize, listShcc, listDv, fromYear, toYear, dienNghi, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_nghi_viec_group_page(:pagenumber, :pagesize, :listShcc, :listDv, :fromYear, :toYear, :dienNghi, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, listShcc, listDv, fromYear, toYear, dienNghi, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
};