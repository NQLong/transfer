module.exports = app => {
    app.model.fwSubmenu.ganThuTu = (pMa, pThuTu, pIsUp, done) => {
        app.database.oracle.connection.main.execute('BEGIN sub_menu_swap_priority(:pMa, :pThuTu, :pIsUp); END;',
            { pMa, pThuTu, pIsUp }, done);
    };
};