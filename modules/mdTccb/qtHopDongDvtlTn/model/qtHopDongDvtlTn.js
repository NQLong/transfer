// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.qtHopDongDvtlTn.foo = () => { };
    app.model.qtHopDongDvtlTn.searchPage = (pagenumber, pagesize, fromYear, toYear, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_hop_dong_dvtl_tn_search_page(:pagenumber, :pagesize, :fromYear, :toYear, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, fromYear, toYear, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };

    app.model.qtHopDongDvtlTn.groupPage = (pagenumber, pagesize, fromYear, toYear, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_hop_dong_dvtl_tn_group_page(:pagenumber, :pagesize, :fromYear, :toYear, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, fromYear, toYear, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
};