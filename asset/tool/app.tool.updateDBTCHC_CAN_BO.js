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
// Table name: TCHC_CAN_BO { ten, ho, phai, dienThoaiCaNhan, email, ngaySinh, ngayBatDauCongTac, ngayCbgd, ngayBienChe, ngayNghi, ngach, heSoLuong, bacLuong, mocNangLuong, ngayHuongLuong, tyLeVuotKhung, maChucVu, danToc, tonGiao, dangVien, maDonVi, phucLoi, nhaGiaoNhanDan, nhaGiaoUuTu, ghiChu, shcc, emailCaNhan, biDanh, dienThoaiBaoTin, ngheNghiepCu, cmnd, cmndNgayCap, cmndNoiCap, chucVuKhac, quocGia, chucDanh, trinhDoPhoThong, hocVi, chuyenNganh, sucKhoe, canNang, chieuCao, ngayNhapNgu, ngayXuatNgu, quanHamCaoNhat, hangThuongBinh, giaDinhChinhSach, danhHieu, maXaNoiSinh, maHuyenNoiSinh, maTinhNoiSinh, maXaNguyenQuan, maHuyenNguyenQuan, maTinhNguyenQuan, ngayVaoDang, ngayVaoDangChinhThuc, noiDangDb, noiDangCt, ngayVaoDoan, noiVaoDoan, soTheDang, soTruong, nhomMau, soBhxh, doanVien, namChucDanh, namHocVi, noiSinh, queQuan, thuongTruMaHuyen, thuongTruMaTinh, thuongTruMaXa, thuongTruSoNha, hienTaiMaHuyen, hienTaiMaTinh, hienTaiMaXa, hienTaiSoNha, userModified, lastModified, congDoan, ngayVaoCongDoan, maTheBhyt, noiKhamChuaBenhBanDau, quyenLoiKhamChuaBenh, doiTuongBoiDuongKienThucQpan, ngayBatDauBhxh, ngayKetThucBhxh, tuNhanXet, tinhTrangBoiDuong, namBoiDuong, khoaBoiDuong, trinhDoChuyenMon, namTotNghiep, tyLePhuCapThamNien, tyLePhuCapUuDai, loaiDoiTuongBoiDuong, cuNhan, thacSi, tienSi, chuyenNganhChucDanh, coSoChucDanh, donViTuyenDung, noiVaoCongDoan, isCvdt, isHdtn, hocViNoiTotNghiep }

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
                // queQuan
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
                // tonGiao
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
                // danToc
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
                // ngayBatDauCongTac
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
            const updateNgayBatDauGiangDay = (row = 9) => {
                console.log("update with idx = ", row);
                let stt = worksheet.getCell('A' + row).value;
                if (stt == null) {
                    process.exit();
                }
                let shcc = (worksheet.getCell('B' + row).value || '').toString().trim();
                // ngayCbgd
                let ngayCbgd = worksheet.getCell('P' + row).value;
                if (ngayCbgd) {
                    ngayCbgd = ngayCbgd.toString().trim();
                    ngayCbgd = new Date(ngayCbgd);
                    ngayCbgd = ngayCbgd.getTime();
                }
                app.model.canBo.update({ shcc }, { ngayCbgd }, (error, item) => {
                    if (error || item == null) {
                        console.log("Update failed: ", shcc, error);
                    }
                    updateNgayBatDauGiangDay(row + 1);
                });
            };
            const updateMaDonVi = (row = 9) => {
                console.log("update with idx = ", row);
                let stt = worksheet.getCell('A' + row).value;
                if (stt == null) {
                    process.exit();
                }
                // maDonVi
                let shcc = (worksheet.getCell('B' + row).value || '').toString().trim();
                let donVi = (worksheet.getCell('N' + row).value || '').toString().trim();
                app.model.dmDonVi.getMaDonVi(donVi, (maDonVi, tenDonVi) => {
                    if (donVi == 'TT. Tin học') maDonVi = '54';
                    if (donVi == 'TT. Hàn Quốc học') maDonVi = '44';
                    //console.log("row = ", row, donVi, tenDonVi, maDonVi);
                    //updateMaDonVi(row + 1);
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
                // ghiChu, isCvdt, isHdtn
                let isCvdt = 0, isHdtn = 0;
                if (ghiChu.includes('CVPV')) isCvdt = 1;
                if (ghiChu.includes('HĐ')) isHdtn = 1;
                app.model.canBo.update({ shcc }, { ghiChu, isCvdt, isHdtn }, (error, item) => {
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
                // phai, ngaySinh
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
            const updateHocVi = (row = 9) => {
                console.log("update with idx = ", row);
                let stt = worksheet.getCell('A' + row).value;
                if (stt == null) {
                    process.exit();
                }
                // hocVi, namHocVi, chuyenNganh, hocViNoiTotNghiep, trinhdoPhoThong 
                let shcc = (worksheet.getCell('B' + row).value || '').toString().trim();
                let trinhdo = (worksheet.getCell('Z' + row).value || '').toString().trim();
                let trinhDoPhoThong = '12/12';
                let hocVi = null, namHocVi = null;
                let chuyenNganh = null, hocViNoiTotNghiep = null;
                if (trinhdo == 'TS') hocVi = '02';
                else if (trinhdo == 'ThS') hocVi = '03';
                else if (trinhdo == 'CN') hocVi = '04';
                else if (trinhdo == 'KS') hocVi = '05';
                else if (trinhdo == 'PTTH') hocVi = '11';
                else if (trinhdo == 'CĐ') hocVi = '06';
                else if (trinhdo == 'TC') hocVi = '07';
                else if (trinhdo == 'TSKH') hocVi = '01';
                else trinhDoPhoThong = trinhdo;
                if (hocVi == '01' || hocVi == '02') {
                    namHocVi = worksheet.getCell('AH' + row).value;
                    if (namHocVi) {
                        namHocVi = namHocVi.toString().trim();
                        namHocVi = new Date(namHocVi);
                        namHocVi = namHocVi.getTime();
                    }
                    chuyenNganh = (worksheet.getCell('AG' + row).value || '').toString().trim();
                    hocViNoiTotNghiep = (worksheet.getCell('AF' + row).value || '').toString().trim();
                }
                if (hocVi == '03') {
                    chuyenNganh = (worksheet.getCell('AE' + row).value || '').toString().trim();
                    hocViNoiTotNghiep = (worksheet.getCell('AD' + row).value || '').toString().trim();
                }
                if (hocVi == '04' || hocVi == '05') {
                    chuyenNganh = (worksheet.getCell('AC' + row).value || '').toString().trim();
                    hocViNoiTotNghiep = (worksheet.getCell('AB' + row).value || '').toString().trim();
                }
                if (hocViNoiTotNghiep) {
                    if (hocViNoiTotNghiep == 'VN') {}
                    else if (hocViNoiTotNghiep.toLowerCase() == 'tây ban nha') hocViNoiTotNghiep = 'ES';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'ý') hocViNoiTotNghiep = 'IT';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'việt nam') hocViNoiTotNghiep = 'VN';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'trung quốc') hocViNoiTotNghiep = 'CN';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'hàn quốc') hocViNoiTotNghiep = 'KR';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'hq') hocViNoiTotNghiep = 'KR';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'nhật bản') hocViNoiTotNghiep = 'JP';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'nhật') hocViNoiTotNghiep = 'JP';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'nga') hocViNoiTotNghiep = 'RU';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'liên xô') hocViNoiTotNghiep = 'RU';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'thái lan') hocViNoiTotNghiep = 'TH';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'pháp') hocViNoiTotNghiep = 'FR';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'anh') hocViNoiTotNghiep = 'GB';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'anh (đào tạo tại singapore)') hocViNoiTotNghiep = 'GB';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'anh (liên kết)') hocViNoiTotNghiep = 'GB';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'úc') hocViNoiTotNghiep = 'AU';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'australia') hocViNoiTotNghiep = 'AU';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'đài loan') hocViNoiTotNghiep = 'TW';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'đức') hocViNoiTotNghiep = 'DE';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'mỹ') hocViNoiTotNghiep = 'US';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'hoa kỳ') hocViNoiTotNghiep = 'US';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'philippines') hocViNoiTotNghiep = 'PH';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'philipphine') hocViNoiTotNghiep = 'PH';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'new zealand') hocViNoiTotNghiep = 'NZ';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'canada') hocViNoiTotNghiep = 'CA';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'ấn độ') hocViNoiTotNghiep = 'IN';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'hà lan') hocViNoiTotNghiep = 'NL';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'ukraina') hocViNoiTotNghiep = 'UA';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'indonesia') hocViNoiTotNghiep = 'ID';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'áo') hocViNoiTotNghiep = 'AT';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'uzbekistan') hocViNoiTotNghiep = 'UZ';
                    else if (hocViNoiTotNghiep.toLowerCase() == 'malaysia') hocViNoiTotNghiep = 'MY';
                    else if (hocViNoiTotNghiep == 'LK Mỹ - VN') hocViNoiTotNghiep = 'VN,US';
                    else if (hocViNoiTotNghiep == 'Liên kết VN + Hoa kỳ') hocViNoiTotNghiep = 'VN,US';
                    else if (hocViNoiTotNghiep == 'Liên kết VN - Hoa Kỳ') hocViNoiTotNghiep = 'VN,US';
                    else if (hocViNoiTotNghiep == 'Liên kết VN-TBN') hocViNoiTotNghiep = 'VN,ES';
                    else if (hocViNoiTotNghiep == 'Canada, ý (2THS)') hocViNoiTotNghiep = 'CA,IT';
                    else if (hocViNoiTotNghiep == 'Liên kết Úc-VN') hocViNoiTotNghiep = 'AU,VN';
                    else if (hocViNoiTotNghiep == 'LK Úc-VN (ThS)') hocViNoiTotNghiep = 'AU,VN';
                    else if (hocViNoiTotNghiep == 'VN, Pháp') hocViNoiTotNghiep = 'VN,FR';
                    else if (hocViNoiTotNghiep == 'Liên kết Pháp-Đức-Úc') hocViNoiTotNghiep = 'FR,DE,AU';
                    else if (hocViNoiTotNghiep == 'Liên kết VN-Anh') hocViNoiTotNghiep = 'VN,GB';
                    else if (hocViNoiTotNghiep == 'Liên kết Úc- VN') hocViNoiTotNghiep = 'VN,AU';
                    else if (hocViNoiTotNghiep == 'Liên kết Úc-Sing-Việt') hocViNoiTotNghiep = 'VN,SG,VN';
                    else if (hocViNoiTotNghiep == 'ThS') hocViNoiTotNghiep = 'CH';
                    else console.log("test = ", hocViNoiTotNghiep);
                }
                //console.log("test = ", hocVi, namHocVi, chuyenNganh, hocViNoiTotNghiep);
                //updateHocVi(row + 1);
                app.model.canBo.update({ shcc }, { hocVi, namHocVi, chuyenNganh, trinhDoPhoThong, hocViNoiTotNghiep }, (error, item) => {
                    if (error || item == null) {
                        console.log("Update failed: ", shcc, error);
                    }
                    updateHocVi(row + 1);
                });
            };
            const updateChucDanhKhoaHocDanhHieu = (row = 9) => {
                //console.log("update with idx = ", row);
                let stt = worksheet.getCell('A' + row).value;
                if (stt == null) {
                    process.exit();
                }
                // chucDanh, namChucDanh, chuyenNganhChucDanh, danhHieu
                let shcc = (worksheet.getCell('B' + row).value || '').toString().trim();
                let chucDanh = worksheet.getCell('AI' + row).value;
                if (chucDanh) {
                    chucDanh = chucDanh.toString().trim();
                    if (chucDanh == 'GS') chucDanh = '01';
                    else if (chucDanh == 'PGS') chucDanh = '02';
                    // else console.log("chucDanh = ", chucDanh);
                    let namChucDanh = worksheet.getCell('AJ' + row).value;
                    if (namChucDanh) {
                        namChucDanh = namChucDanh.toString().trim();
                        namChucDanh = new Date(namChucDanh);
                        namChucDanh = namChucDanh.getTime();
                    }
                    let chuyenNganhChucDanh = (worksheet.getCell('AK' + row).value || '').toString().trim();
                    let danhHieu = (worksheet.getCell('AL' + row).value || '').toString().trim();
                    console.log("test = ", row, shcc, chucDanh, namChucDanh, chuyenNganhChucDanh, danhHieu);
                    app.model.canBo.update({ shcc }, { chucDanh, namChucDanh, chuyenNganhChucDanh, danhHieu }, (error, item) => {
                        if (error || item == null) {
                            console.log("Update failed: ", shcc, error);
                        }
                        updateChucDanhKhoaHocDanhHieu(row + 1);
                    });
                } else {
                    app.model.canBo.update({ shcc }, { chucDanh: null, namChucDanh: null, chuyenNganhChucDanh: null, danhHieu: null }, (error, item) => {
                        if (error || item == null) {
                            console.log("Update failed: ", shcc, error);
                        }
                        updateChucDanhKhoaHocDanhHieu(row + 1);
                    });
                }
            };
            const updateBienChe = (row = 9) => {
                console.log("update with idx = ", row);
                let stt = worksheet.getCell('A' + row).value;
                if (stt == null) {
                    process.exit();
                }
                // ngayBienChe
                let shcc = (worksheet.getCell('B' + row).value || '').toString().trim();
                let isBienChe = (worksheet.getCell('AM' + row).value || '').toString().trim();
                let ngayBienChe = null;
                if (isBienChe) {
                    ngayBienChe = worksheet.getCell('AN' + row).value;
                    if (ngayBienChe == null) ngayBienChe = 1;
                    else {
                        ngayBienChe = ngayBienChe.toString().trim();
                        ngayBienChe = new Date(ngayBienChe);
                        ngayBienChe = ngayBienChe.getTime();
                    }
                }
                app.model.canBo.update({ shcc }, { ngayBienChe }, (error, item) => {
                    if (error || item == null) {
                        console.log("Update failed: ", shcc, error);
                    }
                    updateBienChe(row + 1);
                });
            };
            const updateDangVien = (row = 9) => {
                console.log("update with idx = ", row);
                let stt = worksheet.getCell('A' + row).value;
                if (stt == null) {
                    process.exit();
                }
                // dangVien
                let shcc = (worksheet.getCell('B' + row).value || '').toString().trim();
                let dangVien = (worksheet.getCell('AO' + row).value || '').toString().trim();
                if (dangVien == 'X') dangVien = 1;
                else dangVien = 0;
                app.model.canBo.update({ shcc }, { dangVien }, (error, item) => {
                    if (error || item == null) {
                        console.log("Update failed: ", shcc, error);
                    }
                    updateDangVien(row + 1);
                });
            };
            const updateCMND = (row = 9) => {
                console.log("update with idx = ", row);
                let stt = worksheet.getCell('A' + row).value;
                if (stt == null) {
                    process.exit();
                }
                //cmnd, cmndNgayCap, cmndNoiCap
                let shcc = (worksheet.getCell('B' + row).value || '').toString().trim();
                let cmnd = (worksheet.getCell('AQ' + row).value || '').toString().trim();
                if (cmnd != '') {
                    let cmndNgayCap = worksheet.getCell('AR' + row).value;
                    if (cmndNgayCap) {
                        cmndNgayCap = cmndNgayCap.toString().trim();
                        cmndNgayCap = new Date(cmndNgayCap);
                        cmndNgayCap = cmndNgayCap.getTime();
                    }
                    let cmndNoiCap = (worksheet.getCell('AS' + row).value || '').toString().trim();
                    app.model.canBo.update({ shcc }, { cmnd, cmndNgayCap, cmndNoiCap }, (error, item) => {
                        if (error || item == null) {
                            console.log("Update failed: ", shcc, error);
                        }
                        updateCMND(row + 1);
                    });
                } else updateCMND(row + 1);
            };
            const updateIsHocVi = (row = 9) => {
                console.log("update with idx = ", row);
                let stt = worksheet.getCell('A' + row).value;
                if (stt == null) {
                    process.exit();
                }
                let shcc = (worksheet.getCell('B' + row).value || '').toString().trim();
                // cuNhan, thacSi, tienSi
                let cuNhan = 0, thacSi = 0, tienSi = 0;
                let chuyenNganhCuNhan = worksheet.getCell('AC' + row).value;
                let chuyenNganhThacSi = worksheet.getCell('AE' + row).value;
                let chuyenNganhTienSi = worksheet.getCell('AG' + row).value;
                if (chuyenNganhCuNhan) cuNhan = 1;
                if (chuyenNganhThacSi) thacSi = 1;
                if (chuyenNganhTienSi) tienSi = 1;
                // console.log("test = ", chuyenNganhCuNhan, cuNhan, chuyenNganhThacSi, thacSi, chuyenNganhTienSi, tienSi);
                // updateIsHocVi(row + 1);
                app.model.canBo.update({ shcc }, { cuNhan, thacSi, tienSi }, (error, item) => {
                    if (error || item == null) {
                        console.log("Update failed: ", shcc, error);
                    }
                    updateIsHocVi(row + 1);
                });
            };
            const updateLuong = (row = 9) => {
                //console.log("update with idx = ", row);
                let stt = worksheet.getCell('A' + row).value;
                if (stt == null) {
                    process.exit();
                }
                let shcc = (worksheet.getCell('B' + row).value || '').toString().trim();
                // ngach, heSoLuong, bacLuong, mocNangLuong, ngayHuongLuong, tyLeVuotKhung
                let ngach = (worksheet.getCell('R' + row).value || '').toString().trim();
                if (ngach[0] == '1' && ngach[1] != '.') {
                    if (ngach.length != 6) ngach += '0';
                }
                if (ngach[0] == '1' && ngach[1] == '.') {
                    ngach = '0' + ngach;
                    if (ngach.length != 6) ngach += '0';
                }
                let heSoLuong = worksheet.getCell('S' + row).value;
                if (heSoLuong) {
                    heSoLuong = parseFloat(heSoLuong).toFixed(2);
                }
                let tyLeVuotKhung = worksheet.getCell('T' + row).value;
                if (tyLeVuotKhung) {
                    tyLeVuotKhung = parseInt(tyLeVuotKhung * 100);
                }
                let mocNangLuong = worksheet.getCell('U' + row).value;
                if (mocNangLuong) {
                    mocNangLuong = mocNangLuong.toString().trim();
                    mocNangLuong = new Date(mocNangLuong);
                    mocNangLuong = mocNangLuong.getTime();
                }
                //console.log("test = ", heSoLuong, tyLeVuotKhung, mocNangLuong);
                //updateLuong(row + 1);
                app.model.canBo.update({ shcc }, { ngach, heSoLuong, tyLeVuotKhung, mocNangLuong }, (error, item) => {
                    if (error || item == null) {
                        console.log("Update failed: ", shcc, error);
                    }
                    updateLuong(row + 1);
                });
            };
            //updateQueQuan(); //updated
            //updateDanToc(); //updated
            //updateTonGiao(); //updated
            //updateNgayBatDauCongTac(); //updated
            //updateNgayBatDauGiangDay(); //updated
            //updateMaDonVi(); //updated
            //updateGhiChu(); //updated
            //updateNgaySinhGioiTinh(); //updated
            updateHocVi(); //updated, thiếu nơi tốt nghiệp
            //updateChucDanhKhoaHocDanhHieu(); //updated
            //updateBienChe(); //updated
            //updateDangVien(); //updated
            //updateCMND(); //updated
            //updateIsHocVi(); //updated
            //updateLuong(); //updated
        }
    });
};

app.readyHooks.add('Run tool.updateDBTCHC_CAN_BO.js', {
    ready: () => app.database.oracle.connected && app.model && app.model.canBo,
    run
});