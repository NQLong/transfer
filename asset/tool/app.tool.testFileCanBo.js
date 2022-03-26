let package = require('../../package');
const path = require('path');
// Variables ==================================================================
const app = {
    isDebug: !path.join(__dirname, '../../').startsWith('/var/www/'),
    fs: require('fs'), path,
    //mongodb: 'mongodb://localhost:27017/' + package.db.name,
    publicPath: path.join(__dirname, package.path.public),
    assetPath: path.join(__dirname, '../'),
    modulesPath: path.join(__dirname, '../../' + package.path.modules)
};
// Configure ==================================================================
require('../../config/common')(app);
require('../../config/io')(app);
require('../../config/lib/excel')(app);
require('../../config/lib/fs')(app);
require('../../config/lib/string')(app);
require('../../config/database.oracleDB')(app, package);


// Init =======================================================================
app.loadModules(false);
const run = () => {
    app.excel.readFile(app.path.join(__dirname, './data/DSCB-1-1.xlsx'), workbook => {
        if (workbook) {
            const worksheet = workbook.getWorksheet(4);
            const solve = (idx = 3) => {
                let shcc = worksheet.getCell('A' + idx).value;
                if (shcc == null) {
                    process.exit();
                }
                shcc = shcc.toString().trim();
                let hoten = worksheet.getCell('B' + idx).value.toString().trim();
                let donvi = (worksheet.getCell('C' + idx).value || '').trim();
                let ghiChu = worksheet.getCell('D' + idx).value;
                app.model.canBo.get({ shcc }, (error, item) => {
                    if (error || item == null) {
                        console.log(shcc + ',' + hoten + ',' + donvi + ',' + ghiChu);
                    } else {
                        //console.log("shcc ok = ", shcc);
                    }
                    solve(idx + 1);
                });
            }
            if (worksheet) solve();
            // for (let idx = 2; idx <= 278; idx += 3) {
            //     let excel = worksheet.getCell('F' + idx).value.toString().trim();
            //     let db = worksheet.getCell('F' + (idx + 1)).value.toString().trim();
            //     excel = excel.split('-')[0].trim()
            //     db = db.split('-')[0].trim()
            //     excel = excel.replace('Trong file excel: ', '')
            //     db = db.replace('Trong cơ sở dữ liệu: ', '')
            //     console.log('UPDATE TCHC_CAN_BO SET SHCC=' + '\'' + excel + '\'' + ' WHERE SHCC=' + '\'' + db + '\'' + ';');
            // }
            // app.model.canBo.getAll((error, itemsCB) => {
            //     for (let i = 0; i < itemsCB.length; i++) {
            //         let has = false;
            //         for (let j = 1; ; j++) {
            //             let number = worksheet.getCell('A' + j).value;
            //             if (number == null) {
            //                 break;
            //             }
            //             let shcc = worksheet.getCell('B' + j).value;
            //             if (shcc) {
            //                 shcc = shcc.toString().trim();
            //                 if (itemsCB[i].shcc == shcc) {
            //                     has = true;
            //                     break;
            //                 }
            //             }
            //         }
            //         if (!has) {
            //             app.model.dmDonVi.get({ma: itemsCB[i].maDonVi}, (error, itemDv) => {
            //                 let nameDv = '';
            //                 if (itemDv != null) nameDv = itemDv.ten;
            //                 console.log(itemsCB[i].shcc + ',' + itemsCB[i].ho + ' ' + itemsCB[i].ten + ',' + nameDv);
            //             });
            //         }
            //     }
            // });
            // solve = (index = 1) => {
            //     let number = worksheet.getCell('A' + index).value;
            //     if (number == null) {
            //         process.exit(1);
            //     }
            //     let shcc = worksheet.getCell('B' + index).value;
            //     let ho = worksheet.getCell('C' + index).value;
            //     if (ho) {
            //         ho = ho.toString().trim();
            //     }
            //     let ten = worksheet.getCell('D' + index).value;
            //     if (ten) {
            //         ten = ten.toString().trim();
            //     }
            //     let ngaySinh = worksheet.getCell('E' + index).value;
            //     if (ngaySinh) {
            //         ngaySinh = ngaySinh.toString().trim();
            //     }
            //     let donVi = worksheet.getCell('L' + index).value;
            //     if (donVi) {
            //         donVi = donVi.toString().trim();
            //     }
            //     app.model.dmDonVi.getMaDonVi(donVi, (maDv, tenDv) => {
            //         app.model.canBo.getShccCanBo({ho: ho, ten: ten, ngaySinh: ngaySinh, maDonVi: maDv }, (error, shccAns) => {
            //             if (error || shccAns == null) {
            //                 //console.log(shcc + ',' + ho + ' ' + ten + ',' + donVi);
            //             }
            //             else {
            //                 if (shcc != shccAns) {
            //                     app.model.canBo.get({shcc: shcc}, (error, item) => {
            //                         if (error || item == null) {
            //                             app.model.canBo.get({shcc: shccAns}, (error, item2) => {
            //                                 app.model.dmDonVi.get({ma: item2.maDonVi}, (error, itemDv) => {
            //                                     let nameDv = '';
            //                                     if (itemDv != null) nameDv = itemDv.ten;
            //                                     console.log('Trong file excel: ' + shcc + ' - ' + ho + ' ' + ten + ' - ' + donVi + '\nTrong cơ sở dữ liệu: ' + item2.shcc + ' - ' + item2.ho + ' ' + item2.ten + ' - ' + nameDv + '\n');
            //                                 });
            //                             });
            //                         }
            //                     })
            //                 }
            //             }
            //             solve(index + 1);
            //         });
            //     });
            // }
            // if (worksheet) solve();
        }
    });
};

app.readyHooks.add('Run tool.testFileCanBo.js', {
    ready: () => app.database.oracle.connected && app.model && app.model.canBo && app.model.dmDonVi,
    run
});