// Table name: TCHC_CAN_BO { ten, ho, phai, dienThoaiCaNhan, email, ngaySinh, ngayBatDauCongTac, ngayCbgd, ngayBienChe, ngayNghi, ngach, heSoLuong, bacLuong, mocNangLuong, ngayHuongLuong, tyLeVuotKhung, maChucVu, chucVuDoanThe, chucVuDang, chucVuKiemNhiem, hoKhau, diaChiHienTai, danToc, tonGiao, dangVien, maDonVi, phucLoi, nhaGiaoNhanDan, nhaGiaoUuTu, ghiChu, shcc, emailCaNhan, biDanh, dienThoaiBaoTin, ngheNghiepCu, cmnd, cmndNgayCap, cmndNoiCap, chucVuKhac, quocGia, chucDanh, trinhDoPhoThong, hocVi, chuyenNganh, sucKhoe, canNang, chieuCao, ngayNhapNgu, ngayXuatNgu, quanHamCaoNhat, hangThuongBinh, giaDinhChinhSach, danhHieu, maXaNoiSinh, maHuyenNoiSinh, maTinhNoiSinh, maXaNguyenQuan, maHuyenNguyenQuan, maTinhNguyenQuan, ngayVaoDang, ngayVaoDangChinhThuc, noiDangDb, noiDangCt, ngayVaoDoan, noiVaoDoan, soTheDang, soTruong, nhomMau, soBhxh, doanVien, namChucDanh, namHocVi, noiSinh, queQuan, thuongTruMaHuyen, thuongTruMaTinh, thuongTruMaXa, thuongTruSoNha, hienTaiMaHuyen, hienTaiMaTinh, hienTaiMaXa, hienTaiSoNha, hopDongCanBo, hopDongCanBoNgay, userModified, lastModified, dangNghiThaiSan, ngayBatDauNghiThaiSan, ngayKetThucNghiThaiSan, congDoan, ngayVaoCongDoan, maTheBhyt, noiKhamChuaBenhBanDau, quyenLoiKhamChuaBenh, dangNghiKhongHuongLuong, ngayBatDauNghiKhongHuongLuong, ngayKetThucNghiKhongHuongLuong, lyDoNghiKhongHuongLuong, doiTuongBoiDuongKienThucQpan, ngayBatDauBhxh, ngayKetThucBhxh, tuNhanXet, tinhTrangBoiDuong, namBoiDuong, khoaBoiDuong, trinhDoChuyenMon, namTotNghiep, phuCapChucVu, tyLePhuCapThamNien, tyLePhuCapUuDai, loaiDoiTuongBoiDuong, loaiHopDong, cuNhan, thacSi, tienSi, chuyenNganhChucDanh, coSoChucDanh }
const keys = ['SHCC'];
const obj2Db = { 'ten': 'TEN', 'ho': 'HO', 'phai': 'PHAI', 'dienThoaiCaNhan': 'DIEN_THOAI_CA_NHAN', 'email': 'EMAIL', 'ngaySinh': 'NGAY_SINH', 'ngayBatDauCongTac': 'NGAY_BAT_DAU_CONG_TAC', 'ngayCbgd': 'NGAY_CBGD', 'ngayBienChe': 'NGAY_BIEN_CHE', 'ngayNghi': 'NGAY_NGHI', 'ngach': 'NGACH', 'heSoLuong': 'HE_SO_LUONG', 'bacLuong': 'BAC_LUONG', 'mocNangLuong': 'MOC_NANG_LUONG', 'ngayHuongLuong': 'NGAY_HUONG_LUONG', 'tyLeVuotKhung': 'TY_LE_VUOT_KHUNG', 'maChucVu': 'MA_CHUC_VU', 'chucVuDoanThe': 'CHUC_VU_DOAN_THE', 'chucVuDang': 'CHUC_VU_DANG', 'chucVuKiemNhiem': 'CHUC_VU_KIEM_NHIEM', 'hoKhau': 'HO_KHAU', 'diaChiHienTai': 'DIA_CHI_HIEN_TAI', 'danToc': 'DAN_TOC', 'tonGiao': 'TON_GIAO', 'dangVien': 'DANG_VIEN', 'maDonVi': 'MA_DON_VI', 'phucLoi': 'PHUC_LOI', 'nhaGiaoNhanDan': 'NHA_GIAO_NHAN_DAN', 'nhaGiaoUuTu': 'NHA_GIAO_UU_TU', 'ghiChu': 'GHI_CHU', 'shcc': 'SHCC', 'emailCaNhan': 'EMAIL_CA_NHAN', 'biDanh': 'BI_DANH', 'dienThoaiBaoTin': 'DIEN_THOAI_BAO_TIN', 'ngheNghiepCu': 'NGHE_NGHIEP_CU', 'cmnd': 'CMND', 'cmndNgayCap': 'CMND_NGAY_CAP', 'cmndNoiCap': 'CMND_NOI_CAP', 'chucVuKhac': 'CHUC_VU_KHAC', 'quocGia': 'QUOC_GIA', 'chucDanh': 'CHUC_DANH', 'trinhDoPhoThong': 'TRINH_DO_PHO_THONG', 'hocVi': 'HOC_VI', 'chuyenNganh': 'CHUYEN_NGANH', 'sucKhoe': 'SUC_KHOE', 'canNang': 'CAN_NANG', 'chieuCao': 'CHIEU_CAO', 'ngayNhapNgu': 'NGAY_NHAP_NGU', 'ngayXuatNgu': 'NGAY_XUAT_NGU', 'quanHamCaoNhat': 'QUAN_HAM_CAO_NHAT', 'hangThuongBinh': 'HANG_THUONG_BINH', 'giaDinhChinhSach': 'GIA_DINH_CHINH_SACH', 'danhHieu': 'DANH_HIEU', 'maXaNoiSinh': 'MA_XA_NOI_SINH', 'maHuyenNoiSinh': 'MA_HUYEN_NOI_SINH', 'maTinhNoiSinh': 'MA_TINH_NOI_SINH', 'maXaNguyenQuan': 'MA_XA_NGUYEN_QUAN', 'maHuyenNguyenQuan': 'MA_HUYEN_NGUYEN_QUAN', 'maTinhNguyenQuan': 'MA_TINH_NGUYEN_QUAN', 'ngayVaoDang': 'NGAY_VAO_DANG', 'ngayVaoDangChinhThuc': 'NGAY_VAO_DANG_CHINH_THUC', 'noiDangDb': 'NOI_DANG_DB', 'noiDangCt': 'NOI_DANG_CT', 'ngayVaoDoan': 'NGAY_VAO_DOAN', 'noiVaoDoan': 'NOI_VAO_DOAN', 'soTheDang': 'SO_THE_DANG', 'soTruong': 'SO_TRUONG', 'nhomMau': 'NHOM_MAU', 'soBhxh': 'SO_BHXH', 'doanVien': 'DOAN_VIEN', 'namChucDanh': 'NAM_CHUC_DANH', 'namHocVi': 'NAM_HOC_VI', 'noiSinh': 'NOI_SINH', 'queQuan': 'QUE_QUAN', 'thuongTruMaHuyen': 'THUONG_TRU_MA_HUYEN', 'thuongTruMaTinh': 'THUONG_TRU_MA_TINH', 'thuongTruMaXa': 'THUONG_TRU_MA_XA', 'thuongTruSoNha': 'THUONG_TRU_SO_NHA', 'hienTaiMaHuyen': 'HIEN_TAI_MA_HUYEN', 'hienTaiMaTinh': 'HIEN_TAI_MA_TINH', 'hienTaiMaXa': 'HIEN_TAI_MA_XA', 'hienTaiSoNha': 'HIEN_TAI_SO_NHA', 'hopDongCanBo': 'HOP_DONG_CAN_BO', 'hopDongCanBoNgay': 'HOP_DONG_CAN_BO_NGAY', 'userModified': 'USER_MODIFIED', 'lastModified': 'LAST_MODIFIED', 'dangNghiThaiSan': 'DANG_NGHI_THAI_SAN', 'ngayBatDauNghiThaiSan': 'NGAY_BAT_DAU_NGHI_THAI_SAN', 'ngayKetThucNghiThaiSan': 'NGAY_KET_THUC_NGHI_THAI_SAN', 'congDoan': 'CONG_DOAN', 'ngayVaoCongDoan': 'NGAY_VAO_CONG_DOAN', 'maTheBhyt': 'MA_THE_BHYT', 'noiKhamChuaBenhBanDau': 'NOI_KHAM_CHUA_BENH_BAN_DAU', 'quyenLoiKhamChuaBenh': 'QUYEN_LOI_KHAM_CHUA_BENH', 'dangNghiKhongHuongLuong': 'DANG_NGHI_KHONG_HUONG_LUONG', 'ngayBatDauNghiKhongHuongLuong': 'NGAY_BAT_DAU_NGHI_KHONG_HUONG_LUONG', 'ngayKetThucNghiKhongHuongLuong': 'NGAY_KET_THUC_NGHI_KHONG_HUONG_LUONG', 'lyDoNghiKhongHuongLuong': 'LY_DO_NGHI_KHONG_HUONG_LUONG', 'doiTuongBoiDuongKienThucQpan': 'DOI_TUONG_BOI_DUONG_KIEN_THUC_QPAN', 'ngayBatDauBhxh': 'NGAY_BAT_DAU_BHXH', 'ngayKetThucBhxh': 'NGAY_KET_THUC_BHXH', 'tuNhanXet': 'TU_NHAN_XET', 'tinhTrangBoiDuong': 'TINH_TRANG_BOI_DUONG', 'namBoiDuong': 'NAM_BOI_DUONG', 'khoaBoiDuong': 'KHOA_BOI_DUONG', 'trinhDoChuyenMon': 'TRINH_DO_CHUYEN_MON', 'namTotNghiep': 'NAM_TOT_NGHIEP', 'phuCapChucVu': 'PHU_CAP_CHUC_VU', 'tyLePhuCapThamNien': 'TY_LE_PHU_CAP_THAM_NIEN', 'tyLePhuCapUuDai': 'TY_LE_PHU_CAP_UU_DAI', 'loaiDoiTuongBoiDuong': 'LOAI_DOI_TUONG_BOI_DUONG', 'loaiHopDong': 'LOAI_HOP_DONG', 'cuNhan': 'CU_NHAN', 'thacSi': 'THAC_SI', 'tienSi': 'TIEN_SI', 'chuyenNganhChucDanh': 'CHUYEN_NGANH_CHUC_DANH', 'coSoChucDanh': 'CO_SO_CHUC_DANH' };

module.exports = app => {
    app.model.canBo = {
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
                const sql = 'INSERT INTO TCHC_CAN_BO (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.dbConnection.execute(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.canBo.get({ rowId: resultSet.lastRowid }, done);
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
            const sql = 'SELECT ' + app.dbConnection.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT * FROM TCHC_CAN_BO' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ') WHERE ROWNUM=1';
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
            const sql = 'SELECT ' + app.dbConnection.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM TCHC_CAN_BO' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '');
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
            const sql_count = 'SELECT COUNT(*) FROM TCHC_CAN_BO' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.dbConnection.execute(sql_count, parameter, (err, res) => {
                let result = {};
                let totalItem = res && res.rows && res.rows[0] ? res.rows[0]['COUNT(*)'] : 0;
                result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = Math.max(1, Math.min(pageNumber, result.pageTotal));
                leftIndex = Math.max(0, result.pageNumber - 1) * pageSize;
                const sql = 'SELECT ' + app.dbConnection.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT TCHC_CAN_BO.*, ROW_NUMBER() OVER (ORDER BY ' + (orderBy ? orderBy : keys) + ') R FROM TCHC_CAN_BO' + (condition.statement ? ' WHERE ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize);
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
                const sql = 'UPDATE TCHC_CAN_BO SET ' + changes.statement + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.dbConnection.execute(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.canBo.get({ rowId: resultSet.lastRowid }, done);
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
            const sql = 'DELETE FROM TCHC_CAN_BO' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.dbConnection.execute(sql, parameter, error => done(error));
        },

        count: (condition, done) => {
            if (done == null) {
                done = condition;
                condition = {};
            }
            condition = app.dbConnection.buildCondition(obj2Db, condition, ' AND ');
            const parameter = condition.parameter ? condition.parameter : {};
            const sql = 'SELECT COUNT(*) FROM TCHC_CAN_BO' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.dbConnection.execute(sql, parameter, (error, result) => done(error, result));
        },

        tccbDasboardTotalGender: (done) => {
            app.dbConnection.execute('BEGIN :ret:=tccb_dashboard_total_gender(); END;',
                { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
        },

        tccbDashboardStaffByDV: (done) => {
            app.dbConnection.execute('BEGIN :ret:=tccb_dashboard_get_number_staff_by_don_vi(); END;',
                { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
        },

        tccbDashboardStaffCurrentlyForeign: (done) => {
            app.dbConnection.execute('BEGIN :ret:=tccb_dashboard_get_staff_dang_nuoc_ngoai_by_muc_dich(); END;',
                { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
        },

        tccbDashboardStaffCurrentlyWorkOutside: (done) => {
            app.dbConnection.execute('BEGIN :ret:=tccb_dashboard_get_staff_dang_trong_nuoc_by_muc_dich(); END;',
                { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
        },
    };
};