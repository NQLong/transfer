// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.qtNghienCuuKhoaHoc.foo = () => { };
    app.model.qtNghienCuuKhoaHoc.searchPage = (pagenumber, pagesize, searchterm, mscb, filter, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_nckh_search_page(:pagenumber, :pagesize, :searchterm, :totalitem, :pagetotal, :mscb, :filter); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, mscb, filter }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };

    app.model.qtNghienCuuKhoaHoc.downloadExcel = (filter, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_nckh_download_excel(:filter); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, filter }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };

    app.model.qtNghienCuuKhoaHoc.groupPage = (pagenumber, pagesize, searchterm, mscb, filter, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_nckh_group_page(:pagenumber, :pagesize, :searchterm, :totalitem, :pagetotal, :mscb, :filter); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, mscb, filter }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };

    app.model.qtNghienCuuKhoaHoc.userPage = (staffEmail, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_nghien_cuu_khoa_hoc_user_page(:staffEmail); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, staffEmail }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
};