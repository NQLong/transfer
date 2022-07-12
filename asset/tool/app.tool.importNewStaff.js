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
require('../../config/lib/date')(app);
require('../../config/lib/fs')(app);
require('../../config/lib/string')(app);

app.loadModules(false);

app.readyHooks.add('Run tool.newStaff.js', {
    ready: () => app.database.oracle.connected && app.model && app.model.canBo,
    run: async () => {
        let workbook = await app.excel.readFile(app.path.join(__dirname, './data/newstaff22.xlsx'));
        if (workbook) {
            const worksheet = workbook.getWorksheet('01.7.2022');
            if (worksheet) {
                let index = 9;
                while (true) {
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
                            if (typeof val == 'object') return val;
                            return val;
                        }
                    }
                    if (worksheet.getCell('B' + index).value == null) {
                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        console.log('Running done!');
                        process.exit();
                    } else {
                        let item = {
                            shcc: getVal('B', 'text'),
                            emailTruong: getVal('C', 'text'),
                            ho: getVal('D', 'text'),
                            ten: getVal('E', 'text'),
                            donVi: getVal('L', 'text'),
                            ngaySinhNam: getVal('F', 'date'),
                            ngaySinhNu: getVal('G', 'date'),
                            cmnd: getVal('AH', 'text'),
                            cmndNgayCap: getVal('AI', 'date')?.getTime() || '',
                            cmndNoiCap: getVal('AJ', 'text') || '',
                            dienThoaiCaNhan: getVal('AK', 'text') || '',
                            isBienChe: getVal('AD', 'text') ? 1 : 0,
                            ngayBienChe: getVal('AE', 'date')?.getTime() || '',
                            dangVien: getVal('AF', 'text') ? 1 : 0,
                            ngach: getVal('P', 'text').toUpperCase(),
                            heSoLuong: Number(getVal('Q', 'text')).toFixed(2)
                        }
                        let canBo = await app.model.canBo.get({ shcc: item.shcc });
                        if (canBo) {
                            const donVi = await app.model.dmDonVi.get({ ma: canBo.maDonVi });
                            // console.log(`In database: ${canBo.shcc} ${canBo.ho} ${canBo.ten} ${donVi.ten}`);
                            // console.log(`In excel: ${item.shcc} ${item.ho} ${item.ten} ${item.donVi} \n`);
                            // ;
                        } else {
                            const donVi = await app.model.dmDonVi.get({
                                statement: 'lower(ten) LIKE :tenDonVi',
                                parameter: { tenDonVi: `%${item.donVi.trim().toLowerCase()}%` }
                            });
                            if (donVi) item.maDonVi = donVi.ma;
                            if (item.ngaySinhNam) {
                                item.ngaySinh = item.ngaySinhNam.getTime();
                                item.gioiTinh = '01';
                            } else {
                                item.ngaySinh = item.ngaySinhNu.getTime();
                                item.gioiTinh = '02';
                            }
                            if (item.isBienChe) {
                                item.ngayBienChe = item.ngayBienChe || 1;
                            }
                            if (isNaN(item.heSoLuong)) item.heSoLuong = '';

                            try {
                                await app.model.canBo.create(item);
                            } catch (e) {
                                console.log(e);
                            }

                        }
                        index++;
                    }
                }
            }
            else {
                console.log('Error: worksheet not found');
                process.exit(1);
            }
        } else {
            onsole.log('Error: workbook not found');
            process.exit(1);
        }
    }
});