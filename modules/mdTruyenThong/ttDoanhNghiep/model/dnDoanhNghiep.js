// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.dnDoanhNghiep.foo = () => { };
    app.model.dnDoanhNghiep.getLinhVucKinhDoanh = (linhVucKinhDoanh, done) => {
        const sql = 'SELECT TEN FROM DM_LINH_VUC_KINH_DOANH WHERE DM_LINH_VUC_KINH_DOANH.MA IN (' + linhVucKinhDoanh + ')';
        app.dbConnection.execute(sql, (error, resultSet) => done(error, resultSet && resultSet.rows && resultSet.rows.length ? resultSet.rows : null));
    };
};