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
require('../../config/io')(app);
require('../../config/lib/excel')(app);
require('../../config/lib/fs')(app);
require('../../config/lib/string')(app);
require('../../config/database')(app, package);

// Init =======================================================================
app.loadModules(false);
const run = () => {
    app.excel.readFile(app.path.join(app.assetPath, './data/DSCB.xlsx'), workbook => {
        if (workbook) {
            const worksheet = workbook.getWorksheet(1);
            solve = (index = 1) => {
                let number = worksheet.getCell('A' + index).value;
                if (number == null) {
                    process.exit(1);
                }
                let shcc = worksheet.getCell('B' + index).value;
                let ho = worksheet.getCell('C' + index).value;
                if (ho) {
                    ho = ho.toString().trim();
                }
                let ten = worksheet.getCell('D' + index).value;
                if (ten) {
                    ten = ten.toString().trim();
                }
                let ngaySinh = worksheet.getCell('E' + index).value;
                if (ngaySinh) {
                    ngaySinh = ngaySinh.toString().trim();
                }
                let donVi = worksheet.getCell('L' + index).value;
                if (donVi) {
                    donVi = donVi.toString().trim();
                }
                app.model.dmDonVi.getMaDonVi(donVi, (maDv, tenDv) => {
                    app.model.canBo.getShccCanBo({ho: ho, ten: ten, ngaySinh: ngaySinh, maDonVi: maDv }, (error, shccAns) => {
                        if (error || shccAns == null) {
                            //console.log(shcc + ',' + ho + ' ' + ten + ',' + donVi);
                        }
                        else {
                            if (shcc != shccAns) {
                                app.model.canBo.get({shcc: shcc}, (error, item) => {
                                    if (!error || item) {
                                        app.model.canBo.get({shcc: shccAns}, (error, item2) => {
                                            app.model.dmDonVi.get({ma: item2.maDonVi}, (error, itemDv) => {
                                                let nameDv = '';
                                                if (itemDv != null) nameDv = itemDv.ten;
                                                console.log(shcc + ' - ' + ho + ' ' + ten + ' - ' + donVi + "," + item2.shcc + ' - ' + item2.ho + ' ' + item2.ten + ' - ' + nameDv);
                                            });
                                        });
                                    }
                                })
                            }
                        }
                        solve(index + 1);
                    });
                });
            }
            if (worksheet) solve();
        }
    });
};

app.readyHooks.add('Run tool.testFileCanBo.js', {
    ready: () => app.dbConnection && app.model && app.model.canBo && app.model.dmDonVi,
    run,
});