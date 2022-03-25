let package = require('../../package');
const path = require('path');
// Variables ==================================================================
const app = {
    isDebug: !__dirname.startsWith('/var/www/'),
    fs: require('fs'),
    path,
    mongodb: 'mongodb://localhost:27017/' + package.db.name,
    publicPath: path.join(__dirname, package.path.public),
    assetPath: path.join(__dirname, ''),
    modulesPath: path.join(__dirname, '../../' + package.path.modules),
};
// Configure ==================================================================
require('../../config/common')(app);
require('../../config/lib/excel')(app);
require('../../config/lib/fs')(app);
require('../../config/lib/string')(app);
require('../../config/database.oracleDB')(app, package.db);

// Init =======================================================================
app.loadModules(false);

///Columns SHCC must not have any data is null
///You must copy obj2D from model canBo.generate.js
///How to run:
///+ Export data TCHC_CAN_BO from datagrip into data/TCHC_CAN_BO.xlsx
///+ node app.tool.convertCanBoFromDevToProd.js > output.txt
///+ Copy all sql command in output.txt into datagrip and run (Be careful when run sql command ^_^ ^_^)

const obj2Db = { 'ten': 'TEN', 'ho': 'HO', 'phai': 'PHAI', 'dienThoaiCaNhan': 'DIEN_THOAI_CA_NHAN', 'email': 'EMAIL', 'ngaySinh': 'NGAY_SINH', 'ngayBatDauCongTac': 'NGAY_BAT_DAU_CONG_TAC', 'ngayCbgd': 'NGAY_CBGD', 'ngayBienChe': 'NGAY_BIEN_CHE', 'ngayNghi': 'NGAY_NGHI', 'ngach': 'NGACH', 'ngachMoi': 'NGACH_MOI', 'heSoLuong': 'HE_SO_LUONG', 'bacLuong': 'BAC_LUONG', 'mocNangLuong': 'MOC_NANG_LUONG', 'ngayHuongLuong': 'NGAY_HUONG_LUONG', 'tyLeVuotKhung': 'TY_LE_VUOT_KHUNG', 'phuCapCongViec': 'PHU_CAP_CONG_VIEC', 'ngayPhuCapCongViec': 'NGAY_PHU_CAP_CONG_VIEC', 'maChucVu': 'MA_CHUC_VU', 'chucVuDoanThe': 'CHUC_VU_DOAN_THE', 'chucVuDang': 'CHUC_VU_DANG', 'chucVuKiemNhiem': 'CHUC_VU_KIEM_NHIEM', 'maTrinhDoLlct': 'MA_TRINH_DO_LLCT', 'maTrinhDoQlnn': 'MA_TRINH_DO_QLNN', 'maTrinhDoNn': 'MA_TRINH_DO_NN', 'maTrinhDoTinHoc': 'MA_TRINH_DO_TIN_HOC', 'hoKhau': 'HO_KHAU', 'diaChiHienTai': 'DIA_CHI_HIEN_TAI', 'danToc': 'DAN_TOC', 'tonGiao': 'TON_GIAO', 'dangVien': 'DANG_VIEN', 'maDonVi': 'MA_DON_VI', 'phucLoi': 'PHUC_LOI', 'nhaGiaoNhanDan': 'NHA_GIAO_NHAN_DAN', 'nhaGiaoUuTu': 'NHA_GIAO_UU_TU', 'dangONuocNgoai': 'DANG_O_NUOC_NGOAI', 'lyDoONuocNgoai': 'LY_DO_O_NUOC_NGOAI', 'ghiChu': 'GHI_CHU', 'shcc': 'SHCC', 'emailCaNhan': 'EMAIL_CA_NHAN', 'biDanh': 'BI_DANH', 'dienThoaiBaoTin': 'DIEN_THOAI_BAO_TIN', 'ngheNghiepCu': 'NGHE_NGHIEP_CU', 'cmnd': 'CMND', 'cmndNgayCap': 'CMND_NGAY_CAP', 'cmndNoiCap': 'CMND_NOI_CAP', 'chucVuKhac': 'CHUC_VU_KHAC', 'quocGia': 'QUOC_GIA', 'chucDanh': 'CHUC_DANH', 'trinhDoPhoThong': 'TRINH_DO_PHO_THONG', 'hocVi': 'HOC_VI', 'chuyenNganh': 'CHUYEN_NGANH', 'sucKhoe': 'SUC_KHOE', 'canNang': 'CAN_NANG', 'chieuCao': 'CHIEU_CAO', 'ngayNhapNgu': 'NGAY_NHAP_NGU', 'ngayXuatNgu': 'NGAY_XUAT_NGU', 'quanHamCaoNhat': 'QUAN_HAM_CAO_NHAT', 'hangThuongBinh': 'HANG_THUONG_BINH', 'giaDinhChinhSach': 'GIA_DINH_CHINH_SACH', 'danhHieu': 'DANH_HIEU', 'maXaNoiSinh': 'MA_XA_NOI_SINH', 'maHuyenNoiSinh': 'MA_HUYEN_NOI_SINH', 'maTinhNoiSinh': 'MA_TINH_NOI_SINH', 'maXaNguyenQuan': 'MA_XA_NGUYEN_QUAN', 'maHuyenNguyenQuan': 'MA_HUYEN_NGUYEN_QUAN', 'maTinhNguyenQuan': 'MA_TINH_NGUYEN_QUAN', 'ngayVaoDang': 'NGAY_VAO_DANG', 'ngayVaoDangChinhThuc': 'NGAY_VAO_DANG_CHINH_THUC', 'noiDangDb': 'NOI_DANG_DB', 'noiDangCt': 'NOI_DANG_CT', 'ngayVaoDoan': 'NGAY_VAO_DOAN', 'noiVaoDoan': 'NOI_VAO_DOAN', 'soTheDang': 'SO_THE_DANG', 'soTruong': 'SO_TRUONG', 'nhomMau': 'NHOM_MAU', 'soBhxh': 'SO_BHXH', 'doanVien': 'DOAN_VIEN', 'namChucDanh': 'NAM_CHUC_DANH', 'namHocVi': 'NAM_HOC_VI', 'noiSinh': 'NOI_SINH', 'queQuan': 'QUE_QUAN', 'thuongTruMaHuyen': 'THUONG_TRU_MA_HUYEN', 'thuongTruMaTinh': 'THUONG_TRU_MA_TINH', 'thuongTruMaXa': 'THUONG_TRU_MA_XA', 'thuongTruSoNha': 'THUONG_TRU_SO_NHA', 'hienTaiMaHuyen': 'HIEN_TAI_MA_HUYEN', 'hienTaiMaTinh': 'HIEN_TAI_MA_TINH', 'hienTaiMaXa': 'HIEN_TAI_MA_XA', 'hienTaiSoNha': 'HIEN_TAI_SO_NHA', 'hopDongCanBo': 'HOP_DONG_CAN_BO', 'hopDongCanBoNgay': 'HOP_DONG_CAN_BO_NGAY', 'userModified': 'USER_MODIFIED', 'lastModified': 'LAST_MODIFIED', 'ngayBatDauONuocNgoai': 'NGAY_BAT_DAU_O_NUOC_NGOAI', 'ngayKetThucONuocNgoai': 'NGAY_KET_THUC_O_NUOC_NGOAI', 'dangNghiThaiSan': 'DANG_NGHI_THAI_SAN', 'ngayBatDauNghiThaiSan': 'NGAY_BAT_DAU_NGHI_THAI_SAN', 'ngayKetThucNghiThaiSan': 'NGAY_KET_THUC_NGHI_THAI_SAN', 'congDoan': 'CONG_DOAN', 'ngayVaoCongDoan': 'NGAY_VAO_CONG_DOAN', 'maTheBhyt': 'MA_THE_BHYT', 'noiKhamChuaBenhBanDau': 'NOI_KHAM_CHUA_BENH_BAN_DAU', 'quyenLoiKhamChuaBenh': 'QUYEN_LOI_KHAM_CHUA_BENH', 'dangNghiKhongHuongLuong': 'DANG_NGHI_KHONG_HUONG_LUONG', 'ngayBatDauNghiKhongHuongLuong': 'NGAY_BAT_DAU_NGHI_KHONG_HUONG_LUONG', 'ngayKetThucNghiKhongHuongLuong': 'NGAY_KET_THUC_NGHI_KHONG_HUONG_LUONG', 'lyDoNghiKhongHuongLuong': 'LY_DO_NGHI_KHONG_HUONG_LUONG', 'doiTuongBoiDuongKienThucQpan': 'DOI_TUONG_BOI_DUONG_KIEN_THUC_QPAN', 'ngayBatDauBhxh': 'NGAY_BAT_DAU_BHXH', 'ngayKetThucBhxh': 'NGAY_KET_THUC_BHXH', 'tuNhanXet': 'TU_NHAN_XET', 'tinhTrangBoiDuong': 'TINH_TRANG_BOI_DUONG', 'namBoiDuong': 'NAM_BOI_DUONG', 'khoaBoiDuong': 'KHOA_BOI_DUONG' };

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

const run = () => {
    app.excel.readFile(app.path.join(app.assetPath, './data/TCHC_CAN_BO.xlsx'), workbook => {
        if (workbook) {
            const worksheet = workbook.getWorksheet(1);
            let numCols = 1;
            let listCols = [];
            while (true) {
                let name = worksheet.getCell(app.excel.numberToExcelColumn(numCols) + '1').value;
                if (name == null) {
                    numCols -= 1;
                    break;
                }
                listCols.push(name);
                numCols += 1;
            }

            let keys = 'SHCC';
            let idKeys = listCols.indexOf(keys); ///base 0th
            solve = (row = 2) => {
                let cell = app.excel.numberToExcelColumn(idKeys + 1) + row;
                let dataKey = worksheet.getCell(cell).value;
                if (dataKey == null) process.exit(1);
                else dataKey = dataKey.toString();
                // console.log("Row = ", row, "Cell = ", cell, "Key = ", dataKey);
                app.model.canBo.get({ shcc: dataKey }, (error, data) => {
                    if (data != null) { ///update data canbo from dev to prod, make sure that data canbo from dev is newest version
                        // console.log("keys", "=", dataKey);
                        sql = 'UPDATE TCHC_CAN_BO SET ';
                        params = '';
                        for (let col = 0; col < nu_Cols; col++) {
                            let nameCol = listCols[col];
                            let nameColModel = getKeyByValue(obj2Db, nameCol);
                            let dataCol = worksheet.getCell(app.excel.numberToExcelColumn(col + 1) + row).value;
                            if (true || (dataCol != null)) {
                                if (dataCol != null) dataCol = dataCol.toString();
                                else dataCol = '';
                                params += nameCol + '=';
                                params += "'" + dataCol + "'";
                                params += ',';
                            }
                        }
                        if (params.length > 0) {
                            params = params.slice(0, -1);
                            sql += params;
                            sql += ' ';
                            sql += 'WHERE SHCC = ' + "'" + dataKey + "'" + ';';
                            console.log(sql);
                        }
                    }
                    else { ///insert new canbo
                        // console.log("keys", "=", dataKey);
                        sql = 'INSERT INTO TCHC_CAN_BO (';
                        for (let col = 0; col < numCols; col++) {
                            sql += listCols[col];
                            if (col != numCols - 1) sql += ',';
                            else sql += ') ';
                        }
                        sql += 'VALUES (';
                        for (let col = 1; col <= numCols; col++) {
                            let data = worksheet.getCell(app.excel.numberToExcelColumn(col) + row).value;
                            if (data != null) data = data.toString();
                            else data = '';
                            sql += "'" + data + "'";
                            if (col != numCols) sql += ',';
                            else sql += ');';
                        }
                        console.log(sql);
                    }
                    solve(row + 1);
                });
            }
            if (worksheet) solve();
        }
    });
}

app.readyHooks.add('Run tool.updateCanBoFromDevToProd.js', {
    ready: () => app.dbConnection && app.model && app.model.canBo,
    run,
});