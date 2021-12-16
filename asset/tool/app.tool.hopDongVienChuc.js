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
    app.excel.readFile(app.path.join(app.assetPath, 'dshdvc.xlsx'), workbook => {
        if (workbook) {
            const worksheet = workbook.getWorksheet(1);
            solve = (index = 2) => {
                let number = worksheet.getCell('A' + index).value;
                if (number == null) process.exit(1);
                let shcc = worksheet.getCell('H' + index).value;
                if (shcc != null) shcc = shcc.toString();
                let gioitinh = worksheet.getCell('I' + index).value;
                if (gioitinh != null) gioitinh = gioitinh.toString();
                if (gioitinh == 'Bà') gioitinh = '02';
                else gioitinh = '01';

                let ho = worksheet.getCell('J' + index).value;
                if (ho != null) ho = ho.toString().toUpperCase();
                let ten = worksheet.getCell('K' + index).value;
                if (ten != null) ten = ten.toString().toUpperCase();

                let trinhDo = worksheet.getCell('L' + index).value;
                if (trinhDo != null) trinhDo = trinhDo.toString().toLowerCase();;
                if (trinhDo == 'thạc sĩ') trinhDo = '03';
                if (trinhDo == 'cử nhân') trinhDo = '04';
                if (trinhDo == 'kỹ sư') trinhDo = '05';
                if (trinhDo == 'tiến sĩ') trinhDo = '02';
                if (trinhDo[0] != '0') {
                    console.log("Stupid with shcc trinh do = ", shcc, trinhDo);
                }
                let chuyen_nganh = worksheet.getCell('M' + index).value;
                if (chuyen_nganh != null) chuyen_nganh = chuyen_nganh.toString();
                let nam_tot_nghiep = worksheet.getCell('N' + index).value;
                if (nam_tot_nghiep != null) nam_tot_nghiep = nam_tot_nghiep.toString();
                let nghe_nghiep = worksheet.getCell('O' + index).value;
                if (nghe_nghiep != null) nghe_nghiep = nghe_nghiep.toString();
                
                let ngay_sinh = worksheet.getCell('P' + index).value;
                if (ngay_sinh != null) {
                    ngay_sinh = ngay_sinh.toString();
                    ngay_sinh = new Date(ngay_sinh).getTime();
                }
                let noi_sinh = worksheet.getCell('Q' + index).value;
                if (noi_sinh != null) noi_sinh = noi_sinh.toString();
                let nguyen_quan = worksheet.getCell('S' + index).value;
                if (nguyen_quan != null) nguyen_quan = nguyen_quan.toString();
                let dan_toc = worksheet.getCell('U' + index).value;
                if (dan_toc != null) dan_toc = dan_toc.toString().toLowerCase();
                if (dan_toc == 'kinh') dan_toc = '01';
                if (dan_toc == 'tày') dan_toc = '02';
                if (dan_toc[0] != '0') {
                    console.log("Stupid with shcc dan toc = ", shcc, dan_toc);
                }
                let ton_giao = worksheet.getCell('V' + index).value;
                if (ton_giao != null) ton_giao = ton_giao.toString().toLowerCase();
                if (ton_giao == 'cao đài') ton_giao = '04';
                if (ton_giao == 'không') ton_giao = '99';
                if (ton_giao == 'phật giáo') ton_giao = '01';
                if (ton_giao == 'thiên chúa giáo') ton_giao = '15';
                if (ton_giao == 'phật') ton_giao = '01';
                if (ton_giao == 'công giáo') ton_giao = '02';
                if (ton_giao[0] != '0' && ton_giao != '99' && ton_giao != '15') {
                    console.log("Stupid with shcc ton giao = ", shcc, ton_giao);
                }
                let noi_o = worksheet.getCell("AA" + index).value;
                if (noi_o != null) noi_o = noi_o.toString();
                let noi_o_tinh = worksheet.getCell('W' + index).value;
                if (noi_o_tinh != null) noi_o_tinh = noi_o_tinh.toString();
                let noi_o_huyen = worksheet.getCell('X' + index).value;
                if (noi_o_huyen != null) noi_o_huyen = noi_o_huyen.toString();
                let noi_o_phuong = worksheet.getCell('Y' + index).value;
                if (noi_o_phuong != null) noi_o_phuong = noi_o_phuong.toString();
                let noi_o_sonha = worksheet.getCell('Z' + index).value;
                if (noi_o_sonha != null) noi_o_sonha = noi_o_sonha.toString();

                let ho_khau = worksheet.getCell("AF" + index).value;
                if (ho_khau != null) ho_khau = ho_khau.toString();
                let ho_khau_tinh = worksheet.getCell('AB' + index).value;
                if (ho_khau_tinh != null) ho_khau_tinh = ho_khau_tinh.toString();
                let ho_khau_huyen = worksheet.getCell('AC' + index).value;
                if (ho_khau_huyen != null) ho_khau_huyen = ho_khau_huyen.toString();
                let ho_khau_phuong = worksheet.getCell('AD' + index).value;
                if (ho_khau_phuong != null) ho_khau_phuong = ho_khau_phuong.toString();
                let ho_khau_sonha = worksheet.getCell('AE' + index).value;
                if (ho_khau_sonha != null) ho_khau_sonha = ho_khau_sonha.toString();

                let dien_thoai = worksheet.getCell('AG' + index).value;
                if (dien_thoai != null) dien_thoai = dien_thoai.toString();
                
                let CMND = worksheet.getCell('AH' + index).value;
                if (CMND != null) CMND = CMND.toString();

                let CMND_ngay = worksheet.getCell('AI' + index).value;
                if (CMND_ngay != null) {
                    CMND_ngay = CMND_ngay.toString();
                    CMND_ngay = new Date(CMND_ngay).getTime();
                }

                let CMND_noicap = worksheet.getCell('AJ' + index).value;
                if (CMND_noicap != null) CMND_noicap = CMND_noicap.toString();

                let email = worksheet.getCell('BB' + index).value;
                if (email != null) email = email.toString();
                // console.log("Print with shcc = ", shcc);
                // console.log(shcc, gioitinh, ho, ten, trinhDo, chuyen_nganh, nam_tot_nghiep, nghe_nghiep);
                // console.log(ngay_sinh, noi_sinh, nguyen_quan, dan_toc, ton_giao);
                // console.log(noi_o);
                // console.log(noi_o_tinh, noi_o_huyen, noi_o_phuong, noi_o_sonha);
                // console.log(ho_khau);
                // console.log(ho_khau_tinh, ho_khau_huyen, ho_khau_phuong, ho_khau_sonha);
                // console.log(dien_thoai, CMND, CMND_ngay, CMND_noicap, email);
                // console.log();

                const changes = {
                    PHAI: gioitinh,
                    HO: ho,
                    TEN: ten,
                    TRINH_DO_CHUYEN_MON: trinhDo,
                    CHUYEN_NGANH: chuyen_nganh,
                    NGHE_NGHIEP_CU: nghe_nghiep,
                    NAM_TOT_NGHIEP: nam_tot_nghiep,
                    NGAY_SINH: ngay_sinh,
                    MA_TINH_NOI_SINH: noi_sinh,
                    MA_TINH_NGUYEN_QUAN: nguyen_quan,
                    DAN_TOC: dan_toc, 
                    TON_GIAO: ton_giao,
                    DIA_CHI_HIEN_TAI: noi_o,
                    HIEN_TAI_MA_TINH: noi_o_tinh,
                    HIEN_TAI_MA_HUYEN: noi_o_huyen,
                    HIEN_TAI_MA_XA: noi_o_phuong,
                    HIEN_TAI_SO_NHA: noi_o_sonha,
                    HO_KHAU: ho_khau,
                    THUONG_TRU_MA_TINH: ho_khau_tinh,
                    THUONG_TRU_MA_HUYEN: ho_khau_huyen,
                    THUONG_TRU_MA_XA: ho_khau_phuong,
                    THUONG_TRU_SO_NHA: ho_khau_sonha,
                    DIEN_THOAI_CA_NHAN: dien_thoai,
                    CMND: CMND,
                    CMND_NGAY_CAP: CMND_ngay,
                    CMND_NOI_CAP: CMND_noicap,
                }
                sql = 'UPDATE TCHC_CAN_BO SET '
                for (var key in changes) {
                    if (changes[key] != null && key != Object) {
                        sql += key + '=';
                        sql += "'" + changes[key] + "'";
                        if (key != 'CMND_NOI_CAP') sql += ',';
                        sql += ' ';
                    }
                }
                sql += 'WHERE SHCC = ' + "'" + shcc + "'" + ';';
                console.log(sql);
                solve(index + 1);
            }    
            if (worksheet) solve();
        }
    });
}

app.readyHooks.add('Run tool.hopDongVienChuc.js', {
    ready: () => app.dbConnection && app.model && app.model.canBo,
    run,
});