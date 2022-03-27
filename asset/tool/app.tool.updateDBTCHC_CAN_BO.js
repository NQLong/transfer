let package = require('../../package');
const path = require('path');
// Variables ==================================================================
const app = {
    isDebug: !path.join(__dirname, '../../').startsWith('/var/www/'),
    fs: require('fs'), path,
    database: {},
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
    app.excel.readFile(app.path.join(__dirname, 'DSCB.xlsx'), workbook => {
        if (workbook) {
            const worksheet = workbook.getWorksheet(1);
            const solve = (idx = 1) => {
                let stt = worksheet.getCell('A' + idx).value;
                if (stt == null) {
                    process.exit();
                }
                let shcc = (worksheet.getCell('B' + idx).value || '').toString().trim();
                let maCDNN = (worksheet.getCell('P' + idx).value || '').toString().trim();
                console.log('UPDATE TCHC_CAN_BO SET NGACH= ' + '\'' + maCDNN + '\'' + ' WHERE SHCC=' + '\'' + shcc + '\'');
                solve(idx + 1);
                // app.model.canBo.update({ shcc }, { ngach: maCDNN }, (error, item) => {
                //     if (error || item == null) {
                //         console.log("Error in shcc = ", shcc, error);
                //     } else {
                //         //console.log("shcc ok = ", shcc);
                //     }
                //     solve(idx + 1);
                // });
            }
            if (worksheet) solve();
        }
    });
};

app.readyHooks.add('Run tool.updateDBTCHC_CAN_BO.js', {
    ready: () => app.database.oracle.connected && app.model && app.model.canBo,
    run
});