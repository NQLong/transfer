// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.qtDaoTao.foo = () => { };
    app.model.qtDaoTao.getByShcc = (isShcc, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_dao_tao_get_by_shcc(:isShcc); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, isShcc }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };

    app.model.qtDaoTao.getTDCT = (iShcc, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_dao_tao_get_trinh_do_chinh_tri_can_bo(:iShcc); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, iShcc }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };

    app.model.qtDaoTao.getQLNN = (iShcc, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_dao_tao_get_trinh_do_qlnn_can_bo(:iShcc); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, iShcc }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };

    app.model.qtDaoTao.getTH = (iShcc, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_dao_tao_get_trinh_do_tin_hoc_can_bo(:iShcc); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, iShcc }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };

    app.model.qtDaoTao.getHV = (iShcc, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_dao_tao_get_hoc_vi_can_bo(:iShcc); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, iShcc }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };

    app.model.qtDaoTao.getCC = (iShcc, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_dao_tao_get_cc_can_bo(:iShcc); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, iShcc }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };

    app.model.qtDaoTao.searchPage = (pagenumber, pagesize, listShcc, listDv, fromYear, toYear, listLoaiBang, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_dao_tao_search_page(:pagenumber, :pagesize, :listShcc, :listDv, :fromYear, :toYear, :listLoaiBang, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, listShcc, listDv, fromYear, toYear, listLoaiBang, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };

    app.model.qtDaoTao.groupPage = (pagenumber, pagesize, listShcc, listDv, fromYear, toYear, searchterm, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_dao_tao_group_page(:pagenumber, :pagesize, :listShcc, :listDv, :fromYear, :toYear, :searchterm, :totalitem, :pagetotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, listShcc, listDv, fromYear, toYear, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };

    app.model.qtDaoTao.getCurrentOfStaff = (iShcc, iTime, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_dao_tao_get_current_of_staff(:iShcc, :iTime); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, iShcc, iTime }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };

    app.model.qtDaoTao.download = (listShcc, listDv, fromYear, toYear, listLoaiBang, done) => {
        app.dbConnection.execute('BEGIN :ret:=qt_dao_tao_download_excel(:listShcc, :listDv, :fromYear, :toYear, :listLoaiBang); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, listShcc, listDv, fromYear, toYear, listLoaiBang }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
};