// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.qtDaoTao.foo = () => { };
    app.model.qtDaoTao.getByShcc = (isShcc, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_dao_tao_get_by_shcc(:isShcc); END;',
        { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, isShcc}, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };

    app.model.qtDaoTao.getTDCT = (iShcc, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_dao_tao_get_trinh_do_chinh_tri_can_bo(:iShcc); END;',
        { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, iShcc}, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };

    app.model.qtDaoTao.getQLNN = (iShcc, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_dao_tao_get_trinh_do_qlnn_can_bo(:iShcc); END;',
        { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, iShcc}, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };

    app.model.qtDaoTao.getTH = (iShcc, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_dao_tao_get_trinh_do_tin_hoc_can_bo(:iShcc); END;',
        { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, iShcc}, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtDaoTao.searchPage = (pagenumber, pagesize, list_shcc, list_dv, fromYear, toYear, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_dao_tao_search_page(:pagenumber, :pagesize, :list_shcc, :list_dv, :fromYear, :toYear, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, list_shcc, list_dv, fromYear, toYear, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
    app.model.qtDaoTao.groupPage = (pagenumber, pagesize, list_shcc, list_dv, fromYear, toYear, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_dao_tao_group_page(:pagenumber, :pagesize, :list_shcc, :list_dv, :fromYear, :toYear, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, list_shcc, list_dv, fromYear, toYear, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
};