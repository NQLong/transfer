// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.qtBaiVietKhoaHoc.foo = () => { };
    app.model.qtBaiVietKhoaHoc.searchPage = (pagenumber, pagesize, listShcc, listDv, fromYear, toYear, xuatBanRange, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_bai_viet_khoa_hoc_search_page(:pagenumber, :pagesize, :listShcc, :listDv, :fromYear, :toYear, :xuatBanRange, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, listShcc, listDv, fromYear, toYear, xuatBanRange, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtBaiVietKhoaHoc.groupPage = (pagenumber, pagesize, listShcc, listDv, fromYear, toYear, xuatBanRange, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_bai_viet_khoa_hoc_group_page(:pagenumber, :pagesize, :listShcc, :listDv, :fromYear, :toYear, :xuatBanRange, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, listShcc, listDv, fromYear, toYear, xuatBanRange, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtBaiVietKhoaHoc.download = (listShcc, listDv, fromYear, toYear, xuatBanRange, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_bai_viet_khoa_hoc_download_excel(:listShcc, :listDv, :fromYear, :toYear, :xuatBanRange); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, listShcc, listDv, fromYear, toYear, xuatBanRange }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
};