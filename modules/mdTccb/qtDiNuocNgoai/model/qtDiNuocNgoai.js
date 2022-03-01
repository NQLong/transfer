// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.qtDiNuocNgoai.foo = () => { };
    app.model.qtDiNuocNgoai.searchPage = (pagenumber, pagesize, list_shcc, list_dv, fromYear, toYear, timeType, tinhTrang, loaiHocVi, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_di_nuoc_ngoai_search_page(:pagenumber, :pagesize, :list_shcc, :list_dv, :fromYear, :toYear, :timeType, :tinhTrang, :loaiHocVi, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, list_shcc, list_dv, fromYear, toYear, timeType, tinhTrang, loaiHocVi, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtDiNuocNgoai.groupPage = (pagenumber, pagesize, list_shcc, list_dv, fromYear, toYear, timeType, tinhTrang, loaiHocVi, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_di_nuoc_ngoai_group_page(:pagenumber, :pagesize, :list_shcc, :list_dv, :fromYear, :toYear, :timeType, :tinhTrang, :loaiHocVi, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, list_shcc, list_dv, fromYear, toYear, timeType, tinhTrang, loaiHocVi, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtDiNuocNgoai.download = (list_shcc, list_dv, fromYear, toYear, timeType, tinhTrang, loaiHocVi, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_di_nuoc_ngoai_download_excel(:list_shcc, :list_dv, :fromYear, :toYear, :timeType, :tinhTrang, :loaiHocVi); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, list_shcc, list_dv, fromYear, toYear, timeType, tinhTrang, loaiHocVi }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
};