let package = require('../../package');
const path = require('path');
// Variables ==================================================================
const app = {
    model: {},
    isDebug: !path.join(__dirname, '../../').startsWith('/var/www/'),
    fs: require('fs'), path,
    database: {},
    publicPath: path.join(__dirname, package.path.public),
    assetPath: path.join(__dirname, '../'),
    modulesPath: path.join(__dirname, '../../' + package.path.modules)
};
// Configure ==================================================================
require('../../config/database.oracleDB')(app, package);
require('../../config/common')(app);
require('../../config/io')(app);
require('../../config/lib/excel')(app);
require('../../config/lib/fs')(app);
require('../../config/lib/string')(app);


// Init =======================================================================
// Table name: TCHC_CAN_BO { ten, ho, phai, dienThoaiCaNhan, email, ngaySinh, ngayBatDauCongTac, ngayCbgd, ngayBienChe, ngayNghi, ngach, heSoLuong, bacLuong, mocNangLuong, ngayHuongLuong, tyLeVuotKhung, maChucVu, tonGiao, danToc, dangVien, maDonVi, phucLoi, nhaGiaoNhanDan, nhaGiaoUuTu, ghiChu, shcc, emailCaNhan, biDanh, dienThoaiBaoTin, ngheNghiepCu, cmnd, cmndNgayCap, cmndNoiCap, chucVuKhac, quocGia, chucDanh, trinhDoPhoThong, hocVi, chuyenNganh, sucKhoe, canNang, chieuCao, ngayNhapNgu, ngayXuatNgu, quanHamCaoNhat, hangThuongBinh, giaDinhChinhSach, danhHieu, maXaNoiSinh, maHuyenNoiSinh, maTinhNoiSinh, maXaNguyenQuan, maHuyenNguyenQuan, maTinhNguyenQuan, ngayVaoDang, ngayVaoDangChinhThuc, noiDangDb, noiDangCt, ngayVaoDoan, noiVaoDoan, soTheDang, soTruong, nhomMau, soBhxh, doanVien, namChucDanh, namHocVi, noiSinh, queQuan, thuongTruMaHuyen, thuongTruMaTinh, thuongTruMaXa, thuongTruSoNha, hienTaiMaHuyen, hienTaiMaTinh, hienTaiMaXa, hienTaiSoNha, userModified, lastModified, congDoan, ngayVaoCongDoan, maTheBhyt, noiKhamChuaBenhBanDau, quyenLoiKhamChuaBenh, doiTuongBoiDuongKienThucQpan, ngayBatDauBhxh, ngayKetThucBhxh, tuNhanXet, tinhTrangBoiDuong, namBoiDuong, khoaBoiDuong, trinhDoChuyenMon, namTotNghiep, tyLePhuCapThamNien, tyLePhuCapUuDai, loaiDoiTuongBoiDuong, cuNhan, thacSi, tienSi, chuyenNganhChucDanh, coSoChucDanh, donViTuyenDung }

app.loadModules(false);
const run = () => {
    app.excel.readFile(app.path.join(__dirname, './data/DSCB_Thanh.xlsx'), workbook => {
        if (workbook) {
            const worksheet = workbook.getWorksheet(1);
            if (false) { //update ngày nghỉ, nếu shcc tồn tại trong file excel thì để null, ngược lại để 1
                app.model.canBo.getAll((error, items) => {
                    const updateNgayNghi = (idx = 0) => {
                        if (idx == items.length) return;
                        console.log("update with idx = ", idx, items[idx].shcc);
                        let exist = false;
                        for (let row = 9; ; row++) {
                            let stt = worksheet.getCell('A' + row).value;
                            if (stt == null) break;
                            let shcc = (worksheet.getCell('B' + row).value || '').toString().trim();
                            if (shcc == items[idx].shcc) {
                                console.log(row, idx, shcc, items[idx].shcc);
                                exist = true;
                                break;
                            }
                        }
                        if (exist == true) {
                            app.model.canBo.update({ shcc: items[idx].shcc}, { ngayNghi: ''}, (error, item) => {
                                if (error || item == null) {
                                    console.log("stupid update = ", items[idx].shcc);
                                }
                                updateNgayNghi(idx + 1);
                            });
                        } else {
                            if (items[idx].ngayNghi) { /// đã tồn tại ngày nghỉ thì không cập nhật
                                updateNgayNghi(idx + 1);
                            } else {
                                app.model.canBo.update({ shcc: items[idx].shcc}, { ngayNghi: '1'}, (error, item) => {
                                    if (error || item == null) {
                                        console.log("stupid update = ", items[idx].shcc);
                                    }
                                    updateNgayNghi(idx + 1);
                                });
                            }
                        }
                    }
                    updateNgayNghi();
                });
            }
            const updateQueQuan = (row = 9) => {
                console.log("update with idx = ", row);
                let stt = worksheet.getCell('A' + row).value;
                if (stt == null) {
                    process.exit();
                }
                let shcc = (worksheet.getCell('B' + row).value || '').toString().trim();
                let queQuan = (worksheet.getCell('I' + row).value || '').toString().trim();
                app.model.canBo.update({ shcc }, { queQuan }, (error, item) => {
                    if (error || item == null) {
                        console.log("Update failed: ", shcc, error);
                    }
                    updateQueQuan(row + 1);
                });
            };
            const updateTonGiao = (row = 9) => {
                console.log("update with idx = ", row);
                let stt = worksheet.getCell('A' + row).value;
                if (stt == null) {
                    process.exit();
                }
                let shcc = (worksheet.getCell('B' + row).value || '').toString().trim();
                let tonGiao = (worksheet.getCell('K' + row).value || '').toString().trim();
                if (tonGiao.toLowerCase() == 'không') tonGiao = '99';
                else if (tonGiao.toLowerCase().includes('phật')) tonGiao = '01';
                else if (tonGiao.toLowerCase().includes('công giáo')) tonGiao = '02';
                else if (tonGiao.toLowerCase().includes('tin lành')) tonGiao = '03';
                else if (tonGiao.toLowerCase().includes('cao đài')) tonGiao = '04';
                else if (tonGiao.toLowerCase().includes('bàlamôn')) tonGiao = '13';
                else if (tonGiao.toLowerCase().includes('thiên chúa')) tonGiao = '15';
                else tonGiao = '00';
                app.model.canBo.update({ shcc }, { tonGiao }, (error, item) => {
                    if (error || item == null) {
                        console.log("Update failed: ", shcc, error);
                    }
                    updateTonGiao(row + 1);
                });
            };
            const updateDanToc = (row = 9) => {
                console.log("update with idx = ", row);
                let stt = worksheet.getCell('A' + row).value;
                if (stt == null) {
                    process.exit();
                }
                let shcc = (worksheet.getCell('B' + row).value || '').toString().trim();
                let danToc = (worksheet.getCell('J' + row).value || '').toString().trim();
                if (danToc.toLowerCase() == 'kinh') danToc = '01';
                else if (danToc.toLowerCase() == 'hoa' || danToc.toLowerCase() == 'hán') danToc = '04';
                else if (danToc.toLowerCase() == 'ê đê') danToc = '12';
                else if (danToc.toLowerCase() == 'nùng') danToc = '07';
                else if (danToc.toLowerCase() == 'khmer') danToc = '05';
                else if (danToc.toLowerCase() == 'chăm') danToc = '16';
                else if (danToc.toLowerCase() == 'thái') danToc = '03';
                else if (danToc.toLowerCase() == 'kơ-ho') danToc = '15';
                else if (danToc.toLowerCase() == 'tày') danToc = '02';
                else danToc = '00';
                app.model.canBo.update({ shcc }, { danToc }, (error, item) => {
                    if (error || item == null) {
                        console.log("Update failed: ", shcc, error);
                    }
                    updateDanToc(row + 1);
                });
            };
            const updateNgayBatDauCongTac = (row = 9) => {
                console.log("update with idx = ", row);
                let stt = worksheet.getCell('A' + row).value;
                if (stt == null) {
                    process.exit();
                }
                let shcc = (worksheet.getCell('B' + row).value || '').toString().trim();
                let ngayBatDauCongTac = (worksheet.getCell('P' + row).value || '').toString().trim();
                ngayBatDauCongTac = new Date(ngayBatDauCongTac).getTime();
                if (isNaN(ngayBatDauCongTac)) ngayBatDauCongTac = '';
                app.model.canBo.update({ shcc }, { ngayBatDauCongTac }, (error, item) => {
                    if (error || item == null) {
                        console.log("Update failed: ", shcc, error);
                    }
                    updateNgayBatDauCongTac(row + 1);
                });
            };
            const updateMaDonVi = (row = 9) => {
                console.log("update with idx = ", row);
                let stt = worksheet.getCell('A' + row).value;
                if (stt == null) {
                    process.exit();
                }
                let shcc = (worksheet.getCell('B' + row).value || '').toString().trim();
                let donVi = (worksheet.getCell('N' + row).value || '').toString().trim();
                app.model.dmDonVi.getMaDonVi(donVi, (maDonVi, tenDonVi) => {
                    if (donVi == 'TT. Tin học') maDonVi = '54';
                    if (donVi == 'TT. Hàn Quốc học') maDonVi = '44';
                    // console.log("row = ", row, donVi, tenDonVi, maDonVi);
                    app.model.canBo.update({ shcc }, { maDonVi }, (error, item) => {
                        if (error || item == null) {
                            console.log("Update failed: ", shcc, error);
                        }
                        updateMaDonVi(row + 1);
                    });
                });
            };
            const updateGhiChu = (row = 9) => {
                console.log("update with idx = ", row);
                let stt = worksheet.getCell('A' + row).value;
                if (stt == null) {
                    process.exit();
                }
                let shcc = (worksheet.getCell('B' + row).value || '').toString().trim();
                let ghiChu = (worksheet.getCell('AP' + row).value || '').toString().trim();
                app.model.canBo.update({ shcc }, { ghiChu }, (error, item) => {
                    if (error || item == null) {
                        console.log("Update failed: ", shcc, error);
                    }
                    updateGhiChu(row + 1);
                });
            };
            const updateNgaySinhGioiTinh = (row = 9) => {
                console.log("update with idx = ", row);
                let stt = worksheet.getCell('A' + row).value;
                if (stt == null) {
                    process.exit();
                }
                let shcc = (worksheet.getCell('B' + row).value || '').toString().trim();
                let phai = '01', ngaySinh = worksheet.getCell('G' + row).value;
                if (ngaySinh == null) {
                    phai = '02';
                    ngaySinh = worksheet.getCell('H' + row).value;
                }
                ngaySinh = ngaySinh.toString().trim();
                ngaySinh = new Date(ngaySinh).getTime();
                if (isNaN(ngaySinh)) ngaySinh = '';
                app.model.canBo.update({ shcc }, { phai, ngaySinh }, (error, item) => {
                    if (error || item == null) {
                        console.log("Update failed: ", shcc, error);
                    }
                    updateNgaySinhGioiTinh(row + 1);
                });
            };
            //updateQueQuan();
            //updateDanToc();
            //updateTonGiao();
            //updateNgayBatDauCongTac();
            //updateMaDonVi();
            //updateGhiChu();
            //updateNgaySinhGioiTinh();
        }
    });
};

app.readyHooks.add('Run tool.updateDBTCHC_CAN_BO.js', {
    ready: () => app.database.oracle.connected && app.model && app.model.canBo,
    run
});