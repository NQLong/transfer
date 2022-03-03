// eslint-disable-next-line no-unused-vars
module.exports = app => {
    app.model.qtChucVu.searchPage = (pagenumber, pagesize, list_shcc, list_dv, fromYear, toYear, timeType, list_cv, gioiTinh, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_chuc_vu_search_page(:pagenumber, :pagesize, :list_shcc, :list_dv, :fromYear, :toYear, :timeType, :list_cv, :gioiTinh, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, list_shcc, list_dv, fromYear, toYear, timeType, list_cv, gioiTinh, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtChucVu.groupPage = (pagenumber, pagesize, list_shcc, list_dv, fromYear, toYear, timeType, list_cv, gioiTinh, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_chuc_vu_group_page(:pagenumber, :pagesize, :list_shcc, :list_dv, :fromYear, :toYear, :timeType, :list_cv, :gioiTinh, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, list_shcc, list_dv, fromYear, toYear, timeType, list_cv, gioiTinh, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtChucVu.getByShcc = (isShcc, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_chuc_vu_get_by_shcc(:isShcc); END;',
        { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, isShcc}, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtChucVu.download = (list_shcc, list_dv, fromYear, toYear, timeType, list_cv, gioiTinh, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_chuc_vu_download_excel(:list_shcc, :list_dv, :fromYear, :toYear, :timeType, :list_cv, :gioiTinh); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, list_shcc, list_dv, fromYear, toYear, timeType, list_cv, gioiTinh }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
};