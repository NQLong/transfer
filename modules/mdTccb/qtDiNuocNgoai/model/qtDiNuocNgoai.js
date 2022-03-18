// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.qtDiNuocNgoai.foo = () => { };
    app.model.qtDiNuocNgoai.searchPage = (pagenumber, pagesize, listShcc, listDv, fromYear, toYear, timeType, tinhTrang, loaiHocVi, mucDich, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_di_nuoc_ngoai_search_page(:pagenumber, :pagesize, :listShcc, :listDv, :fromYear, :toYear, :timeType, :tinhTrang, :loaiHocVi, :mucDich, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, listShcc, listDv, fromYear, toYear, timeType, tinhTrang, loaiHocVi, mucDich, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtDiNuocNgoai.groupPage = (pagenumber, pagesize, listShcc, listDv, fromYear, toYear, timeType, tinhTrang, loaiHocVi, mucDich, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_di_nuoc_ngoai_group_page(:pagenumber, :pagesize, :listShcc, :listDv, :fromYear, :toYear, :timeType, :tinhTrang, :loaiHocVi, :mucDich, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, listShcc, listDv, fromYear, toYear, timeType, tinhTrang, loaiHocVi, mucDich, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtDiNuocNgoai.download = (listShcc, listDv, fromYear, toYear, timeType, tinhTrang, loaiHocVi, mucDich, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_di_nuoc_ngoai_download_excel(:listShcc, :listDv, :fromYear, :toYear, :timeType, :tinhTrang, :loaiHocVi, :mucDich); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, listShcc, listDv, fromYear, toYear, timeType, tinhTrang, loaiHocVi, mucDich }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
};