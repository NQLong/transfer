// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.tcHocPhi.foo = () => { };
    app.model.tcHocPhi.insertAndUpdate = (datas, done) => {
        const options = {
            autoCommit: true,
            batchErrors: true
        };
        const sql = `MERGE INTO TC_HOC_PHI USING DUAL ON (MSSV=:mssv AND NAM_HOC=:namHoc AND HOC_KY=:hocKy)
                WHEN MATCHED THEN UPDATE SET HOC_PHI=:hocPhi, CONG_NO=:congNo, NGAY_TAO=:ngayTao
                WHEN NOT MATCHED THEN INSERT (HOC_KY, MSSV, NAM_HOC, HOC_PHI, CONG_NO, NGAY_TAO) VALUES (:hocKy, :mssv, :namHoc, :hocPhi, :congNo, :ngayTao)`;

        app.database.oracle.connection.main.executeMany(sql, datas, options, (err, result) => {
            done(err, result);
        });
    };
};