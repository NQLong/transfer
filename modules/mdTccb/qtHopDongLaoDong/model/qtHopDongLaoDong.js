// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.qtHopDongLaoDong.foo = () => { };
    app.model.qtHopDongLaoDong.downloadExcel = (pagenumber, pagesize, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=download_excel_qt_hop_dong_lao_dong(:pagenumber, :pagesize, :searchterm, :totalitem, :pagetotal); END;',
                { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };

};