// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.qtBaoHiemXaHoi.foo = () => { };
    app.model.qtBaoHiemXaHoi.searchPage = (pagenumber, pagesize, listShcc, listDv, fromYear, toYear, timeType, tinhTrang, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_bao_hiem_xa_hoi_search_page(:pagenumber, :pagesize, :listShcc, :listDv, :fromYear, :toYear, :timeType, :tinhTrang, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, listShcc, listDv, fromYear, toYear, timeType, tinhTrang, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtBaoHiemXaHoi.groupPage = (pagenumber, pagesize, listShcc, listDv, fromYear, toYear, timeType, tinhTrang, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_bao_hiem_xa_hoi_group_page(:pagenumber, :pagesize, :listShcc, :listDv, :fromYear, :toYear, :timeType, :tinhTrang, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, listShcc, listDv, fromYear, toYear, timeType, tinhTrang, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtBaoHiemXaHoi.download = (listShcc, listDv, fromYear, toYear, timeType, tinhTrang, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_bao_hiem_xa_hoi_download_excel(:listShcc, :listDv, :fromYear, :toYear, :timeType, :tinhTrang); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, listShcc, listDv, fromYear, toYear, timeType, tinhTrang }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
};