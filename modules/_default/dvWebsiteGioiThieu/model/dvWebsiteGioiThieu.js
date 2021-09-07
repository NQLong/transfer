// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.dvWebsiteGioiThieu.foo = () => { };
    app.model.dvWebsiteGioiThieu.createNewItem = (pMadonvi, pTen, pNoidung, pTrongso, pKichhoat, done) => {
        app.dbConnection.execute('BEGIN :ret:=dv_website_gioi_thieu_create_new_item(:pMadonvi, :pTen, :pNoidung, :pTrongso, :pKichhoat); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pMadonvi, pTen, pNoidung, pTrongso, pKichhoat }, done);
    };

    app.model.dvWebsiteGioiThieu.swapThuTu = (pId, pIsMoveUp, pMadonvi, done) => {
        app.dbConnection.execute('BEGIN dv_website_gioi_thieu_swap_thu_tu(:pId, :pIsMoveUp, :pMadonvi); END;',
            { pId, pIsMoveUp, pMadonvi }, done);
    };
};