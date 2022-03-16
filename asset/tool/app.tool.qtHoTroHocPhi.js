let package = require('../../package');
const path = require('path');
// Variables ==================================================================
const app = {
    isDebug: !path.join(__dirname, '../../').startsWith('/var/www/'),
    fs: require('fs'), path,
    // mongodb: 'mongodb://localhost:27017/' + package.db.name,
    publicPath: path.join(__dirname, package.path.public),
    assetPath: path.join(__dirname, '../'),
    modulesPath: path.join(__dirname, '../../' + package.path.modules),
};
// Configure ==================================================================
require('../../config/common')(app);
require('../../config/io')(app);
require('../../config/lib/excel')(app);
require('../../config/lib/fs')(app);
require('../../config/lib/string')(app);
require('../../config/database')(app, package);

// Init =======================================================================
app.loadModules(false);

const getForm = (date) => {
    if (!date) return [null, null];
    let list = date.split('/'), size = list.length, format = 'dd/mm/yyyy';
    let dd = '01', mm = '01', yyyy = list[size - 1];
    if (size == 1) format = 'yyyy';
    if (size == 2) format = 'mm/yyyy';
    if (size >= 2) {
        mm = list[size - 2];
        if (mm.length < 2) mm = '0' + mm;
    }
    if (size >= 3) {
        dd = list[size - 3];
        if (dd.length < 2) dd = '0' + dd;
    }
    return [mm + '/' + dd + '/' + yyyy, format];
}

const convert = (s, c = ',') => {
    if (!s) return '\'\'' + c;
    return '\'' + s + '\'' + c;
}

app.readyHooks.add('Run tool.qtHoTroHocPhi.js', {
    ready: () => app.dbConnection && app.model && app.model.canBo,
    run: () => {
        app.excel.readFile('./data/hocphi.xlsx', workbook => {
            if (workbook) {
                const worksheet = workbook.getWorksheet(3);
                const solve = (index = 3) => {
                    let number = worksheet.getCell('A' + index).value;
                    if (number == null) {
                        process.exit(1);
                    }
                    let ngayQd = worksheet.getCell('B' + index).value;
                    if (ngayQd != null) {
                        ngayQd = ngayQd.toString().trim();
                        ngayQd = new Date(ngayQd).getTime();
                    }

                    let ho = (worksheet.getCell('C' + index).value || '').toString().trim();
                    let ten = (worksheet.getCell('D' + index).value || '').toString().trim();
                    let donvi = (worksheet.getCell('E' + index).value || '').toString().trim();
                    let noidung = (worksheet.getCell('H' + index).value || '').toString().trim();
                    let coso = (worksheet.getCell('J' + index).value || '').toString().trim();

                    if (coso.includes('ĐHQG-HCM')) {
                        if (coso.includes('KHXH&NV')) coso = '01';
                        else if (coso.includes('CNTT')) coso = '09';
                        else if (coso.includes('KHTN')) coso = '10';
                        else coso = '06';
                    }
                    if (coso.includes('ĐHQG-HN')) coso = '02';
                    if (coso.includes('viện KHXH')) coso = '03';
                    if (coso.includes('Lạc Hồng')) coso = '04';
                    if (coso.includes('Phát thanh')) coso = '05';
                    if (coso.includes('viện QLGD') || coso.includes('viện Quản lý giáo dục')) coso = '07';
                    if (coso.includes('Cty')) coso = '08';
                    if (coso.includes('BC&TT')) coso = '11';
                    if (coso.includes('Kinh tế')) coso = '12';

                    let hocky = (worksheet.getCell('L' + index).value || '').toString().trim();
                    let sotien = (worksheet.getCell('M' + index).value || '').toString().trim();
                    let hoso = (worksheet.getCell('N' + index).value || '').toString().trim();
                    let ghiChu = (worksheet.getCell('O' + index).value || '').toString().trim();
                    let batDau = worksheet.getCell('P' + index).value, batDauType = '';
                    if (batDau != null) {
                        batDau = batDau.toString().trim();
                        let fm = getForm(batDau);
                        batDau = fm[0];
                        batDauType = fm[1];
                        batDau = new Date(batDau).getTime();
                    }
                    let ketthuc = worksheet.getCell('R' + index).value, ketThucType = '';
                    if (ketthuc != null) {
                        ketthuc = ketthuc.toString().trim();
                        let fm = getForm(ketthuc);
                        ketthuc = fm[0];
                        ketThucType = fm[1];
                        ketthuc = new Date(ketthuc).getTime();
                    }

                    app.model.canBo.getAll({
                        statement: 'lower(ho) LIKE lower(:ho) AND lower(ten) LIKE lower(:ten) AND shcc <> \'%*%\'',
                        parameter: { ho: `%${ho}%`, ten: `%${ten}%` }
                    }, (error, items) => {
                        if (items.length > 0) {
                            let shcc = '-1', ok = 1;
                            if (items.length == 1) {
                                shcc = items[0].shcc;
                            } else {
                                let hoten = ho + ' ' + ten;
                                if (hoten == 'NGUYỄN THỊ HUYỀN') shcc = '403.0010';
                                if (hoten == 'NGUYỄN THỊ THU HIỀN') shcc = '413.0016';
                                if (shcc == '-1') ok = 0;
                            }
                            if (ok) {
                                let sql = 'INSERT INTO QT_HO_TRO_HOC_PHI (NGAY_LAM_DON, SHCC, NOI_DUNG, CO_SO_DAO_TAO, BAT_DAU, BAT_DAU_TYPE, KET_THUC, KET_THUC_TYPE, HOC_KY_HO_TRO, SO_TIEN, HO_SO, GHI_CHU) VALUES(';
                                sql += convert(ngayQd);
                                sql += convert(shcc);
                                sql += convert(noidung);
                                sql += convert(coso);
                                sql += convert(batDau);
                                sql += convert(batDauType);
                                sql += convert(ketthuc);
                                sql += convert(ketThucType);
                                sql += convert(hocky);
                                sql += convert(sotien);
                                sql += convert(hoso);
                                sql += convert(ghiChu, ');');
                                console.log(sql);
                            }
                        }
                        solve(index + 1);
                    });
                }
                if (worksheet) solve();
            }
        });
    }
});