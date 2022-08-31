// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.tccbNhomDanhGiaNhiemVu.foo = () => { };
    app.model.tccbNhomDanhGiaNhiemVu.updateThuTu = (pId, pThuTu, pIsUp, pNam, done) => new Promise((resolve, reject) => {
        app.database.oracle.connection.main.execute('BEGIN tccb_nhom_danh_gia_nhiem_vu_gan_thu_tu(:pId, :pThuTu, :pIsUp, :pNam); END;',
            { pId, pThuTu, pIsUp, pNam }, (error, result) => {
                if (error) {
                    done && done(error);
                    reject(error);
                } else {
                    done && done(null, result);
                    resolve(result);
                }
            });
    });
};