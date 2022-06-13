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

app.loadModules(false);

app.readyHooks.add('Run tool.sv.nganh.js', {
    ready: () => app.database.oracle.connected && app.model && app.model.fwStudents,
    run: () => {
        app.excel.readFile(app.path.join(__dirname, './data/NGANH_MAPPER.xlsx'), workbook => {
            if (workbook) {
                const worksheet = workbook.getWorksheet(1);
                let updating = (index = 1) => {
                    const getVal = (column, type, Default) => {
                        if (type === 'text') {
                            Default = Default ? Default : null;
                            const val = worksheet.getCell(column + index).text.trim();
                            return val === '' ? Default : (val == null ? '' : val);
                        }
                        if (type === 'date') {
                            Default = Default ? Default : null;
                            const val = worksheet.getCell(column + index).value;
                            if (val === '' || val === null) return Default;
                            if (typeof val == 'object') return val.getTime();
                            return val;
                        }
                    }
                    if (worksheet.getCell('A' + index).value == null) {

                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        console.log('Running done!');
                        process.exit();
                    }
                    const data = {
                        current: getVal('A', 'text'),
                        update: getVal('B', 'text'),
                    }
                    if (data) {
                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        process.stdout.write(`Update ${data.current} to ${data.update}`);
                        app.model.fwStudents.update({ maNganh: data.current }, { maNganh: data.update }, () => updating(index + 1));
                    }
                }
                if (worksheet) updating();
            }
        });
    }
});