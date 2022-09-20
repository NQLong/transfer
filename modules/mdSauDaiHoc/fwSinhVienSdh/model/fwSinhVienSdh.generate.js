// Table name: FW_SINH_VIEN_SDH { ma, ho, ten, gioiTinh, ngaySinh, danToc, tonGiao, quocTich, nguyenQuanMaTinh, hienTaiSoNha, hienTaiMaXa, hienTaiMaHuyen, hienTaiMaTinh, noiSinhMaTinh, maKhoa, maNganh, thuongTruSoNha, thuongTruMaXa, thuongTruMaHuyen, thuongTruMaTinh, namTuyenSinh, nienKhoa, bacDaoTao, chuongTrinhDaoTao, sdtCaNhan, sdtLienHe, email, coQuan, gvhd, tenDeTai, tinhTrang, heDaoTao, hoTenCha, namSinhCha, ngheNghiepCha, sdtCha, hoTenMe, namSinhMe, ngheNghiepMe, sdtMe, sdtNguoiThan }
const keys = ['MA'];
const obj2Db = { 'ma': 'MA', 'ho': 'HO', 'ten': 'TEN', 'gioiTinh': 'GIOI_TINH', 'ngaySinh': 'NGAY_SINH', 'danToc': 'DAN_TOC', 'tonGiao': 'TON_GIAO', 'quocTich': 'QUOC_TICH', 'nguyenQuanMaTinh': 'NGUYEN_QUAN_MA_TINH', 'hienTaiSoNha': 'HIEN_TAI_SO_NHA', 'hienTaiMaXa': 'HIEN_TAI_MA_XA', 'hienTaiMaHuyen': 'HIEN_TAI_MA_HUYEN', 'hienTaiMaTinh': 'HIEN_TAI_MA_TINH', 'noiSinhMaTinh': 'NOI_SINH_MA_TINH', 'maKhoa': 'MA_KHOA', 'maNganh': 'MA_NGANH', 'thuongTruSoNha': 'THUONG_TRU_SO_NHA', 'thuongTruMaXa': 'THUONG_TRU_MA_XA', 'thuongTruMaHuyen': 'THUONG_TRU_MA_HUYEN', 'thuongTruMaTinh': 'THUONG_TRU_MA_TINH', 'namTuyenSinh': 'NAM_TUYEN_SINH', 'nienKhoa': 'NIEN_KHOA', 'bacDaoTao': 'BAC_DAO_TAO', 'chuongTrinhDaoTao': 'CHUONG_TRINH_DAO_TAO', 'sdtCaNhan': 'SDT_CA_NHAN', 'sdtLienHe': 'SDT_LIEN_HE', 'email': 'EMAIL', 'coQuan': 'CO_QUAN', 'gvhd': 'GVHD', 'tenDeTai': 'TEN_DE_TAI', 'tinhTrang': 'TINH_TRANG', 'heDaoTao': 'HE_DAO_TAO', 'hoTenCha': 'HO_TEN_CHA', 'namSinhCha': 'NAM_SINH_CHA', 'ngheNghiepCha': 'NGHE_NGHIEP_CHA', 'sdtCha': 'SDT_CHA', 'hoTenMe': 'HO_TEN_ME', 'namSinhMe': 'NAM_SINH_ME', 'ngheNghiepMe': 'NGHE_NGHIEP_ME', 'sdtMe': 'SDT_ME', 'sdtNguoiThan': 'SDT_NGUOI_THAN' };

module.exports = app => {
    app.model.fwSinhVienSdh = {
        create: (data, done) => new Promise((resolve, reject) => {
            let statement = '', values = '', parameter = {};
            Object.keys(data).forEach(column => {
                if (obj2Db[column]) {
                    statement += ', ' + obj2Db[column];
                    values += ', :' + column;
                    parameter[column] = data[column];
                }
            });

            if (statement.length == 0) {
                done && done('Data is empty!');
                reject('Data is empty!');
            } else {
                const sql = 'INSERT INTO FW_SINH_VIEN_SDH (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.fwSinhVienSdh.get({ rowId: resultSet.lastRowid }).then(item => {
                            done && done(null, item);
                            resolve(item);
                        }).catch(error => {
                            done && done(error);
                            reject(error);
                        });
                    } else {
                        done && done(error ? error : 'Execute SQL command fail! Sql = ' + sql);
                        reject(error ? error : 'Execute SQL command fail! Sql = ' + sql);
                    }
                });
            }
        }),

        get: (condition, selectedColumns, orderBy, done) => new Promise((resolve, reject) => {
            if (condition == undefined) {
                done = null;
                condition = {};
                selectedColumns = '*';
            } else if (typeof condition == 'function') {
                done = condition;
                condition = {};
                selectedColumns = '*';
            } else if (selectedColumns && typeof selectedColumns == 'function') {
                done = selectedColumns;
                selectedColumns = '*';
            } else {
                selectedColumns = selectedColumns ? selectedColumns : '*';
            }

            if (orderBy) Object.keys(obj2Db).sort((a, b) => b.length - a.length).forEach(key => orderBy = orderBy.replaceAll(key, obj2Db[key]));
            condition = app.database.oracle.buildCondition(obj2Db, condition, ' AND ');
            const parameter = condition.parameter ? condition.parameter : {};
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT * FROM FW_SINH_VIEN_SDH' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ') WHERE ROWNUM=1';
            app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                if (error) {
                    done && done(error);
                    reject(error);
                } else {
                    const item = resultSet && resultSet.rows && resultSet.rows.length ? resultSet.rows[0] : null;
                    done && done(null, item);
                    resolve(item);
                }
            });
        }),

        getAll: (condition, selectedColumns, orderBy, done) => new Promise((resolve, reject) => {
            if (condition == undefined) {
                done = null;
                condition = {};
                selectedColumns = '*';
            } else if (typeof condition == 'function') {
                done = condition;
                condition = {};
                selectedColumns = '*';
            } else if (selectedColumns && typeof selectedColumns == 'function') {
                done = selectedColumns;
                selectedColumns = '*';
            } else {
                selectedColumns = selectedColumns ? selectedColumns : '*';
            }

            if (orderBy) Object.keys(obj2Db).sort((a, b) => b.length - a.length).forEach(key => orderBy = orderBy.replaceAll(key, obj2Db[key]));
            condition = app.database.oracle.buildCondition(obj2Db, condition, ' AND ');
            const parameter = condition.parameter ? condition.parameter : {};
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM FW_SINH_VIEN_SDH' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '');
            app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                if (error) {
                    done && done(error);
                    reject(error);
                } else {
                    const items = resultSet && resultSet.rows ? resultSet.rows : [];
                    done && done(null, items);
                    resolve(items);
                }
            });
        }),

        getPage: (pageNumber, pageSize, condition, selectedColumns, orderBy, done) => new Promise((resolve, reject) => {
            if (condition == undefined) {
                done = null;
                condition = {};
                selectedColumns = '*';
            } else if (typeof condition == 'function') {
                done = condition;
                condition = {};
                selectedColumns = '*';
            } else if (selectedColumns && typeof selectedColumns == 'function') {
                done = selectedColumns;
                selectedColumns = '*';
            } else {
                selectedColumns = selectedColumns ? selectedColumns : '*';
            }

            if (orderBy) Object.keys(obj2Db).sort((a, b) => b.length - a.length).forEach(key => orderBy = orderBy.replaceAll(key, obj2Db[key]));
            condition = app.database.oracle.buildCondition(obj2Db, condition, ' AND ');
            let leftIndex = (pageNumber <= 1 ? 0 : pageNumber - 1) * pageSize,
                parameter = condition.parameter ? condition.parameter : {};
            const sqlCount = 'SELECT COUNT(*) FROM FW_SINH_VIEN_SDH' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.database.oracle.connection.main.executeExtra(sqlCount, parameter, (error, res) => {
                if (error) {
                    done && done(error);
                    reject(error);
                } else {
                    let result = {};
                    let totalItem = res && res.rows && res.rows[0] ? res.rows[0]['COUNT(*)'] : 0;
                    result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                    result.pageNumber = Math.max(1, Math.min(pageNumber, result.pageTotal));
                    leftIndex = Math.max(0, result.pageNumber - 1) * pageSize;
                    const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT FW_SINH_VIEN_SDH.*, ROW_NUMBER() OVER (ORDER BY ' + (orderBy ? orderBy : keys) + ') R FROM FW_SINH_VIEN_SDH' + (condition.statement ? ' WHERE ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize);
                    app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                        if (error) {
                            done && done(error);
                            reject(error);
                        } else {
                            result.list = resultSet && resultSet.rows ? resultSet.rows : [];
                            done && done(null, result);
                            resolve(result);
                        }
                    });
                }
            });
        }),

        update: (condition, changes, done) => new Promise((resolve, reject) => {
            condition = app.database.oracle.buildCondition(obj2Db, condition, ' AND ');
            changes = app.database.oracle.buildCondition(obj2Db, changes, ', ', 'NEW_');
            if (changes.statement) {
                const parameter = app.clone(condition.parameter ? condition.parameter : {}, changes.parameter ? changes.parameter : {});
                const sql = 'UPDATE FW_SINH_VIEN_SDH SET ' + changes.statement + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.fwSinhVienSdh.get({ rowId: resultSet.lastRowid }).then(item => {
                            done && done(null, item);
                            resolve(item);
                        }).catch(error => {
                            done && done(error);
                            reject(error);
                        });
                    } else {
                        done && done(error);
                        reject(error);
                    }
                });
            } else {
                done && done('No changes!');
                reject('No changes!');
            }
        }),

        delete: (condition, done) => new Promise((resolve, reject) => {
            if (condition == undefined) {
                done = null;
                condition = {};
            } else if (typeof condition == 'function') {
                done = condition;
                condition = {};
            }
            condition = app.database.oracle.buildCondition(obj2Db, condition, ' AND ');
            const parameter = condition.parameter ? condition.parameter : {};
            const sql = 'DELETE FROM FW_SINH_VIEN_SDH' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.database.oracle.connection.main.executeExtra(sql, parameter, error => {
                if (error) {
                    done && done(error);
                    reject(error);
                } else {
                    done && done();
                    resolve();
                }
            });
        }),

        count: (condition, done) => new Promise((resolve, reject) => {
            if (condition == undefined) {
                done = null;
                condition = {};
            } else if (typeof condition == 'function') {
                done = condition;
                condition = {};
            }
            condition = app.database.oracle.buildCondition(obj2Db, condition, ' AND ');
            const parameter = condition.parameter ? condition.parameter : {};
            const sql = 'SELECT COUNT(*) FROM FW_SINH_VIEN_SDH' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.database.oracle.connection.main.executeExtra(sql, parameter, (error, result) => {
                if (error) {
                    done && done(error);
                    reject(error);
                } else {
                    done && done(null, result);
                    resolve(result);
                }
            });
        }),

        searchPage: (pagenumber, pagesize, listfaculty, listfromcity, listethnic, listnationality, listreligion, listtinhtrangsinhvien, gender, searchterm, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=fw_sv_sdh_search_page(:pagenumber, :pagesize, :listfaculty, :listfromcity, :listethnic, :listnationality, :listreligion, :listtinhtrangsinhvien, :gender, :searchterm, :totalitem, :pagetotal); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, listfaculty, listfromcity, listethnic, listnationality, listreligion, listtinhtrangsinhvien, gender, searchterm, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),
    };
};