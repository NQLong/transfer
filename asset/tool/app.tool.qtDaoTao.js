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
                let ansLbc = '10';
                let ansHt = '14';
                let ansLbcGhiChu = '';
                let ansHtGhiChu = '';
                let ansTd = '';
                let print = false;
                if (loaiBangCap) {
                    loaiBangCap = loaiBangCap.toString();
                    loaiBangCap = loaiBangCap.toLowerCase();
                    if (loaiBangCap == 'chứng nhận' || loaiBangCap == 'chứng chỉ') {
                        left = Math.min(left, index);
                        right = Math.max(right, index);
                        ansLbc = '9';
                        print = true;
                    }
                }
                // if (ansLbc == '-1') {
                //     if (hinhThuc) {
                //         hinhThuc = hinhThuc.toString();
                //         hinhThuc = hinhThuc.toLowerCase();
                //         if (hinhThuc == 'bồi dưỡng') {
                //             ansHt = '05';
                //             ansLbc = '05';
                //         }
                //         if (hinhThuc == 'chính quy') {
                //             ansLbc = '05';
                //             ansHt = '01';
                //         }
                //         if (hinhThuc == 'vừa học vừa làm' || hinhThuc == 'bán thời gian') {
                //             ansLbc = '05';
                //             ansHt = '02';
                //         }
                //     }
                //     if (ansLbc == '-1') ansLbc = '05';
                // }
                if (hinhThuc) {
                    hinhThuc = hinhThuc.toString();
                    hinhThuc = hinhThuc.toLowerCase();
                    if (hinhThuc == 'chính quy') ansHt = '1';
                    if (hinhThuc == 'vừa học vừa làm' || hinhThuc == 'bán thời gian') ansHt = '13';
                    if (hinhThuc == 'tập trung') ansHt = '8';
                    if (hinhThuc == 'ngắn hạn') ansHt = '7';
                    if (hinhThuc == 'trực tuyến') ansHt = '6';
                    if (hinhThuc == 'văn bằng 2') ansHt = '5';
                    if (hinhThuc == 'tại chức') ansHt = '4';
                    if (hinhThuc == 'chuyên tu') ansHt = '3';
                    if (hinhThuc == 'bồi dưỡng') ansHt = '2';

                }
                if (ansLbc == '10') {
                    if (ghiChuLoaiBangCap) ansLbcGhiChu = ghiChuLoaiBangCap;
                    else ansLbcGhiChu = loaiBangCap ? loaiBangCap : '';
                } else ansLbcGhiChu = ghiChuLoaiBangCap ? ghiChuLoaiBangCap : '';

                if (ansHt == '14') {
                    if (ghiChuHinhThuc) ansHtGhiChu = ghiChuHinhThuc;
                    else ansHtGhiChu = hinhThuc ? hinhThuc : '';
                } else ansHtGhiChu = ghiChuHinhThuc ? ghiChuHinhThuc : '';
                if (print) console.log(ansHt + ',' + ansLbc + ',' + ansTd + ',' + ansHtGhiChu + ',' + ansLbcGhiChu);
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