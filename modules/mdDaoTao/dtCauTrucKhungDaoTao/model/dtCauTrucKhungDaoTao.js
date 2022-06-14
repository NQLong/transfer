const obj2Db = { 'id': 'ID', 'mucCon': 'MUC_CON', 'namDaoTao': 'NAM_DAO_TAO', 'mucCha': 'MUC_CHA', 'batDauDangKy': 'BAT_DAU_DANG_KY', 'ketThucDangKy': 'KET_THUC_DANG_KY', 'khoa': 'KHOA' };

// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.dtCauTrucKhungDaoTao.foo = () => { };
    app.model.dtCauTrucKhungDaoTao.getLastestYear = () => new Promise((resolve, reject) => {
        try {
            app.model.dtCauTrucKhungDaoTao.get({}, 'id,khoa', null, (error, item) => {
                if (error) throw (error);
                else resolve(item);
            });
        } catch (error) {
            reject(error);
        }
    });

    app.model.dtCauTrucKhungDaoTao.getAllNamDaoTao = (condition, selectedColumns, orderBy, done) => {
        if (typeof condition == 'function') {
            done = condition;
            condition = {};
            selectedColumns = '*';
        } else if (selectedColumns && typeof selectedColumns == 'function') {
            done = selectedColumns;
            selectedColumns = '*';
        }

        if (orderBy) Object.keys(obj2Db).sort((a, b) => b.length - a.length).forEach(key => orderBy = orderBy.replaceAll(key, obj2Db[key]));
        condition = app.database.oracle.buildCondition(obj2Db, condition, ' AND ');
        const parameter = condition.parameter ? condition.parameter : {};
        const sql = 'SELECT DISTINCT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM DT_CAU_TRUC_KHUNG_DAO_TAO' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '');
        app.database.oracle.connection.main.execute(sql, parameter, (error, resultSet) => done(error, resultSet && resultSet.rows ? resultSet.rows : []));
 };
};