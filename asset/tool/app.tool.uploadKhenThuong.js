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
// Table name: QT_KHEN_THUONG_ALL { loaiDoiTuong, ma, namDatDuoc, thanhTich, chuThich, id, diemThiDua, soQuyetDinh }

app.loadModules(false);
const run = () => {
    app.excel.readFile(app.path.join(__dirname, './data/QT_KHEN_THUONG_ALL.xlsx'), workbookKhenThuong => {
        if (workbookKhenThuong) {
            app.excel.readFile(app.path.join(__dirname, './data/OLD_TCHC_CAN_BO_khenthuong.xlsx'), workbookCanBo => {
                if (workbookCanBo) {
                    const worksheetKhenThuong = workbookKhenThuong.getWorksheet(1);
                    const worksheetCanBo = workbookCanBo.getWorksheet(1);
                    new Promise(resolve => {
                        let dataCanBo = [];
                        for (let row = 2; ; row++) {
                            let old_shcc = worksheetCanBo.getCell('C' + row).value;
                            if (old_shcc == null) {
                                break;
                            }
                            old_shcc = old_shcc.toString().trim();
                            let ho = (worksheetCanBo.getCell('B' + row).value || '').toString().trim();
                            let ten = (worksheetCanBo.getCell('A' + row).value || '').toString().trim();
                            let maDonVi = (worksheetCanBo.getCell('D' + row).value || '').toString().trim();
                            dataCanBo.push({
                                shcc: old_shcc, ho, ten, maDonVi
                            });
                        }
                        resolve(dataCanBo);
                    }).then((dataCanBo) => {
                        let shccFailed = new Set(), shccUsed = {};
                        const solve = (idx = 2) => {
                            let loaiDoiTuong = worksheetKhenThuong.getCell('A' + idx).value;
                            if (loaiDoiTuong == null) {
                                console.log("failed = ", shccFailed);
                                process.exit();
                            }
                            console.log("Create with row_id = ", idx);
                            let ma = (worksheetKhenThuong.getCell('B' + idx).value || '').toString().trim();
                            let namDatDuoc = (worksheetKhenThuong.getCell('C' + idx).value || '').toString().trim();
                            let thanhTich = (worksheetKhenThuong.getCell('D' + idx).value || '').toString().trim();
                            let chuThich = (worksheetKhenThuong.getCell('E' + idx).value || '').toString().trim();
                            let diemThiDua = (worksheetKhenThuong.getCell('F' + idx).value || '').toString().trim();
                            let soQuyetDinh = (worksheetKhenThuong.getCell('G' + idx).value || '').toString().trim();
                            if (loaiDoiTuong == '02') { //đối tượng là cán bộ
                                app.model.canBo.get({ shcc: ma }, (error, item) => {
                                    if ((error || item == null) && !shccUsed[ma]) {
                                        shccUsed[ma] = '-1';
                                        // console.log("Test with shcc = ", idx, ma);
                                        let hasShcc = false;
                                        for (let i = 0; i < dataCanBo.length; i++) {
                                            if (dataCanBo[i].shcc == ma) {
                                                const data = {
                                                    ho: dataCanBo[i].ho,
                                                    ten: dataCanBo[i].ten,
                                                    ngaySinh: null,
                                                    maDonVi: dataCanBo[i].maDonVi
                                                };
                                                hasShcc = true;
                                                app.model.canBo.getShccCanBo(data, (error, shcc) => {
                                                    shccUsed[ma] = shcc;
                                                    const items = {
                                                        loaiDoiTuong, namDatDuoc, thanhTich, chuThich, diemThiDua, soQuyetDinh,
                                                        ma: shcc,
                                                    }
                                                    app.model.qtKhenThuongAll.create(items, (error, item) => {
                                                        if (error || item == null) {
                                                            console.log("Create failed = ", items);
                                                        }
                                                        solve(idx + 1);
                                                    });
                                                    //// Validate to make sure that shcc in QT_KHEN_THUONG_ALL is shcc in TCHC_CAN_BO
                                                    // if (error || shcc == null) { 
                                                    //     console.log("Failed with shcc = ", ma, error);
                                                    //     shccFailed.add(ma);
                                                    //     solve(idx + 1);
                                                    // } else {
                                                    //     app.model.canBo.get({ shcc }, (error, item) => {
                                                    //         console.log("Old: ", data.ho, data.ten, ma, " New: ", item.ho, item.ten, item.shcc);
                                                    //         solve(idx + 1);
                                                    //     });
                                                    // }
                                                });
                                            }
                                        }
                                        if (!hasShcc) {
                                            console.log("No record in old database canbo with shcc = ", ma);
                                            solve(idx + 1);
                                        }
                                    } else {
                                        if (ma.includes('*') && !shccUsed[ma]) {
                                            console.log("stupid shcc=", ma);
                                        }
                                        const items = {
                                            loaiDoiTuong, namDatDuoc, thanhTich, chuThich, diemThiDua, soQuyetDinh,
                                            ma: shccUsed[ma] ? shccUsed[ma] : ma, ///make sure that shccUsed[ma] != -1
                                        }
                                        app.model.qtKhenThuongAll.create(items, (error, item) => {
                                            if (error || item == null) {
                                                console.log("Create failed = ", items);
                                            }
                                            solve(idx + 1);
                                        });
                                    }
                                });
                            } else {
                                const items = {
                                    loaiDoiTuong, namDatDuoc, thanhTich, chuThich, diemThiDua, soQuyetDinh, ma, 
                                }
                                app.model.qtKhenThuongAll.create(items, (error, item) => {
                                    if (error || item == null) {
                                        console.log("Create failed = ", items);
                                    }
                                    solve(idx + 1);
                                });
                            }
                        }
                        if (worksheetKhenThuong) solve();
                    }).catch((error) => {
                        console.log("Error load excel canbo = ", error);
                    });
                }
            });
        }
    });
};

app.readyHooks.add('Run tool.uploadKhenThuong.js', {
    ready: () => app.database.oracle.connected && app.model && app.model.canBo && app.model.dmDonVi && app.model.dmBoMon && app.model.qtKhenThuongAll,
    run
});