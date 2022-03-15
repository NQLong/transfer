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
require('../../config/io')(app);
require('../../config/lib/excel')(app);
require('../../config/lib/fs')(app);
require('../../config/lib/string')(app);
require('../../config/database')(app, package);

// Init =======================================================================
app.loadModules(false);
function getForm(date) {
    if (!date) return [null, null];
    let list = date.split('/');
    let size = list.length;
    let format = 'dd/mm/yyyy';
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

function convert(s, c=',') {
    if (!s) return '\'\'' + c;
    return '\'' + s + '\'' + c;
}
const run = () => {
    app.excel.readFile(app.path.join(app.assetPath, './data/hocphi.xlsx'), workbook => {
        if (workbook) {
            const worksheet = workbook.getWorksheet(3);
            solve = (index = 3) => {
                let number = worksheet.getCell('A' + index).value;
                if (number == null) {
                    process.exit(1);
                }
                let ngayQd = worksheet.getCell('B' + index).value;
                if (ngayQd != null) {
                    ngayQd = ngayQd.toString().trim();
                    ngayQd = new Date(ngayQd).getTime();
                }
                
                let ho = worksheet.getCell('C' + index).value;
                if (ho != null) {
                    ho = ho.toString().trim();
                }
                let ten = worksheet.getCell('D' + index).value;
                if (ten != null) {
                    ten = ten.toString().trim();
                }
                ho = ho.toUpperCase().trim();
                ten = ten.toUpperCase().trim();

                let donvi = worksheet.getCell('E' + index).value;
                if (donvi != null) {
                    donvi = donvi.toString().trim();
                }
                let noidung = worksheet.getCell('G' + index).value;
                if (noidung != null) {
                    noidung = noidung.toString().trim();
                }
                let coso = worksheet.getCell('I' + index).value;
                if (coso != null) {
                    coso = coso.toString().trim();
                }
                if (coso) {
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
                }
                
                let hocky = worksheet.getCell('K' + index).value;
                if (hocky != null) {
                    hocky = hocky.toString().trim();
                }
                let sotien = worksheet.getCell('L' + index).value;
                if (sotien != null) {
                    sotien = sotien.toString().trim();
                }
                let hoso = worksheet.getCell('M' + index).value;
                if (hoso != null) {
                    hoso = hoso.toString().trim();
                }
                let ghiChu = worksheet.getCell('N' + index).value;
                if (ghiChu != null) {
                    ghiChu = ghiChu.toString().trim();
                }
                let batDau = worksheet.getCell('O' + index).value, batDauType = '';
                if (batDau != null) {
                    batDau = batDau.toString().trim();
                    let fm = getForm(batDau);
                    batDau = fm[0], batDauType = fm[1];
                    batDau = new Date(batDau).getTime();
                }
                let ketthuc = worksheet.getCell('Q' + index).value, ketThucType = '';
                if (ketthuc != null) {
                    ketthuc = ketthuc.toString().trim();
                    let fm = getForm(ketthuc);
                    ketthuc = fm[0], ketThucType = fm[1];
                    ketthuc = new Date(ketthuc).getTime();
                }
                app.model.canBo.getAll({ho: ho, ten: ten}, (error, items) => {
                    let newItems = [];
                    for (let idx = 0; idx < items.length; idx++) {
                        if (items[idx].shcc.includes('*')) continue;
                        newItems.push(items[idx]);
                    }
                    if (newItems.length > 0) {
                        let shcc = '-1', ok = 1;
                        if (newItems.length == 1) {
                            shcc = newItems[0].shcc;
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
                            sql += convert(ghiChu,');');
                            console.log(sql);
                        }
                    }
                    solve(index + 1);
                });
                //console.log("ngayQd = ", ngayQd);
                // if (isNaN(ngayQd)) {
                //     console.log("index = ", index, worksheet.getCell('B' + index).value);
                // }
            }
            if (worksheet) solve();
        }
    });
};

app.readyHooks.add('Run tool.qtHoTroHocPhi.js', {
    ready: () => app.dbConnection && app.model && app.model.canBo,
    run,
});