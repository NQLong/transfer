// Table name: DT_KHUNG_DAO_TAO { id, namDaoTao, maKhoa, maNganh, tenNganh, trinhDoDaoTao, loaiHinhDaoTao, thoiGianDaoTao, tenVanBang, mucTieuChung, userModified, lastModified }
const keys = ['ID'];
const obj2Db = { 'id': 'ID', 'namDaoTao': 'NAM_DAO_TAO', 'maKhoa': 'MA_KHOA', 'maNganh': 'MA_NGANH', 'tenNganh': 'TEN_NGANH', 'trinhDoDaoTao': 'TRINH_DO_DAO_TAO', 'loaiHinhDaoTao': 'LOAI_HINH_DAO_TAO', 'thoiGianDaoTao': 'THOI_GIAN_DAO_TAO', 'tenVanBang': 'TEN_VAN_BANG', 'mucTieuChung': 'MUC_TIEU_CHUNG', 'userModified': 'USER_MODIFIED', 'lastModified': 'LAST_MODIFIED' };

module.exports = app => {
    app.model.dtKhungDaoTao = {
        create: (data, done) => {
            let statement = '', values = '', parameter = {};
            Object.keys(data).forEach(column => {
                if (obj2Db[column]) {
                    statement += ', ' + obj2Db[column];
                    values += ', :' + column;
                    parameter[column] = data[column];
                }
            });

            if (statement.length == 0) {
                done('Data is empty!');
            } else {
                const sql = 'INSERT INTO DT_KHUNG_DAO_TAO (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.database.oracle.connection.main.execute(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.dtKhungDaoTao.get({ rowId: resultSet.lastRowid }, done);
                    } else {
                        done(error ? error : 'Execute SQL command fail! Sql = ' + sql);
                    }
                });
            }
        },

        get: (condition, selectedColumns, orderBy, done) => {
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT * FROM DT_KHUNG_DAO_TAO' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ') WHERE ROWNUM=1';
            app.database.oracle.connection.main.execute(sql, parameter, (error, resultSet) => done(error, resultSet && resultSet.rows && resultSet.rows.length ? resultSet.rows[0] : null));
        },

        getAll: (condition, selectedColumns, orderBy, done) => {
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM DT_KHUNG_DAO_TAO' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '');
            app.database.oracle.connection.main.execute(sql, parameter, (error, resultSet) => done(error, resultSet && resultSet.rows ? resultSet.rows : []));
        },

        getPage: (pageNumber, pageSize, condition, selectedColumns, orderBy, done) => {
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
            let leftIndex = (pageNumber <= 1 ? 0 : pageNumber - 1) * pageSize,
                parameter = condition.parameter ? condition.parameter : {};
            const sql_count = 'SELECT COUNT(*) FROM DT_KHUNG_DAO_TAO' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.database.oracle.connection.main.execute(sql_count, parameter, (err, res) => {
                let result = {};
                let totalItem = res && res.rows && res.rows[0] ? res.rows[0]['COUNT(*)'] : 0;
                result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = Math.max(1, Math.min(pageNumber, result.pageTotal));
                leftIndex = Math.max(0, result.pageNumber - 1) * pageSize;
                const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT DT_KHUNG_DAO_TAO.*, ROW_NUMBER() OVER (ORDER BY ' + (orderBy ? orderBy : keys) + ') R FROM DT_KHUNG_DAO_TAO' + (condition.statement ? ' WHERE ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize);
                app.database.oracle.connection.main.execute(sql, parameter, (error, resultSet) => {
                    result.list = resultSet && resultSet.rows ? resultSet.rows : [];
                    done(error, result);
                });
            });
        },

        update: (condition, changes, done) => {
            condition = app.database.oracle.buildCondition(obj2Db, condition, ' AND ');
            changes = app.database.oracle.buildCondition(obj2Db, changes, ', ', 'NEW_');
            if (changes.statement) {
                const parameter = app.clone(condition.parameter ? condition.parameter : {}, changes.parameter ? changes.parameter : {});
                const sql = 'UPDATE DT_KHUNG_DAO_TAO SET ' + changes.statement + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.database.oracle.connection.main.execute(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.dtKhungDaoTao.get({ rowId: resultSet.lastRowid }, done);
                    } else {
                        done(error);
                    }
                });
            } else {
                done('No changes!');
            }
        },

        delete: (condition, done) => {
            if (done == null) {
                done = condition;
                condition = {};
            }
            condition = app.database.oracle.buildCondition(obj2Db, condition, ' AND ');
            const parameter = condition.parameter ? condition.parameter : {};
            const sql = 'DELETE FROM DT_KHUNG_DAO_TAO' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.database.oracle.connection.main.execute(sql, parameter, error => done(error));
        },

        count: (condition, done) => {
            if (done == null) {
                done = condition;
                condition = {};
            }
            condition = app.database.oracle.buildCondition(obj2Db, condition, ' AND ');
            const parameter = condition.parameter ? condition.parameter : {};
            const sql = 'SELECT COUNT(*) FROM DT_KHUNG_DAO_TAO' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.database.oracle.connection.main.execute(sql, parameter, (error, result) => done(error, result));
        },

        searchPage: (pagenumber, pagesize, donvi, searchterm, done) => {
            app.database.oracle.connection.main.execute('BEGIN :ret:=dt_khung_dao_tao_search_page(:pagenumber, :pagesize, :donvi, :searchterm, :totalitem, :pagetotal); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, donvi, searchterm, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, done));
        },
    };
};