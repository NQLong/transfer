let package = require('../../package');
const path = require('path');
const { resolve } = require('path');
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

const run = () => app.excel.readFile(app.path.join(__dirname, 'DI_NUOC_NGOAI.xlsx'), workbook => {
    if (workbook) {
        const worksheet = workbook.getWorksheet('2017'),
            solve = (index = 3) => {
                if (worksheet.getCell('B' + index).value == null) {
                    process.stdout.clearLine();
                    process.stdout.cursorTo(0);
                    console.log('Running done!');
                    process.exit();
                }
                let ho = worksheet.getCell('E' + index).value, ten = worksheet.getCell('F' + index).value;
                let tgd = worksheet.getCell('L' + index).value, tgv = worksheet.getCell('M' + index).value, nqd = worksheet.getCell('B' + index).value;
                let md = worksheet.getCell('J' + index).value, sqd = worksheet.getCell('C' + index).value,
                    nd = worksheet.getCell('K' + index).value,
                    cp = worksheet.getCell('O' + index).value,
                    gc = worksheet.getCell('Q' + index).value;
                let country = worksheet.getCell('I' + index).value;

                const searchTerm = ho ? ho.trim() + ' ' + ten.trim() : '';
                const condition = {
                    statement: 'lower(trim(ho || \' \' || ten)) LIKE :searchTerm',
                    parameter: { searchTerm: `%${searchTerm.toLowerCase()}%` },
                };

                let search = md ? md.trim() : '';
                if (search.toLowerCase().includes('Gia hạn'.toLowerCase())) search = '16';
                else if (search.toLowerCase().includes('Thực tập'.toLowerCase())) search = 'Thực tập';
                else if (search.toLowerCase().includes('ThS'.toLowerCase()) ||
                    search.toLowerCase().includes('Thạc sỹ'.toLowerCase())) search = 'Học Thạc sĩ';
                else if (search.toLowerCase().includes('TS'.toLowerCase())) search = 'Học Tiến sĩ';
                else if (search.toLowerCase().includes('Nghỉ phép'.toLowerCase()) ||
                    search.toLowerCase().includes('du lịch'.toLowerCase()) ||
                    search.toLowerCase().includes('Tham quan'.toLowerCase())
                ) search = '12';
                else if (search.toLowerCase().includes('ngắn hạn')) search = '05';
                const cond = {
                    statement: 'lower(moTa) LIKE :searchT OR lower(ma) LIKE :searchT',
                    parameter: { searchT: `%${search.toLowerCase()}%` },
                }

                let searchCountry = country ? country.trim() : '';
                if (searchCountry.toLowerCase().includes('châu')) searchCountry = '';
                const condiCountry = {
                    statement: 'lower(ten_quoc_gia) LIKE :searchTe OR lower(country) LIKE :searchTe OR lower(ten_khac) LIKE :searchTe',
                    parameter: { searchTe: `%${searchCountry.toLowerCase()}%` },
                }

                // console.log(search);
                // app.model.dmQuocGia.get(condiCountry, (e, d) => {
                //     if (e || d == null) console.log(index + ': ' + searchCountry);
                //     else console.log(d.maCode);
                //     solve(index + 1);
                // });

                // app.model.dmMucDichNuocNgoai.get(cond, (e, d) => {
                //     if (e || d == null) search != '16' ? console.log(index + ': ' + search) : console.log(search);
                //     else console.log(d.ma);
                // solve(index + 1);
                // });
                app.model.canBo.get(condition, (error, data) => {
                    if (error || data == null) {
                        // console.log(index + ': ' + searchTerm);
                        solve(index + 1);
                    } else {
                        // console.log(data.shcc);
                        // nd ? console.log(nd) : console.log('');
                        // if (tgd == null) console.log(index);
                        // else if (typeof tgd === 'object') console.log(tgd.getTime());
                        // else console.log(tgd);
                        // if (tgv == null) console.log(index);
                        // else if (typeof tgv === 'object') console.log(tgv.getTime());
                        // else console.log(tgv);

                        // if (typeof nqd === 'object') {
                        //     console.log(nqd.getTime());
                        // }
                        // else console.log(index + ': ' + nqd);
                        // console.log(sqd);
                        // console.log(cp);
                        // gc ? console.log(gc) : console.log('');
                        // solve(index + 1);

                        // new Promise(resolve => {
                        //     app.model.dmMucDichNuocNgoai.get(cond, (e, d) => {
                        //         if (e || d == null) { search != '16' ? console.log(index + ': ' + search) : console.log(search); }
                        //         else { console.log(d.ma); }
                        //         resolve();
                        //     })
                        // }).then(() => {
                        //     solve(index + 1);
                        // });

                        new Promise(resolve => {
                            app.model.dmQuocGia.get(condiCountry, (e, d) => {
                                if (searchCountry == '') console.log('');
                                else if (e || d == null) console.log(index + ': ' + searchCountry);
                                else console.log(d.maCode);
                                resolve();
                            });
                        }).then(() => {
                            solve(index + 1);
                        });
                    }
                    // solve(index + 1);
                });
            }
        if (worksheet) {
            solve();
        }

    }
});
app.readyHooks.add('Run tool.diNuocNgoai.js', {
    ready: () => app.dbConnection && app.model && app.model.qtDiNuocNgoai && app.model.canBo && app.model.dmMucDichNuocNgoai && app.model.dmQuocGia,
    run,
});