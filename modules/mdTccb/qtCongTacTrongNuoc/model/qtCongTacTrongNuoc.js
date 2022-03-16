// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.qtCongTacTrongNuoc.foo = () => { };
    app.model.qtCongTacTrongNuoc.searchPage = (pagenumber, pagesize, listShcc, listDv, fromYear, toYear, timeType, tinhTrang, loaiHocVi, mucDich, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_cong_tac_trong_nuoc_search_page(:pagenumber, :pagesize, :listShcc, :listDv, :fromYear, :toYear, :timeType, :tinhTrang, :loaiHocVi, :mucDich, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, listShcc, listDv, fromYear, toYear, timeType, tinhTrang, loaiHocVi, mucDich, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtCongTacTrongNuoc.groupPage = (pagenumber, pagesize, listShcc, listDv, fromYear, toYear, timeType, tinhTrang, loaiHocVi, mucDich, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_cong_tac_trong_nuoc_group_page(:pagenumber, :pagesize, :listShcc, :listDv, :fromYear, :toYear, :timeType, :tinhTrang, :loaiHocVi, :mucDich, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, listShcc, listDv, fromYear, toYear, timeType, tinhTrang, loaiHocVi, mucDich, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtCongTacTrongNuoc.download = (listShcc, listDv, fromYear, toYear, timeType, tinhTrang, loaiHocVi, mucDich, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_cong_tac_trong_nuoc_download_excel(:listShcc, :listDv, :fromYear, :toYear, :timeType, :tinhTrang, :loaiHocVi, :mucDich); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, listShcc, listDv, fromYear, toYear, timeType, tinhTrang, loaiHocVi, mucDich }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
};