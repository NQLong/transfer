let package = require('../../package');
const path = require('path');
// Variables ==================================================================
const app = {
    isDebug: !__dirname.startsWith('/var/www/'),
    fs: require('fs'),
    path,
    modulesPath: path.join(__dirname, '../../' + package.path.modules),
};
// Configure ==================================================================
require('../../config/common')(app);
require('../../config/lib/excel')(app);
require('../../config/io')(app);
require('../../config/lib/fs')(app);
require('../../config/lib/string')(app);
require('../../config/database')(app, package);


// Init =======================================================================
app.loadModules(false);
const errorList = [];

const run = () => app.excel.readFile(app.path.join(__dirname, 'DSCB.xlsx'), workbook => {
    if (workbook) {
        let errors = '';
        const worksheet = workbook.getWorksheet(1),
            solve = (index = 2) => {
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
                    if (errorList.length)
                        console.log(`Error on line(s): ${errorList.join(', ')}.`);
                    else console.log('All successfully');
                    process.exit();
                }
                const record = {
                    shcc: getVal('A', 'text'),
                    noiDung: getVal('B', 'text'),
                    ngayDi: getVal('C', 'date'),
                    ngayDiType: getVal('D', 'text', 'dd/mm/yyyy'),
                    ngayVe: getVal('E', 'date'),
                    ngayVeType: getVal('F', 'text', 'dd/mm/yyyy'),
                    soQuyetDinh: getVal('G', 'text'),
                    ngayQuyetDinh: getVal('H', 'date'),
                    mucDich: getVal('I', 'text'),
                    chiPhi: getVal('J', 'text'),
                    ghiChu: getVal('K', 'text'),
                    quocGia: getVal('L', 'date')
                }
                if (record) {
                    process.stdout.clearLine();
                    process.stdout.cursorTo(0);
                    process.stdout.write(`Importing line ${index} (shcc=${record.shcc})`);
                    app.model.qtDiNuocNgoai.create(record, error => {
                        if (error) {
                            console.log(` => Thêm qtNuocNgoai ${index} bị lỗi\n - data: ${JSON.stringify(record, null, 4)}\n - error: ${error}`);
                            errorList.push(index);
                        }
                        solve(index + 1);
                    });
                } else {
                    if (errors) console.log('\nError:', errors);
                    else console.log('\nDone');
                };


            }
        if (worksheet) {
            app.model.qtDiNuocNgoai.delete({}, error => {
                if (!error)
                    solve();
            })
        }

    }
});
app.readyHooks.add('Run tool.qtDiNuocNgoai.js', {
    ready: () => app.dbConnection && app.model && app.model.qtDiNuocNgoai && app.model.canBo && app.model.dmMucDichNuocNgoai && app.model.dmQuocGia,
    run,
});