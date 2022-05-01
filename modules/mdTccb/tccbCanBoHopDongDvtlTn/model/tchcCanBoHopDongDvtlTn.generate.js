// Table name: TCHC_CAN_BO_HOP_DONG_DVTL_TN { shcc, email, gioiTinh, ho, ten, quocGia, danToc, tonGiao, ngaySinh, noiSinhMaTinh, nguyenQuanMaTinh, cuTruMaTinh, cuTruMaHuyen, cuTruMaXa, cuTruSoNha, thuongTruMaTinh, thuongTruMaHuyen, thuongTruMaXa, thuongTruSoNha, hocVanTrinhDo, hocVanChuyenNganh, khoaHocChucDanh, khoaHocChuyenNganh, cmnd, cmndNgayCap, cmndNoiCap, hopDongCanBo, hopDongCanBoNgay, dienThoai }
const keys = ['SHCC'];
const obj2Db = { 'shcc': 'SHCC', 'email': 'EMAIL', 'gioiTinh': 'GIOI_TINH', 'ho': 'HO', 'ten': 'TEN', 'quocGia': 'QUOC_GIA', 'danToc': 'DAN_TOC', 'tonGiao': 'TON_GIAO', 'ngaySinh': 'NGAY_SINH', 'noiSinhMaTinh': 'NOI_SINH_MA_TINH', 'nguyenQuanMaTinh': 'NGUYEN_QUAN_MA_TINH', 'cuTruMaTinh': 'CU_TRU_MA_TINH', 'cuTruMaHuyen': 'CU_TRU_MA_HUYEN', 'cuTruMaXa': 'CU_TRU_MA_XA', 'cuTruSoNha': 'CU_TRU_SO_NHA', 'thuongTruMaTinh': 'THUONG_TRU_MA_TINH', 'thuongTruMaHuyen': 'THUONG_TRU_MA_HUYEN', 'thuongTruMaXa': 'THUONG_TRU_MA_XA', 'thuongTruSoNha': 'THUONG_TRU_SO_NHA', 'hocVanTrinhDo': 'HOC_VAN_TRINH_DO', 'hocVanChuyenNganh': 'HOC_VAN_CHUYEN_NGANH', 'khoaHocChucDanh': 'KHOA_HOC_CHUC_DANH', 'khoaHocChuyenNganh': 'KHOA_HOC_CHUYEN_NGANH', 'cmnd': 'CMND', 'cmndNgayCap': 'CMND_NGAY_CAP', 'cmndNoiCap': 'CMND_NOI_CAP', 'hopDongCanBo': 'HOP_DONG_CAN_BO', 'hopDongCanBoNgay': 'HOP_DONG_CAN_BO_NGAY', 'dienThoai': 'DIEN_THOAI' };

module.exports = app => {
    app.model.tchcCanBoHopDongDvtlTn = {
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
                const sql = 'INSERT INTO TCHC_CAN_BO_HOP_DONG_DVTL_TN (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.database.oracle.connection.main.execute(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.tchcCanBoHopDongDvtlTn.get({ rowId: resultSet.lastRowid }, done);
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT * FROM TCHC_CAN_BO_HOP_DONG_DVTL_TN' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ') WHERE ROWNUM=1';
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM TCHC_CAN_BO_HOP_DONG_DVTL_TN' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '');
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
            const sql_count = 'SELECT COUNT(*) FROM TCHC_CAN_BO_HOP_DONG_DVTL_TN' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.database.oracle.connection.main.execute(sql_count, parameter, (error, res) => {
                if (error) {
                    done(error);
                } else {
                    let result = {};
                    let totalItem = res && res.rows && res.rows[0] ? res.rows[0]['COUNT(*)'] : 0;
                    result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                    result.pageNumber = Math.max(1, Math.min(pageNumber, result.pageTotal));
                    leftIndex = Math.max(0, result.pageNumber - 1) * pageSize;
                    const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT TCHC_CAN_BO_HOP_DONG_DVTL_TN.*, ROW_NUMBER() OVER (ORDER BY ' + (orderBy ? orderBy : keys) + ') R FROM TCHC_CAN_BO_HOP_DONG_DVTL_TN' + (condition.statement ? ' WHERE ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize);
                    app.database.oracle.connection.main.execute(sql, parameter, (error, resultSet) => {
                        result.list = resultSet && resultSet.rows ? resultSet.rows : [];
                        done(error, result);
                    });
                }
            });
        },

        update: (condition, changes, done) => {
            condition = app.database.oracle.buildCondition(obj2Db, condition, ' AND ');
            changes = app.database.oracle.buildCondition(obj2Db, changes, ', ', 'NEW_');
            if (changes.statement) {
                const parameter = app.clone(condition.parameter ? condition.parameter : {}, changes.parameter ? changes.parameter : {});
                const sql = 'UPDATE TCHC_CAN_BO_HOP_DONG_DVTL_TN SET ' + changes.statement + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.database.oracle.connection.main.execute(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.tchcCanBoHopDongDvtlTn.get({ rowId: resultSet.lastRowid }, done);
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
            const sql = 'DELETE FROM TCHC_CAN_BO_HOP_DONG_DVTL_TN' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.database.oracle.connection.main.execute(sql, parameter, error => done(error));
        },

        count: (condition, done) => {
            if (done == null) {
                done = condition;
                condition = {};
            }
            condition = app.database.oracle.buildCondition(obj2Db, condition, ' AND ');
            const parameter = condition.parameter ? condition.parameter : {};
            const sql = 'SELECT COUNT(*) FROM TCHC_CAN_BO_HOP_DONG_DVTL_TN' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.database.oracle.connection.main.execute(sql, parameter, (error, result) => done(error, result));
        },
    };
};