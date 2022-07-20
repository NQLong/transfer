// Table name: FW_STUDENT { ho, ten, ngaySinh, gioiTinh, danToc, tonGiao, quocGia, thuongTruMaTinh, thuongTruMaHuyen, thuongTruMaXa, thuongTruSoNha, lienLacMaTinh, lienLacMaHuyen, lienLacMaXa, lienLacSoNha, loaiSinhVien, tinhTrang, dienThoaiKhac, dienThoaiCaNhan, dienThoaiLienLac, emailCaNhan, emailTruong, tenCha, ngheNghiepCha, ngaySinhCha, tenMe, ngheNghiepMe, ngaySinhMe, loaiHinhDaoTao, maKhoa, khoa, maNganh, lop, sdtCha, sdtMe, hoTenNguoiLienLac, sdtNguoiLienLac, cmnd, cmndNoiCap, cmndNgayCap, namTuyenSinh, ngayNhapHoc, mssv, nienKhoa, maCtdt, bacDaoTao, noiSinhMaTinh, doiTuongTuyenSinh, khuVucTuyenSinh, ngayVaoDoan, ngayVaoDang, thuongTruMaTinhCha, thuongTruMaHuyenCha, thuongTruMaXaCha, thuongTruSoNhaCha, thuongTruMaTinhMe, thuongTruMaHuyenMe, thuongTruMaXaMe, thuongTruSoNhaMe, phuongThucTuyenSinh, diemThi, doiTuongChinhSach, image, lastModified }
const keys = ['MSSV'];
const obj2Db = { 'ho': 'HO', 'ten': 'TEN', 'ngaySinh': 'NGAY_SINH', 'gioiTinh': 'GIOI_TINH', 'danToc': 'DAN_TOC', 'tonGiao': 'TON_GIAO', 'quocGia': 'QUOC_GIA', 'thuongTruMaTinh': 'THUONG_TRU_MA_TINH', 'thuongTruMaHuyen': 'THUONG_TRU_MA_HUYEN', 'thuongTruMaXa': 'THUONG_TRU_MA_XA', 'thuongTruSoNha': 'THUONG_TRU_SO_NHA', 'lienLacMaTinh': 'LIEN_LAC_MA_TINH', 'lienLacMaHuyen': 'LIEN_LAC_MA_HUYEN', 'lienLacMaXa': 'LIEN_LAC_MA_XA', 'lienLacSoNha': 'LIEN_LAC_SO_NHA', 'loaiSinhVien': 'LOAI_SINH_VIEN', 'tinhTrang': 'TINH_TRANG', 'dienThoaiKhac': 'DIEN_THOAI_KHAC', 'dienThoaiCaNhan': 'DIEN_THOAI_CA_NHAN', 'dienThoaiLienLac': 'DIEN_THOAI_LIEN_LAC', 'emailCaNhan': 'EMAIL_CA_NHAN', 'emailTruong': 'EMAIL_TRUONG', 'tenCha': 'TEN_CHA', 'ngheNghiepCha': 'NGHE_NGHIEP_CHA', 'ngaySinhCha': 'NGAY_SINH_CHA', 'tenMe': 'TEN_ME', 'ngheNghiepMe': 'NGHE_NGHIEP_ME', 'ngaySinhMe': 'NGAY_SINH_ME', 'loaiHinhDaoTao': 'LOAI_HINH_DAO_TAO', 'maKhoa': 'MA_KHOA', 'khoa': 'KHOA', 'maNganh': 'MA_NGANH', 'lop': 'LOP', 'sdtCha': 'SDT_CHA', 'sdtMe': 'SDT_ME', 'hoTenNguoiLienLac': 'HO_TEN_NGUOI_LIEN_LAC', 'sdtNguoiLienLac': 'SDT_NGUOI_LIEN_LAC', 'cmnd': 'CMND', 'cmndNoiCap': 'CMND_NOI_CAP', 'cmndNgayCap': 'CMND_NGAY_CAP', 'namTuyenSinh': 'NAM_TUYEN_SINH', 'ngayNhapHoc': 'NGAY_NHAP_HOC', 'mssv': 'MSSV', 'nienKhoa': 'NIEN_KHOA', 'maCtdt': 'MA_CTDT', 'bacDaoTao': 'BAC_DAO_TAO', 'noiSinhMaTinh': 'NOI_SINH_MA_TINH', 'doiTuongTuyenSinh': 'DOI_TUONG_TUYEN_SINH', 'khuVucTuyenSinh': 'KHU_VUC_TUYEN_SINH', 'ngayVaoDoan': 'NGAY_VAO_DOAN', 'ngayVaoDang': 'NGAY_VAO_DANG', 'thuongTruMaTinhCha': 'THUONG_TRU_MA_TINH_CHA', 'thuongTruMaHuyenCha': 'THUONG_TRU_MA_HUYEN_CHA', 'thuongTruMaXaCha': 'THUONG_TRU_MA_XA_CHA', 'thuongTruSoNhaCha': 'THUONG_TRU_SO_NHA_CHA', 'thuongTruMaTinhMe': 'THUONG_TRU_MA_TINH_ME', 'thuongTruMaHuyenMe': 'THUONG_TRU_MA_HUYEN_ME', 'thuongTruMaXaMe': 'THUONG_TRU_MA_XA_ME', 'thuongTruSoNhaMe': 'THUONG_TRU_SO_NHA_ME', 'phuongThucTuyenSinh': 'PHUONG_THUC_TUYEN_SINH', 'diemThi': 'DIEM_THI', 'doiTuongChinhSach': 'DOI_TUONG_CHINH_SACH', 'image': 'IMAGE', 'lastModified': 'LAST_MODIFIED' };

module.exports = app => {
    app.model.fwStudents = {
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
                const sql = 'INSERT INTO FW_STUDENT (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.database.oracle.connection.main.execute(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.fwStudents.get({ rowId: resultSet.lastRowid }, done);
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT * FROM FW_STUDENT' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ') WHERE ROWNUM=1';
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM FW_STUDENT' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '');
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
            const sqlCount = 'SELECT COUNT(*) FROM FW_STUDENT' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.database.oracle.connection.main.execute(sqlCount, parameter, (error, res) => {
                if (error) {
                    done(error);
                } else {
                    let result = {};
                    let totalItem = res && res.rows && res.rows[0] ? res.rows[0]['COUNT(*)'] : 0;
                    result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                    result.pageNumber = Math.max(1, Math.min(pageNumber, result.pageTotal));
                    leftIndex = Math.max(0, result.pageNumber - 1) * pageSize;
                    const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT FW_STUDENT.*, ROW_NUMBER() OVER (ORDER BY ' + (orderBy ? orderBy : keys) + ') R FROM FW_STUDENT' + (condition.statement ? ' WHERE ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize);
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
                const sql = 'UPDATE FW_STUDENT SET ' + changes.statement + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.database.oracle.connection.main.execute(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.fwStudents.get({ rowId: resultSet.lastRowid }, done);
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
            const sql = 'DELETE FROM FW_STUDENT' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.database.oracle.connection.main.execute(sql, parameter, error => done(error));
        },

        count: (condition, done) => {
            if (done == null) {
                done = condition;
                condition = {};
            }
            condition = app.database.oracle.buildCondition(obj2Db, condition, ' AND ');
            const parameter = condition.parameter ? condition.parameter : {};
            const sql = 'SELECT COUNT(*) FROM FW_STUDENT' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.database.oracle.connection.main.execute(sql, parameter, (error, result) => done(error, result));
        },

        searchPage: (pagenumber, pagesize, listfaculty, listfromcity, listethnic, listnationality, listreligion, listloaihinhdaotao, listloaisinhvien, listtinhtrangsinhvien, gender, searchterm, done) => {
            app.database.oracle.connection.main.execute('BEGIN :ret:=fw_student_search_page(:pagenumber, :pagesize, :listfaculty, :listfromcity, :listethnic, :listnationality, :listreligion, :listloaihinhdaotao, :listloaisinhvien, :listtinhtrangsinhvien, :gender, :searchterm, :totalitem, :pagetotal); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, listfaculty, listfromcity, listethnic, listnationality, listreligion, listloaihinhdaotao, listloaisinhvien, listtinhtrangsinhvien, gender, searchterm, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, done));
        },

        getData: (imssv, done) => {
            app.database.oracle.connection.main.execute('BEGIN :ret:=fw_student_get_data(:imssv); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, imssv }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, done));
        },
    };
};