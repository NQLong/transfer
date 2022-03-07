// Table name: DN_DOANH_NGHIEP { id, quocGia, tenVietTat, tenDayDu, linhVucKinhDoanh, moTa, kichHoat, namThanhLap, theManh, diaChi, email, phone, image, ownerEmail, capDo, doiTac, quocGiaTemp, tenVietTatTemp, moTaTemp, namThanhLapTemp, theManhTemp, diaChiTemp, emailTemp, phoneTemp, imageTemp, confirm, hiddenShortName, tenDayDuTemp, linhVucKinhDoanhTemp, website, websiteTemp }
const keys = ['ID'];
const obj2Db = { 'id': 'ID', 'quocGia': 'QUOC_GIA', 'tenVietTat': 'TEN_VIET_TAT', 'tenDayDu': 'TEN_DAY_DU', 'linhVucKinhDoanh': 'LINH_VUC_KINH_DOANH', 'moTa': 'MO_TA', 'kichHoat': 'KICH_HOAT', 'namThanhLap': 'NAM_THANH_LAP', 'theManh': 'THE_MANH', 'diaChi': 'DIA_CHI', 'email': 'EMAIL', 'phone': 'PHONE', 'image': 'IMAGE', 'ownerEmail': 'OWNER_EMAIL', 'capDo': 'CAP_DO', 'doiTac': 'DOI_TAC', 'quocGiaTemp': 'QUOC_GIA_TEMP', 'tenVietTatTemp': 'TEN_VIET_TAT_TEMP', 'moTaTemp': 'MO_TA_TEMP', 'namThanhLapTemp': 'NAM_THANH_LAP_TEMP', 'theManhTemp': 'THE_MANH_TEMP', 'diaChiTemp': 'DIA_CHI_TEMP', 'emailTemp': 'EMAIL_TEMP', 'phoneTemp': 'PHONE_TEMP', 'imageTemp': 'IMAGE_TEMP', 'confirm': 'CONFIRM', 'hiddenShortName': 'HIDDEN_SHORT_NAME', 'tenDayDuTemp': 'TEN_DAY_DU_TEMP', 'linhVucKinhDoanhTemp': 'LINH_VUC_KINH_DOANH_TEMP', 'website': 'WEBSITE', 'websiteTemp': 'WEBSITE_TEMP' };

module.exports = app => {
    app.model.dnDoanhNghiep = {
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
                const sql = 'INSERT INTO DN_DOANH_NGHIEP (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.dbConnection.execute(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.dnDoanhNghiep.get({ rowId: resultSet.lastRowid }, done);
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
            const sql = 'SELECT ' + app.dbConnection.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT * FROM DN_DOANH_NGHIEP' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ') WHERE ROWNUM=1';
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
            const sql = 'SELECT ' + app.dbConnection.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM DN_DOANH_NGHIEP' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '');
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
            const sql_count = 'SELECT COUNT(*) FROM DN_DOANH_NGHIEP' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.dbConnection.execute(sql_count, parameter, (err, res) => {
                let result = {};
                let totalItem = res && res.rows && res.rows[0] ? res.rows[0]['COUNT(*)'] : 0;
                result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = Math.max(1, Math.min(pageNumber, result.pageTotal));
                leftIndex = Math.max(0, result.pageNumber - 1) * pageSize;
                const sql = 'SELECT ' + app.dbConnection.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT DN_DOANH_NGHIEP.*, ROW_NUMBER() OVER (ORDER BY ' + (orderBy ? orderBy : keys) + ') R FROM DN_DOANH_NGHIEP' + (condition.statement ? ' WHERE ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize);
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
                const sql = 'UPDATE DN_DOANH_NGHIEP SET ' + changes.statement + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.dbConnection.execute(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.dnDoanhNghiep.get({ rowId: resultSet.lastRowid }, done);
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
            const sql = 'DELETE FROM DN_DOANH_NGHIEP' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.dbConnection.execute(sql, parameter, error => done(error));
        },

        count: (condition, done) => {
            if (done == null) {
                done = condition;
                condition = {};
            }
            condition = app.dbConnection.buildCondition(obj2Db, condition, ' AND ');
            const parameter = condition.parameter ? condition.parameter : {};
            const sql = 'SELECT COUNT(*) FROM DN_DOANH_NGHIEP' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.dbConnection.execute(sql, parameter, (error, result) => done(error, result));
        },

        searchPage: (pagenumber, pagesize, searchterm, done) => {
            app.dbConnection.execute('BEGIN :ret:=dn_doanh_nghiep_search_page(:pagenumber, :pagesize, :searchterm, :totalitem, :pagetotal); END;',
                { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pagenumber: { val: pagenumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pagesize: { val: pagesize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, searchterm, totalitem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pagetotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
        },

        searchAll: (loaidoanhnghiep, kichhoat, searchterm, done) => {
            app.dbConnection.execute('BEGIN :ret:=dn_doanh_nghiep_search_all(:loaidoanhnghiep, :kichhoat, :searchterm); END;',
                { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, loaidoanhnghiep, kichhoat, searchterm }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
        },
    };
};