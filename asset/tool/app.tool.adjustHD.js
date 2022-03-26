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
    app.excel.readFile(app.path.join(app.assetPath, 'dataHD.xlsx'), workbook => {
        if (workbook) {
            const worksheet = workbook.getWorksheet(1);
            solve = (index = 1) => {
                // let tenTinhThanhPho = worksheet.getCell('D' + index).value;
                // let tenQuanHuyen = worksheet.getCell('C' + index).value;
                // let tenPhuongXa = worksheet.getCell('B' + index).value;
                // let tenSoNha = worksheet.getCell('A' + index).value;
                // let shcc = worksheet.getCell('E' + index).value;

                // let ttTinhThanhPho = worksheet.getCell('I' + index).value;
                // let ttQuanHuyen = worksheet.getCell('H' + index).value;
                // let ttPhuongXa = worksheet.getCell('G' + index).value;
                // let ttSoNha = worksheet.getCell('F' + index).value;
                // let shcc = worksheet.getCell('E' + index).value;

                // let noiSinh = worksheet.getCell('K' + index).value;
                // let nguyenQuan = worksheet.getCell('L' + index).value;
                let trinhDo = worksheet.getCell('N' + index).value;
                let shcc = worksheet.getCell('M' + index).value;
                const searchTerm = trinhDo ? trinhDo : '';
                const condition = {
                    statement: 'lower(ten) LIKE :searchTerm',
                    parameter: { searchTerm: `%${searchTerm.toLowerCase()}%` },
                };

                if (trinhDo == null) {
                    process.exit(1);
                }
                else {
                    app.model.dmTrinhDo.getAll(condition, '*', 'ma', (error, data) => {
                        // if (data != null) {
                        //     app.model.dmQuanHuyen.get({ tenQuanHuyen: ttQuanHuyen.trim(), maTinhThanhPho: data.ma }, (er, qh) => {
                        //         if (qh != null && ttPhuongXa != null) {
                        //             // app.model.canBo.update({ shcc: shcc }, { thuongTruMaHuyen: qh.maQuanHuyen }, (error, kq) => {
                        //             //     if (kq != null) console.log(kq);
                        //             // });
                        //             // console.log(shcc + ' ' + ttQuanHuyen + ' ' + data.ma);
                        //             app.model.dmPhuongXa.get({ tenPhuongXa: ttPhuongXa.trim(), maQuanHuyen: qh.maQuanHuyen }, (err, px) => {
                        //                 if (px != null) {
                        //                     app.model.canBo.update({ shcc: shcc }, { thuongTruMaXa: px.maPhuongXa, thuongTruSoNha: ttSoNha }, (error, kq) => {
                        //                         if (kq != null) console.log(kq);
                        //                     });
                        //                     // console.log(shcc + ' ' + ttPhuongXa + ' ' + ttQuanHuyen + ' ' + qh.maQuanHuyen);

                        //                 }
                        //             });
                        //         }
                        //     });
                        //     // console.log(shcc + ' ' + ttTinhThanhPho);
                        //     // app.model.canBo.update({ shcc: shcc }, {thuongTruMaTinh : data.ma}, (error, kq) => {
                        //     //     if (kq != null) console.log(kq);
                        //     // })
                        // }
                        if (data != null) {
                            // app.model.canBo.get({ shcc: shcc, hopDongCanBo: 'LĐ' }, (err, canBo) => {
                            //     // if (!canBo.maTinhNguyenQuan) {
                            //     //     app.model.canBo.update({ shcc: shcc }, { maTinhNguyenQuan: data[0].ma }, (err, item) => {
                            //     //         if (item != null) console.log(item);
                            //     //     })
                            //     // }
                            //     if (!canBo.hopDongLaoDongNgay) {
                            //         console.log(canBo.shcc);
                            //     }
                            // })

                            if (data[0] != null) console.log(shcc + ' ' + trinhDo);
                        }
                        solve(index + 1);
                    });
                }

            }
            if (worksheet) solve();
        }


    });
};

app.readyHooks.add('Run tool.adjustHD.js', {
    ready: () => app.database.oracle.connected && app.model.canBo && app.model.qtHopDongLaoDong && app.model.dmTinhThanhPho && app.model.dmQuanHuyen && app.model.dmPhuongXa && app.model.dmTrinhDo,
    run,
});