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

const run = () => {
    app.excel.readFile(app.path.join(app.assetPath, './data/dsnghikl.xlsx'), workbook => {
        if (workbook) {
            const worksheet = workbook.getWorksheet(1);
            solve = (index = 5) => {
                let number = worksheet.getCell('A' + index).value;
                if (number == null) process.exit(1);
                let date = worksheet.getCell('Q' + index).value;
                if (date == null) {
                    console.log("");
                }
                else {
                    if (date) date = date.toString();
                    console.log("date = ", date);
                    let list = date.split('/');
                    let dd = list[0], mm = list[1], yyyy = list[2];
                    if (dd.length < 2) dd = '0' + dd;
                    if (mm.length < 2) mm = '0' + mm;
                    if (yyyy.length == 2) yyyy = '20' + yyyy;
                    console.log(mm + '/' + dd + '/' + yyyy);
                }
                solve(index + 1);
            }
            if (worksheet) solve();
        }
    });
}

app.readyHooks.add('Run tool.qtNghiKhongLuong.js', {
    ready: () => app.database.oracle.connected && app.model && app.model.canBo,
    run,
});