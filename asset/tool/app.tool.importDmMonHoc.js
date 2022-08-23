let package = require('../../package');
const path = require('path');
// Variables ==================================================================
const app = {
    isDebug: !__dirname.startsWith('/var/www/'),
    fs: require('fs'),
    path,
    publicPath: path.join(__dirname, '../../', 'public'),
    assetPath: path.join(__dirname, '../'),
    modulesPath: path.join(__dirname, '../../', 'modules'),
    database: {},
    model: {}
};

if (!app.isDebug) package = Object.assign({}, package, require('../config.json'));
// Configure ==================================================================
require('../../config/common')(app);
require('../../config/lib/fs')(app);
require('../../config/lib/excel')(app);
require('../../config/lib/hooks')(app);
require('../../config/lib/utils')(app);
require('../../config/lib/string')(app);
require('../../config/database.oracleDB')(app, package);

// Init =======================================================================
app.loadModules(false);

// Init =======================================================================

app.loadModules(false);
const errorList = [];

const run = () => app.excel.readFile(app.path.join(__dirname, 'monHoc2022.xlsx'), workbook => {
    if (workbook) {
        let errors = '';
        const worksheet = workbook.getWorksheet(1),
            solve = (index = 2) => {
                const getVal = (column, type = null, Default = null) => {
                    if (type === 'text' || !type) {
                        Default = Default ? Default : null;
                        const val = worksheet.getCell(column + index).text.trim();
                        return val === '' ? Default : (val == null ? '' : val);
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
                    ma: getVal('A', 'text'),
                    tenVi: getVal('B', 'text'),
                    tenEn: getVal('G', 'text'),
                    tongTinChi: getVal('C', 'text', 0),
                    tongTiet: getVal('D', 'text', 0),
                    tietLt: getVal('E', 'text', 0),
                    tietTh: getVal('F', 'text', 0),
                    tinChiLt: Number(getVal('E', 'text', 0)) / 15,
                    tinChiTh: Number(getVal('F', 'text', 0)) / 30,
                    // tenTiengAnh: getVal('L', 'text', ''),
                    donVi: getVal('H'),
                    khoa: '',
                    ten: ''
                }
                if (record) {
                    process.stdout.clearLine();
                    process.stdout.cursorTo(0);
                    process.stdout.write(`Importing line ${index})`);
                    new Promise(resolve => {
                        record.ten = JSON.stringify({
                            vi: record.tenVi,
                            en: record.tenEn || ''
                        });
                        app.model.dmDonVi.get({
                            statement: 'lower(ten) LIKE :tenDonVi AND (maPl = 1 OR ma = 32 or ma = 33)',
                            parameter: {
                                tenDonVi: `%${record.donVi.toLowerCase().trim()}%`
                            }
                        }, (error, item) => {
                            if (error || !item) {
                                record.khoa = '';
                                resolve();
                            }
                            else {
                                record.khoa = item.ma;
                                resolve();
                            }
                        });
                    }).then(() => {
                        app.model.dmMonHoc.create(record, error => {
                            if (error) {
                                console.log(` => Thêm dòng ${index} bị lỗi\n - data: ${JSON.stringify(record, null, 4)}\n - error: ${error}`);
                                errorList.push(index);
                            }
                            solve(index + 1);
                        });
                    });

                } else {
                    if (errors) console.log('\nError:', errors);
                    else console.log('\nDone');
                };


            }
        if (worksheet) {
            app.model.dmMonHoc.delete({});
            solve();
        }

    }
});

app.readyHooks.add('Run tool.importDmMonHoc.js', {
    ready: () => app.database.oracle.connected && app.model && app.model.dmMonHoc && app.model.dmDonVi,
    run
});