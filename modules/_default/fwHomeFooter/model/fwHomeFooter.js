module.exports = app => {
    app.model.fwHomeFooter.ganThuTu = (pMa, pThuTu, pIsUp, done) => {
        app.database.oracle.connection.main.execute('BEGIN home_footer_swap_priority(:pMa, :pThuTu, :pIsUp); END;',
            { pMa, pThuTu, pIsUp }, done);
    };
};