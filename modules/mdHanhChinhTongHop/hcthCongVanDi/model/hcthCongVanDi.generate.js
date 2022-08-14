// Table name: HCTH_CONG_VAN_DI { id, trichYeu, ngayGui, ngayKy, donViGui, canBoNhan, loaiVanBan, tenVietTatDonViGui, trangThai, soCongVan, soDi, loaiCongVan, ngayTao, laySoTuDong, nguoiTao, ngoaiNgu }
const keys = ['ID'];
const obj2Db = { 'id': 'ID', 'trichYeu': 'TRICH_YEU', 'ngayGui': 'NGAY_GUI', 'ngayKy': 'NGAY_KY', 'donViGui': 'DON_VI_GUI', 'canBoNhan': 'CAN_BO_NHAN', 'loaiVanBan': 'LOAI_VAN_BAN', 'tenVietTatDonViGui': 'TEN_VIET_TAT_DON_VI_GUI', 'trangThai': 'TRANG_THAI', 'soCongVan': 'SO_CONG_VAN', 'soDi': 'SO_DI', 'loaiCongVan': 'LOAI_CONG_VAN', 'ngayTao': 'NGAY_TAO', 'laySoTuDong': 'LAY_SO_TU_DONG', 'nguoiTao': 'NGUOI_TAO', 'ngoaiNgu': 'NGOAI_NGU' };

module.exports = app => {
    app.model.hcthCongVanDi = {
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
                const sql = 'INSERT INTO HCTH_CONG_VAN_DI (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.database.oracle.connection.main.execute(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.hcthCongVanDi.get({ rowId: resultSet.lastRowid }).then(item => {
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT * FROM HCTH_CONG_VAN_DI' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ') WHERE ROWNUM=1';
            app.database.oracle.connection.main.execute(sql, parameter, (error, resultSet) => {
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM HCTH_CONG_VAN_DI' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '');
            app.database.oracle.connection.main.execute(sql, parameter, (error, resultSet) => {
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
            const sqlCount = 'SELECT COUNT(*) FROM HCTH_CONG_VAN_DI' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.database.oracle.connection.main.execute(sqlCount, parameter, (error, res) => {
                if (error) {
                    done && done(error);
                    reject(error);
                } else {
                    let result = {};
                    let totalItem = res && res.rows && res.rows[0] ? res.rows[0]['COUNT(*)'] : 0;
                    result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                    result.pageNumber = Math.max(1, Math.min(pageNumber, result.pageTotal));
                    leftIndex = Math.max(0, result.pageNumber - 1) * pageSize;
                    const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT HCTH_CONG_VAN_DI.*, ROW_NUMBER() OVER (ORDER BY ' + (orderBy ? orderBy : keys) + ') R FROM HCTH_CONG_VAN_DI' + (condition.statement ? ' WHERE ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize);
                    app.database.oracle.connection.main.execute(sql, parameter, (error, resultSet) => {
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
                const sql = 'UPDATE HCTH_CONG_VAN_DI SET ' + changes.statement + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.database.oracle.connection.main.execute(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.hcthCongVanDi.get({ rowId: resultSet.lastRowid }).then(item => {
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
            const sql = 'DELETE FROM HCTH_CONG_VAN_DI' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.database.oracle.connection.main.execute(sql, parameter, error => {
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
            const sql = 'SELECT COUNT(*) FROM HCTH_CONG_VAN_DI' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.database.oracle.connection.main.execute(sql, parameter, (error, result) => {
                if (error) {
                    done && done(error);
                    reject(error);
                } else {
                    done && done(null, result);
                    resolve(result);
                }
            });
        }),

        searchPage: (pagenumber, pagesize, macanbo, donvigui, donvi, loaicongvan, loaivanban, donvinhanngoai, donvixem, canboxem, loaicanbo, status, timetype, fromtime, totime, searchterm, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.execute('BEGIN :ret:=hcth_cong_van_di_search_page(:pagenumber, :pagesize, :macanbo, :donvigui, :donvi, :loaicongvan, :loaivanban, :donvinhanngoai, :donvixem, :canboxem, :loaicanbo, :status, :timetype, :fromtime, :totime, :searchterm, :totalitem, :pagetotal); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, macanbo, donvigui, donvi, loaicongvan, loaivanban, donvinhanngoai, donvixem, canboxem, loaicanbo, status, timetype, fromtime, totime, searchterm, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        updateSoCongVanDi: (ma, donvigui, nam, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.execute('BEGIN hcth_cong_van_di_update_so_cong_van(:ma, :donvigui, :nam); END;',
                { ma, donvigui, nam }, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                });
        }),

        getAllPhanHoi: (idnhiemvu, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.execute('BEGIN :ret:=hcth_cong_van_di_get_all_phan_hoi(:idnhiemvu); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, idnhiemvu }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getHcthStaff: (done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.execute('BEGIN :ret:=hcth_cong_van_di_get_hcth_staff(); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getAllStaff: (congvanid, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.execute('BEGIN :ret:=hcth_cong_van_di_get_all_staff(:congvanid); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, congvanid }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        searchSelector: (pagenumber, pagesize, filterparam, searchterm, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.execute('BEGIN :ret:=hcth_cong_van_di_search_selector(:pagenumber, :pagesize, :filterparam, :searchterm, :totalitem, :pagetotal); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, filterparam, searchterm, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        downloadExcel: (macanbo, donvigui, donvi, loaicongvan, loaivanban, donvinhanngoai, donvixem, canboxem, loaicanbo, status, timetype, fromtime, totime, searchterm, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.execute('BEGIN :ret:=hcth_cong_van_di_download_excel(:macanbo, :donvigui, :donvi, :loaicongvan, :loaivanban, :donvinhanngoai, :donvixem, :canboxem, :loaicanbo, :status, :timetype, :fromtime, :totime, :searchterm, :totalitem); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, macanbo, donvigui, donvi, loaicongvan, loaivanban, donvinhanngoai, donvixem, canboxem, loaicanbo, status, timetype, fromtime, totime, searchterm, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getSignStaff: (congvanid, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.execute('BEGIN :ret:=hcth_cong_van_di_get_sign_staff(:congvanid); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, congvanid }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        validateSoCongVan: (ma, donvigui, nam, trangthaimoi, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.execute('BEGIN hcth_cong_van_di_validate_so_cong_van(:ma, :donvigui, :nam, :trangthaimoi); END;',
                { ma, donvigui, nam, trangthaimoi }, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                });
        }),

        dashboardGetData: (time, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.execute('BEGIN :ret:=hcth_dashboard_get_data(:time, :hcthCongVanDen, :hcthCongVanDi, :vanBanDenNam, :vanBanDiNam); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, time, hcthCongVanDen: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, hcthCongVanDi: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, vanBanDenNam: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, vanBanDiNam: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
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