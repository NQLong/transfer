// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.qtKhenThuongAll.foo = () => { };
    app.model.qtKhenThuongAll.searchPage = (pagenumber, pagesize, loaidoituong, fromYear, toYear, list_dv, list_shcc, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_khen_thuong_all_search_page(:pagenumber, :pagesize, :loaidoituong, :fromYear, :toYear, :list_dv, :list_shcc, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, loaidoituong, fromYear, toYear, list_dv, list_shcc, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtKhenThuongAll.groupPage = (pagenumber, pagesize, loaidoituong, fromYear, toYear, list_dv, list_shcc, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_khen_thuong_all_group_page(:pagenumber, :pagesize, :loaidoituong, :fromYear, :toYear, :list_dv, :list_shcc, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, loaidoituong, fromYear, toYear, list_dv, list_shcc, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtKhenThuongAll.download = (loaidoituong, fromYear, toYear, list_dv, list_shcc, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_khen_thuong_all_download_excel(:loaidoituong, :fromYear, :toYear, :list_dv, :list_shcc); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, loaidoituong, fromYear, toYear, list_dv, list_shcc }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
};