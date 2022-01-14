// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.qtNghienCuuKhoaHoc.foo = () => { };
    app.model.qtNghienCuuKhoaHoc.searchPage = (pagenumber, pagesize, searchterm, mdv, filter, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_nckh_search_page(:pagenumber, :pagesize, :searchterm, :totalitem, :pagetotal, :mdv, :filter); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, mdv, filter }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtNghienCuuKhoaHoc.groupPage = (pagenumber, pagesize, searchterm, mdv, filter, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_nckh_group_page(:pagenumber, :pagesize, :searchterm, :totalitem, :pagetotal, :mdv, :filter); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, mdv, filter }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtNghienCuuKhoaHoc.groupPageMa = (pagenumber, pagesize, loaiDoiTuong, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_nckh_group_page_ma(:pagenumber, :pagesize, :loaiDoiTuong, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, loaiDoiTuong, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
};