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

const run = () => {
    app.excel.readFile(app.path.join(app.assetPath, './data/QT_DAO_TAO_input.xlsx'), workbook => {
        if (workbook) {
            const worksheet = workbook.getWorksheet(1);
            let left = 1234567890;
            let right = -1234567890;
            solve = (index = 2) => {
                let id = worksheet.getCell('O' + index).value;
                if (id == null) {
                    console.log("left Index = ", left);
                    console.log("right Index = ", right);
                    process.exit(1);
                }
                let loaiBangCap = worksheet.getCell('G' + index).value;
                let hinhThuc = worksheet.getCell('F' + index).value;
                let ghiChuHinhThuc = worksheet.getCell('I' + index).value;
                let ghiChuLoaiBangCap = worksheet.getCell('J' + index).value;
                if (ghiChuHinhThuc) ghiChuHinhThuc = ghiChuHinhThuc.toString();
                if (ghiChuLoaiBangCap) ghiChuLoaiBangCap = ghiChuLoaiBangCap.toString();
                let ans_lbc = '10';
                let ans_ht = '14';
                let ans_lbc_ghichu = '';
                let ans_ht_ghichu = '';
                let ans_td = '';
                let print = false;
                if (loaiBangCap) {
                    loaiBangCap = loaiBangCap.toString();
                    loaiBangCap = loaiBangCap.toLowerCase();
                    if (loaiBangCap == 'chứng nhận' || loaiBangCap == 'chứng chỉ') {
                        left = Math.min(left, index);
                        right = Math.max(right, index);
                        ans_lbc = '9';
                        print = true;
                    }
                }
                // if (ans_lbc == '-1') {
                //     if (hinhThuc) {
                //         hinhThuc = hinhThuc.toString();
                //         hinhThuc = hinhThuc.toLowerCase();
                //         if (hinhThuc == 'bồi dưỡng') {
                //             ans_ht = '05';
                //             ans_lbc = '05';
                //         }
                //         if (hinhThuc == 'chính quy') {
                //             ans_lbc = '05';
                //             ans_ht = '01';
                //         }
                //         if (hinhThuc == 'vừa học vừa làm' || hinhThuc == 'bán thời gian') {
                //             ans_lbc = '05';
                //             ans_ht = '02';
                //         }
                //     }
                //     if (ans_lbc == '-1') ans_lbc = '05';
                // }
                if (hinhThuc) {
                    hinhThuc = hinhThuc.toString();
                    hinhThuc = hinhThuc.toLowerCase();
                    if (hinhThuc == 'chính quy') ans_ht = '1';
                    if (hinhThuc == 'vừa học vừa làm' || hinhThuc == 'bán thời gian') ans_ht = '13';
                    if (hinhThuc == 'tập trung') ans_ht = '8';
                    if (hinhThuc == 'ngắn hạn') ans_ht = '7';
                    if (hinhThuc == 'trực tuyến') ans_ht = '6';
                    if (hinhThuc == 'văn bằng 2') ans_ht = '5';
                    if (hinhThuc == 'tại chức') ans_ht = '4';
                    if (hinhThuc == 'chuyên tu') ans_ht = '3';
                    if (hinhThuc == 'bồi dưỡng') ans_ht = '2';

                }
                if (ans_lbc == '10') {
                    if (ghiChuLoaiBangCap) ans_lbc_ghichu = ghiChuLoaiBangCap;
                    else ans_lbc_ghichu = loaiBangCap ? loaiBangCap : '';
                } else ans_lbc_ghichu = ghiChuLoaiBangCap ? ghiChuLoaiBangCap : '';

                if (ans_ht == '14') {
                    if (ghiChuHinhThuc) ans_ht_ghichu = ghiChuHinhThuc;
                    else ans_ht_ghichu = hinhThuc ? hinhThuc : '';
                } else ans_ht_ghichu = ghiChuHinhThuc ? ghiChuHinhThuc : '';
                if (print) console.log(ans_ht + ',' + ans_lbc + ',' + ans_td + ',' + ans_ht_ghichu + ',' + ans_lbc_ghichu);
                // 01	Chính quy
                // 02	Vừa học vừa làm
                // 03	Từ xa
                // 04	Trực tuyến
                // 05	Bồi dưỡng
                // 06	Hình thức khác

                // 01	Chứng chỉ/Văn bằng ngoại ngữ
                // 02	Chứng chỉ/Văn bằng tin học
                // 03	Chứng chỉ/Văn bằng lý luận chính trị
                // 04	Chứng chỉ/Văn bằng quản lý nhà nước
                // 05	Chứng chỉ/Văn bằng khác
                // 06	Bằng đại học
                // 07	Cử nhân
                // 08	Kỹ sư
                // 09	Thạc sĩ
                // 10	Tiến sĩ
                // 11	Cao đẳng
                // 12	Trung cấp
                // 13	Khác

                solve(index + 1);
            }    
            if (worksheet) solve();
        }
    });
}

app.readyHooks.add('Run tool.qtDaoTao.js', {
    ready: () => app.dbConnection && app.model && app.model.canBo,
    run,
});