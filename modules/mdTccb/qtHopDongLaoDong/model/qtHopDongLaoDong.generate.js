// Table name: QT_HOP_DONG_LAO_DONG { loaiHopDong, soHopDong, nguoiKy, chucVu, nguoiDuocThue, batDauLamViec, ketThucHopDong, ngayKyHdTiepTheo, diaDiemLamViec, chucDanhChuyenMon, congViecDuocGiao, chiuSuPhanCong, ngach, maNgach, bac, heSo, ngayKyHopDong, phanTramHuong, ma, thoiGianLamViec, dungCuDuocCapPhat, phuongTienDiLaiLamViec, hinhThucTraLuong, cheDoNghiNgoi, boiThuongVatChat, ngayCapNhatHopDong, boMon }
const keys = ['MA'];
const obj2Db = { 'loaiHopDong': 'LOAI_HOP_DONG', 'soHopDong': 'SO_HOP_DONG', 'nguoiKy': 'NGUOI_KY', 'chucVu': 'CHUC_VU', 'nguoiDuocThue': 'NGUOI_DUOC_THUE', 'batDauLamViec': 'BAT_DAU_LAM_VIEC', 'ketThucHopDong': 'KET_THUC_HOP_DONG', 'ngayKyHdTiepTheo': 'NGAY_KY_HD_TIEP_THEO', 'diaDiemLamViec': 'DIA_DIEM_LAM_VIEC', 'chucDanhChuyenMon': 'CHUC_DANH_CHUYEN_MON', 'congViecDuocGiao': 'CONG_VIEC_DUOC_GIAO', 'chiuSuPhanCong': 'CHIU_SU_PHAN_CONG', 'ngach': 'NGACH', 'maNgach': 'MA_NGACH', 'bac': 'BAC', 'heSo': 'HE_SO', 'ngayKyHopDong': 'NGAY_KY_HOP_DONG', 'phanTramHuong': 'PHAN_TRAM_HUONG', 'ma': 'MA', 'thoiGianLamViec': 'THOI_GIAN_LAM_VIEC', 'dungCuDuocCapPhat': 'DUNG_CU_DUOC_CAP_PHAT', 'phuongTienDiLaiLamViec': 'PHUONG_TIEN_DI_LAI_LAM_VIEC', 'hinhThucTraLuong': 'HINH_THUC_TRA_LUONG', 'cheDoNghiNgoi': 'CHE_DO_NGHI_NGOI', 'boiThuongVatChat': 'BOI_THUONG_VAT_CHAT', 'ngayCapNhatHopDong': 'NGAY_CAP_NHAT_HOP_DONG', 'boMon': 'BO_MON' };

module.exports = app => {
    app.model.qtHopDongLaoDong = {
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
                const sql = 'INSERT INTO QT_HOP_DONG_LAO_DONG (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.database.oracle.connection.main.execute(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.qtHopDongLaoDong.get({ rowId: resultSet.lastRowid }, done);
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT * FROM QT_HOP_DONG_LAO_DONG' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ') WHERE ROWNUM=1';
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM QT_HOP_DONG_LAO_DONG' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '');
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
            const sql_count = 'SELECT COUNT(*) FROM QT_HOP_DONG_LAO_DONG' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.database.oracle.connection.main.execute(sql_count, parameter, (err, res) => {
                let result = {};
                let totalItem = res && res.rows && res.rows[0] ? res.rows[0]['COUNT(*)'] : 0;
                result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = Math.max(1, Math.min(pageNumber, result.pageTotal));
                leftIndex = Math.max(0, result.pageNumber - 1) * pageSize;
                const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT QT_HOP_DONG_LAO_DONG.*, ROW_NUMBER() OVER (ORDER BY ' + (orderBy ? orderBy : keys) + ') R FROM QT_HOP_DONG_LAO_DONG' + (condition.statement ? ' WHERE ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize);
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
                const sql = 'UPDATE QT_HOP_DONG_LAO_DONG SET ' + changes.statement + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.database.oracle.connection.main.execute(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.qtHopDongLaoDong.get({ rowId: resultSet.lastRowid }, done);
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
            const sql = 'DELETE FROM QT_HOP_DONG_LAO_DONG' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.database.oracle.connection.main.execute(sql, parameter, error => done(error));
        },

        count: (condition, done) => {
            if (done == null) {
                done = condition;
                condition = {};
            }
            condition = app.database.oracle.buildCondition(obj2Db, condition, ' AND ');
            const parameter = condition.parameter ? condition.parameter : {};
            const sql = 'SELECT COUNT(*) FROM QT_HOP_DONG_LAO_DONG' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.database.oracle.connection.main.execute(sql, parameter, (error, result) => done(error, result));
        },

        searchPage: (pagenumber, pagesize, listShcc, listDv, fromyear, toyear, searchterm, done) => {
            app.database.oracle.connection.main.execute('BEGIN :ret:=qt_hop_dong_lao_dong_search_page(:pagenumber, :pagesize, :listShcc, :listDv, :fromyear, :toyear, :searchterm, :totalitem, :pagetotal); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, listShcc, listDv, fromyear, toyear, searchterm, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, done));
        },

        download: (mahd, done) => {
            app.database.oracle.connection.main.execute('BEGIN :ret:=download_hop_dong_lao_dong(:mahd); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, mahd }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, done));
        },

        groupPage: (pagenumber, pagesize, listShcc, listDv, fromyear, toyear, searchterm, done) => {
            app.database.oracle.connection.main.execute('BEGIN :ret:=qt_hop_dong_lao_dong_group_page(:pagenumber, :pagesize, :listShcc, :listDv, :fromyear, :toyear, :searchterm, :totalitem, :pagetotal); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, listShcc, listDv, fromyear, toyear, searchterm, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, done));
        },

        downloadExcel: (pagenumber, pagesize, searchterm, done) => {
            app.database.oracle.connection.main.execute('BEGIN :ret:=download_excel_qt_hop_dong_lao_dong(:pagenumber, :pagesize, :searchterm, :totalitem, :pagetotal); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, searchterm, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, done));
        },

        getMaxShccByDonVi: (madonvi, done) => {
            app.database.oracle.connection.main.execute('BEGIN :ret:=qt_hop_dong_get_max_shcc_by_don_vi(:madonvi); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, madonvi }, done);
        },
    };
};