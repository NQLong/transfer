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
require('../../config/database')(app, package.db);

// Init =======================================================================
app.loadModules(false);

///Columns SHCC must not have any data is null
const run = () => {
    app.excel.readFile(app.path.join(app.assetPath, './data/TCHC_CAN_BO.xlsx'), workbook => {
        if (workbook) {
            const worksheet = workbook.getWorksheet(1);
            let numCols = 1;
            let listCols = [];
            while (true) {
                let name = worksheet.getCell(app.excel.numberToExcelColumn(numCols) + '1').value;
                listCols.push(name);
                if (name == null) {
                    numCols--;
                    break;
                }
                numCols += 1;
            }
            
            let keys = 'SHCC';
            let idKeys = listCols.indexOf(keys); ///base 0th
            solve = (row = 2) => {
                let cell = app.excel.numberToExcelColumn(idKeys + 1) + row;
                let data_key = worksheet.getCell(cell).value;
                if (data_key == null) process.exit(1);
                else data_key = data_key.toString();
                // console.log("Row = ", row, "Cell = ", cell, "Key = ", data_key);
                app.model.canBo.get({shcc: data_key}, (error, data) => {
                    if (data == null) {
                        console.log("keys", "=", data_key);
                        sql = 'INSERT INTO TCHC_CAN_BO (';
                        for (let col = 1; col <= numCols; col++) {
                            sql += listCols[col];
                            if (col != numCols) sql += ',';
                            else sql += ') ';
                        }
                        sql += 'VALUES (';
                        for (let col = 1; col <= numCols; col++) {
                            let data = worksheet.getCell(app.excel.numberToExcelColumn(col) + row).value;
                            if (data != null) data = data.toString();
                            else data = '';
                            sql += "'" + data + "'";
                            if (col != numCols) sql += ',';
                            else sql += ')';
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

app.readyHooks.add('Run tool.addCanBoFromDevToProd.js', {
    ready: () => app.dbConnection && app.model && app.model.canBo,
    run,
});