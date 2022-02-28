// Table name: QT_NGHIEN_CUU_KHOA_HOC { id, tenDeTai, maSoCapQuanLy, kinhPhi, vaiTro, ngayNghiemThu, ketQua, shcc, batDau, ketThuc, batDauType, ketThucType, ngayNghiemThuType, thoiGian, fileMinhChung, inLlkh }
const keys = ['ID'];
const obj2Db = { 'id': 'ID', 'tenDeTai': 'TEN_DE_TAI', 'maSoCapQuanLy': 'MA_SO_CAP_QUAN_LY', 'kinhPhi': 'KINH_PHI', 'vaiTro': 'VAI_TRO', 'ngayNghiemThu': 'NGAY_NGHIEM_THU', 'ketQua': 'KET_QUA', 'shcc': 'SHCC', 'batDau': 'BAT_DAU', 'ketThuc': 'KET_THUC', 'batDauType': 'BAT_DAU_TYPE', 'ketThucType': 'KET_THUC_TYPE', 'ngayNghiemThuType': 'NGAY_NGHIEM_THU_TYPE', 'thoiGian': 'THOI_GIAN', 'fileMinhChung': 'FILE_MINH_CHUNG', 'inLlkh': 'IN_LLKH' };

module.exports = app => {
    app.model.qtNghienCuuKhoaHoc = {
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
                const sql = 'INSERT INTO QT_NGHIEN_CUU_KHOA_HOC (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.dbConnection.execute(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.qtNghienCuuKhoaHoc.get({ rowId: resultSet.lastRowid }, done);
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
            condition = app.dbConnection.buildCondition(obj2Db, condition, ' AND ');
            const parameter = condition.parameter ? condition.parameter : {};
            const sql = 'SELECT ' + app.dbConnection.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT * FROM QT_NGHIEN_CUU_KHOA_HOC' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ') WHERE ROWNUM=1';
            app.dbConnection.execute(sql, parameter, (error, resultSet) => done(error, resultSet && resultSet.rows && resultSet.rows.length ? resultSet.rows[0] : null));
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
            condition = app.dbConnection.buildCondition(obj2Db, condition, ' AND ');
            const parameter = condition.parameter ? condition.parameter : {};
            const sql = 'SELECT ' + app.dbConnection.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM QT_NGHIEN_CUU_KHOA_HOC' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '');
            app.dbConnection.execute(sql, parameter, (error, resultSet) => done(error, resultSet && resultSet.rows ? resultSet.rows : []));
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
            condition = app.dbConnection.buildCondition(obj2Db, condition, ' AND ');
            let leftIndex = (pageNumber <= 1 ? 0 : pageNumber - 1) * pageSize,
                parameter = condition.parameter ? condition.parameter : {};
            const sql_count = 'SELECT COUNT(*) FROM QT_NGHIEN_CUU_KHOA_HOC' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.dbConnection.execute(sql_count, parameter, (err, res) => {
                let result = {};
                let totalItem = res && res.rows && res.rows[0] ? res.rows[0]['COUNT(*)'] : 0;
                result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = Math.max(1, Math.min(pageNumber, result.pageTotal));
                leftIndex = Math.max(0, result.pageNumber - 1) * pageSize;
                const sql = 'SELECT ' + app.dbConnection.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT QT_NGHIEN_CUU_KHOA_HOC.*, ROW_NUMBER() OVER (ORDER BY ' + (orderBy ? orderBy : keys) + ') R FROM QT_NGHIEN_CUU_KHOA_HOC' + (condition.statement ? ' WHERE ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize);
                app.dbConnection.execute(sql, parameter, (error, resultSet) => {
                    result.list = resultSet && resultSet.rows ? resultSet.rows : [];
                    done(error, result);
                });
            });
        },

        update: (condition, changes, done) => {
            condition = app.dbConnection.buildCondition(obj2Db, condition, ' AND ');
            changes = app.dbConnection.buildCondition(obj2Db, changes, ', ', 'NEW_');
            if (changes.statement) {
                const parameter = app.clone(condition.parameter ? condition.parameter : {}, changes.parameter ? changes.parameter : {});
                const sql = 'UPDATE QT_NGHIEN_CUU_KHOA_HOC SET ' + changes.statement + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.dbConnection.execute(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.qtNghienCuuKhoaHoc.get({ rowId: resultSet.lastRowid }, done);
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
            condition = app.dbConnection.buildCondition(obj2Db, condition, ' AND ');
            const parameter = condition.parameter ? condition.parameter : {};
            const sql = 'DELETE FROM QT_NGHIEN_CUU_KHOA_HOC' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.dbConnection.execute(sql, parameter, error => done(error));
        },

        count: (condition, done) => {
            if (done == null) {
                done = condition;
                condition = {};
            }
            condition = app.dbConnection.buildCondition(obj2Db, condition, ' AND ');
            const parameter = condition.parameter ? condition.parameter : {};
            const sql = 'SELECT COUNT(*) FROM QT_NGHIEN_CUU_KHOA_HOC' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.dbConnection.execute(sql, parameter, (error, result) => done(error, result));
        },

        searchPage: (pagenumber, pagesize, searchterm, masocanbo, loaihocvi, fromyear, toyear, timetype, madonvi, done) => {
            app.dbConnection.execute('BEGIN :ret:=qt_nghien_cuu_khoa_hoc_search_page(:pagenumber, :pagesize, :searchterm, :masocanbo, :loaihocvi, :fromyear, :toyear, :timetype, :madonvi, :totalitem, :pagetotal); END;',
                { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, searchterm, masocanbo, loaihocvi, fromyear, toyear, timetype, madonvi, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
        },

        groupPage: (pagenumber, pagesize, searchterm, masocanbo, loaihocvi, fromyear, toyear, timetype, madonvi, done) => {
            app.dbConnection.execute('BEGIN :ret:=qt_nghien_cuu_khoa_hoc_group_page(:pagenumber, :pagesize, :searchterm, :masocanbo, :loaihocvi, :fromyear, :toyear, :timetype, :madonvi, :totalitem, :pagetotal); END;',
                { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, searchterm, masocanbo, loaihocvi, fromyear, toyear, timetype, madonvi, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
        },
        downloadExcel: (masocanbo, loaihocvi, fromyear, toyear, timetype, madonvi, done) => {
            app.dbConnection.execute('BEGIN :ret:=qt_nghien_cuu_khoa_hoc_download_excel(:masocanbo, :loaihocvi, :fromyear, :toyear, :timetype, :madonvi); END;',
                { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, masocanbo, loaihocvi, fromyear, toyear, timetype, madonvi }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
        },

        userPage: (staffemail, done) => {
            app.dbConnection.execute('BEGIN :ret:=qt_nghien_cuu_khoa_hoc_user_page(:staffemail); END;',
                { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, staffemail }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
        },
    };
};