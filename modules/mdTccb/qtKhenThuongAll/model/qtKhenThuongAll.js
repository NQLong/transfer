// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.qtKhenThuongAll.foo = () => { };
    app.model.qtKhenThuongAll.downloadExcel = (pagenumber, pagesize, loaiDoiTuong, maDoiTuong, done) => {
        app.dbConnection.execute('BEGIN :ret:=download_excel_qt_khen_thuong_all(:pagenumber, :pagesize, :loaiDoiTuong, :maDoiTuong, :totalitem, :pagetotal); END;',
                { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, loaiDoiTuong, maDoiTuong, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };

    app.model.qtKhenThuongAll.getByShcc = (isShcc, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_khen_thuong_all_by_shcc(:isShcc); END;',
        { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, isShcc}, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtKhenThuongAll.searchPage = (pagenumber, pagesize, loaidoituong, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_khen_thuong_all_search_page(:pagenumber, :pagesize, :loaidoituong, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, loaidoituong, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtKhenThuongAll.groupPage = (pagenumber, pagesize, loaidoituong, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_khen_thuong_all_group_page(:pagenumber, :pagesize, :loaidoituong, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, loaidoituong, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtKhenThuongAll.groupPageMa = (pagenumber, pagesize, loaiDoiTuong, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_khen_thuong_all_group_page_ma(:pagenumber, :pagesize, :loaiDoiTuong, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, loaiDoiTuong, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
};