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
app.loadModules(false);

const run = () => {
    app.excel.readFile(app.path.join(__dirname, './data/nghiphep-2022.xlsx'), workbook => {
        if (workbook) {
            const worksheet = workbook.getWorksheet(1);
            solve = (index = 12) => {
                let stt = worksheet.getCell('A' + index).value;
                if (stt == null) process.exit(1);
                let ho = (worksheet.getCell('C' + index).value || '').toString().trim();
                let ten = (worksheet.getCell('D' + index).value || '').toString().trim();
                let donVi = (worksheet.getCell('E' + index).value || '').toString().trim();
                app.model.dmDonVi.getMaDonVi(donVi, (maDonVi, tenDonVi) => {
                    app.model.canBo.getShccCanBo({ ho, ten, ngaySinh: null, maDonVi }, (error, shcc) => {
                        if (error || shcc == null) {
                            console.log("error = ", index, ho, ten, donVi, error);
                            solve(index + 1);
                        } else {
                            app.model.canBo.get( { shcc }, (error, itemCb) => {
                                app.model.dmDonVi.get({ ma: itemCb.maDonVi }, (error, itemDv) => {
                                    let tenDonVi = '';
                                    if (itemDv) tenDonVi = itemDv.ten;
                                    console.log(shcc);
                                    // console.log("test = ", index);
                                    // console.log(ho, ten, donVi);
                                    // console.log(itemCb.ho, itemCb.ten, tenDonVi);
                                    // console.log();
                                    solve(index + 1);
                                });
                            });
                        }
                    });
                });
            }
            if (worksheet) solve();
        }
    });
}

app.readyHooks.add('Run tool.qtNghiPhep.js', {
    ready: () => app.database.oracle.connected && app.model && app.model.canBo,
    run,
});