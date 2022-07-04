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

app.readyHooks.add('Run tool.sv2022.js', {
    ready: () => app.database.oracle.connected && app.model && app.model.fwStudents && app.model.dmTinhThanhPho && app.model.dtNganhDaoTao,
    run: async () => {
        let workbook = await app.excel.readFile(app.path.join(__dirname, './data/data.student.2022.xlsx'));
        if (workbook) {
            const worksheet = workbook.getWorksheet('Sheet1');
            if (worksheet) {
                let index = 2;
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
                    if (worksheet.getCell('D' + index).value == null) {
                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        console.log('Running done!');
                        process.exit();
                    } else {
                        const data = {
                            mssv: getVal('D', 'text'),
                            ho: getVal('E', 'text').toUpperCase(),
                            ten: getVal('F', 'text').toUpperCase(),
                            gioiTinh: getVal('G', 'text'),
                            ngaySinh: getVal('H', 'date'),
                            noiSinh: getVal('I', 'text'),
                            thuongTru: getVal('J', 'text'),
                            maNganh: getVal('P', 'text'),
                            loaiHinhDaoTao: getVal('R', 'text'),
                            emailCaNhan: getVal('U', 'text')
                        }
                        if (data) {
                            process.stdout.clearLine();
                            process.stdout.cursorTo(0);
                            process.stdout.write(`Import line ${index}`);
                            let [tinhThanh, nganh] = await Promise.all([app.model.dmTinhThanhPho.get({
                                statement: 'lower(ten) LIKE :thuongTru',
                                parameter: { thuongTru: `%${data.thuongTru.toLowerCase()}%` }
                            }), app.model.dtNganhDaoTao.get({ maNganh: data.maNganh })]);

                            if (!tinhThanh || !nganh) console.log('Error at line ', index);
                            else {
                                // console.log(nganh);
                                data.thuongTruMaTinh = tinhThanh.ma;
                                data.khoa = nganh.khoa;
                                data.emailTruong = `${data.mssv}@hcmussh.edu.vn`;
                                data.namTuyenSinh = 2022;
                            }
                            if (data.ngaySinh.toString().indexOf('/') != -1) {
                                let date = data.ngaySinh.split('/')[0];
                                let month = data.ngaySinh.split('/')[1];
                                let year = data.ngaySinh.split('/')[2];
                                data.ngaySinh = new Date(year, month - 1, date).getTime();
                            } else data.ngaySinh = data.ngaySinh.getTime();
                            // console.log(data.ngaySinh);
                            let newStudent = await app.model.fwUser.create({ studentId: data.mssv, lastName: data.ten, firstName: data.ho, email: data.emailTruong, isStudent: 1 });
                            if (!newStudent) console.log('Import fail at line ', index);
                            index++;
                        }
                    }
                }
            } else {
                console.log('Error: worksheet not found');
                process.exit(1);
            }
        } else {
            console.log('Error: workbook not found');
            process.exit(1);
        }

    }
});