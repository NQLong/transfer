// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.qtBaoHiemXaHoi.foo = () => { };
    app.model.qtBaoHiemXaHoi.getByShcc = (isShcc, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_bao_hiem_xa_hoi_get_by_shcc(:isShcc); END;',
        { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, isShcc}, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtBaoHiemXaHoi.searchPage = (pagenumber, pagesize, list_shcc, list_dv, fromYear, toYear, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_bao_hiem_xa_hoi_search_page(:pagenumber, :pagesize, :list_shcc, :list_dv, :fromYear, :toYear, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, list_shcc, list_dv, fromYear, toYear, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtBaoHiemXaHoi.groupPage = (pagenumber, pagesize, list_shcc, list_dv, fromYear, toYear, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_bao_hiem_xa_hoi_group_page(:pagenumber, :pagesize, :list_shcc, :list_dv, :fromYear, :toYear, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, list_shcc, list_dv, fromYear, toYear, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
};