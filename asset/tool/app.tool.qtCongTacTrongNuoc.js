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
const listVietTat = [
    'công tác',
    'hội thảo',
    'khóa học ngắn hạn',
    'bồi dưỡng',
    'tập huấn',
    'nghiên cứu',
    'thực tập thực tế',
    'thực tập chuyên môn',
    'tham dự tọa đàm',
    'tham dự hội nghị',
    'hội nghị',
    'thực tập tốt nghiệp',
    'chương trình bồi dưỡng ngắn hạn',
    'tham dự và chuẩn bị ý kiến',
    'tham dự chương trình bồi dưỡng',
    'đi thực tế',
    'đưa sv đi thực tập',
    'tọa đàm',
    'khảo sát',
    'nghiên cứu thực địa',
    'tham gia hội thảo',
    'tham dự khóa đào tạo',
    'tham dự hội thảo',
    'giảng dạy',
    'tham gia tổ công tác',
    'tham dự hội đồng kỳ thi',
    'định hướng nghề nghiệp',
    'kiến tập',
    'bồi dưỡng ngắn hạn',
    'tham dự tập huấn',
    'học tập kinh nghiệm',
    'thăm thân nhân',
    'học tiến sĩ',
    'lễ kỷ niệm',
    'học lớp trung cấp lý luận chính trị',
    'kỳ họp'
];
const convertVt = [
    '01',
    '02',
    '27',
    '04',
    '09',
    '08',
    '05',
    '06',
    '07',
    '03',
    '03',
    '10',
    '04',
    '14',
    '04',
    '11',
    '12',
    '07',
    '14',
    '08',
    '02',
    '15',
    '02',
    '16',
    '17',
    '18',
    '19',
    '20',
    '04',
    '09',
    '21',
    '22',
    '23',
    '24',
    '25',
    '26'
]
function lcs(a, b) {
    var m = a.length, n = b.length,
        C = [], i, j;
    for (i = 0; i <= m; i++) C.push([0]);
    for (j = 0; j < n; j++) C[0].push(0);
    for (i = 0; i < m; i++)
        for (j = 0; j < n; j++)
            C[i + 1][j + 1] = a[i] === b[j] ? C[i][j] + 1 : Math.max(C[i + 1][j], C[i][j + 1]);
    return C[m][n];
}

function bestChoice(s, t) {
    var n = s.length, m = t.length, cost = -1;
    if (m < n) {
        cost = lcs(s, t);
    }
    else {
        var i, j;
        for (i = 0; i < m - n + 1; i++) {
            let subT = t.substring(i, i + n);
            cost = Math.max(cost, lcs(s, subT));
        }
    }
    return cost;
}

const listTinh = [
    { ma: '01', ten: 'Thành phố Hà Nội', kichHoat: 1 },
    { ma: '02', ten: 'Tỉnh Hà Giang', kichHoat: 1 },
    { ma: '04', ten: 'Tỉnh Cao Bằng', kichHoat: 1 },
    { ma: '06', ten: 'Tỉnh Bắc Kạn', kichHoat: 1 },
    { ma: '08', ten: 'Tỉnh Tuyên Quang', kichHoat: 1 },
    { ma: '10', ten: 'Tỉnh Lào Cai', kichHoat: 1 },
    { ma: '11', ten: 'Tỉnh Điện Biên', kichHoat: 1 },
    { ma: '12', ten: 'Tỉnh Lai Châu', kichHoat: 1 },
    { ma: '14', ten: 'Tỉnh Sơn La', kichHoat: 1 },
    { ma: '15', ten: 'Tỉnh Yên Bái', kichHoat: 1 },
    { ma: '17', ten: 'Tỉnh Hòa Bình', kichHoat: 1 },
    { ma: '19', ten: 'Tỉnh Thái Nguyên', kichHoat: 1 },
    { ma: '20', ten: 'Tỉnh Lạng Sơn', kichHoat: 1 },
    { ma: '22', ten: 'Tỉnh Quảng Ninh', kichHoat: 1 },
    { ma: '24', ten: 'Tỉnh Bắc Giang', kichHoat: 1 },
    { ma: '25', ten: 'Tỉnh Phú Thọ', kichHoat: 1 },
    { ma: '26', ten: 'Tỉnh Vĩnh Phúc', kichHoat: 1 },
    { ma: '27', ten: 'Tỉnh Bắc Ninh', kichHoat: 1 },
    { ma: '30', ten: 'Tỉnh Hải Dương', kichHoat: 1 },
    { ma: '31', ten: 'Thành phố Hải Phòng', kichHoat: 1 },
    { ma: '33', ten: 'Tỉnh Hưng Yên', kichHoat: 1 },
    { ma: '34', ten: 'Tỉnh Thái Bình', kichHoat: 1 },
    { ma: '35', ten: 'Tỉnh Hà Nam', kichHoat: 1 },
    { ma: '36', ten: 'Tỉnh Nam Định', kichHoat: 1 },
    { ma: '37', ten: 'Tỉnh Ninh Bình', kichHoat: 1 },
    { ma: '38', ten: 'Tỉnh Thanh Hóa', kichHoat: 1 },
    { ma: '40', ten: 'Tỉnh Nghệ An', kichHoat: 1 },
    { ma: '42', ten: 'Tỉnh Hà Tĩnh', kichHoat: 1 },
    { ma: '44', ten: 'Tỉnh Quảng Bình', kichHoat: 1 },
    { ma: '45', ten: 'Tỉnh Quảng Trị', kichHoat: 1 },
    { ma: '46', ten: 'Tỉnh Thừa Thiên Huế', kichHoat: 1 },
    { ma: '48', ten: 'Thành phố Đà Nẵng', kichHoat: 1 },
    { ma: '49', ten: 'Tỉnh Quảng Nam', kichHoat: 1 },
    { ma: '51', ten: 'Tỉnh Quảng Ngãi', kichHoat: 1 },
    { ma: '52', ten: 'Tỉnh Bình Định', kichHoat: 1 },
    { ma: '54', ten: 'Tỉnh Phú Yên', kichHoat: 1 },
    { ma: '56', ten: 'Tỉnh Khánh Hòa', kichHoat: 1 },
    { ma: '58', ten: 'Tỉnh Ninh Thuận', kichHoat: 1 },
    { ma: '60', ten: 'Tỉnh Bình Thuận', kichHoat: 1 },
    { ma: '62', ten: 'Tỉnh Kon Tum', kichHoat: 1 },
    { ma: '64', ten: 'Tỉnh Gia Lai', kichHoat: 1 },
    { ma: '66', ten: 'Tỉnh Đắk Lắk', kichHoat: 1 },
    { ma: '67', ten: 'Tỉnh Đắk Nông', kichHoat: 1 },
    { ma: '68', ten: 'Tỉnh Lâm Đồng', kichHoat: 1 },
    { ma: '70', ten: 'Tỉnh Bình Phước', kichHoat: 1 },
    { ma: '72', ten: 'Tỉnh Tây Ninh', kichHoat: 1 },
    { ma: '74', ten: 'Tỉnh Bình Dương', kichHoat: 1 },
    { ma: '75', ten: 'Tỉnh Đồng Nai', kichHoat: 1 },
    { ma: '77', ten: 'Tỉnh Bà Rịa - Vũng Tàu', kichHoat: 1 },
    { ma: '79', ten: 'Thành phố Hồ Chí Minh', kichHoat: 1 },
    { ma: '80', ten: 'Tỉnh Long An', kichHoat: 1 },
    { ma: '82', ten: 'Tỉnh Tiền Giang', kichHoat: 1 },
    { ma: '83', ten: 'Tỉnh Bến Tre', kichHoat: 1 },
    { ma: '84', ten: 'Tỉnh Trà Vinh', kichHoat: 1 },
    { ma: '86', ten: 'Tỉnh Vĩnh Long', kichHoat: 1 },
    { ma: '87', ten: 'Tỉnh Đồng Tháp', kichHoat: 1 },
    { ma: '89', ten: 'Tỉnh An Giang', kichHoat: 1 },
    { ma: '91', ten: 'Tỉnh Kiên Giang', kichHoat: 1 },
    { ma: '92', ten: 'Thành phố Cần Thơ', kichHoat: 1 },
    { ma: '93', ten: 'Tỉnh Hậu Giang', kichHoat: 1 },
    { ma: '94', ten: 'Tỉnh Sóc Trăng', kichHoat: 1 },
    { ma: '95', ten: 'Tỉnh Bạc Liêu', kichHoat: 1 },
    { ma: '96', ten: 'Tỉnh Cà Mau', kichHoat: 1 }
]

function convertTinh(name) {
    if (name.includes('hcm')) return 49;
    let id = -1, bestCost = -1;
    for (let i = 0; i < listTinh.length; i++) {
        let cost = bestChoice(name, listTinh[i].ten.toLowerCase());
        if (cost > bestCost) {
            bestCost = cost;
            id = i;
        }
    }
    return id;
}

function convertListTinh(listName) {
    if (listName == null) return '';
    let list = listName.split(',')
    let ans = '';
    for (let i = 0; i < list.length; i++) {
        let name = list[i];
        name = name.toLowerCase().trim();
        let cv = convertTinh(name);
        if (cv != -1) {
            if (ans) ans += ',';
            ans += listTinh[cv].ma;
        }
    }
    return ans;
}
const run = () => {
    app.excel.readFile(app.path.join(app.assetPath, './data/cong-tac-trong-nuoc-2017-2021.xlsx'), workbook => {
        if (workbook) {
            const worksheet = workbook.getWorksheet(1);
            solve = (index = 2) => {
                let number = worksheet.getCell('A' + index).value;
                if (number == null) {
                    process.exit(1);
                }
                let ngayQd = worksheet.getCell('B' + index).value;
                if (ngayQd != null) {
                    ngayQd = ngayQd.toString().trim();
                    ngayQd = new Date(ngayQd).getTime();
                }

                let soCv = worksheet.getCell('C' + index).value;
                if (soCv != null) {
                    soCv = soCv.toString().trim();
                }
                let ho = worksheet.getCell('E' + index).value;
                if (ho != null) {
                    ho = ho.toString().trim();
                }
                let ten = worksheet.getCell('F' + index).value;
                if (ten != null) {
                    ten = ten.toString().trim();
                }
                ho = ho.toUpperCase().trim();
                ten = ten.toUpperCase().trim();

                let donvi = worksheet.getCell('H' + index).value;
                if (donvi != null) {
                    donvi = donvi.toString().trim();
                }
                let noiden = worksheet.getCell('I' + index).value;
                if (noiden != null) {
                    noiden = noiden.toString().trim();
                }
                noiden = convertListTinh(noiden);
                let viettat = worksheet.getCell('J' + index).value;
                let convert = '99';
                if (viettat != null) {
                    viettat = viettat.toString().trim().toLowerCase();
                    for (let i = 0; i < listVietTat.length; i++) {
                        if (listVietTat[i] == viettat) {
                            convert = convertVt[i];
                            break;
                        }
                    }
                }
                viettat = convert;

                let lydo = worksheet.getCell('K' + index).value;
                if (lydo != null) {
                    lydo = lydo.toString().trim();
                }
                let batdau = worksheet.getCell('L' + index).value;
                if (batdau != null) {
                    batdau = batdau.toString().trim();
                    batdau = new Date(batdau).getTime();
                }
                let ketthuc = worksheet.getCell('M' + index).value;
                if (ketthuc != null) {
                    ketthuc = ketthuc.toString().trim();
                    ketthuc = new Date(ketthuc).getTime();
                }
                let kinhphi = worksheet.getCell('O' + index).value;
                if (kinhphi != null) {
                    kinhphi = kinhphi.toString().trim();
                }
                let ghiChu = worksheet.getCell('P' + index).value;
                if (ghiChu != null) {
                    ghiChu = ghiChu.toString().trim();
                }
                app.model.canBo.getAll({ ho: ho, ten: ten }, (error, items) => {
                    if (items.length > 0) {
                        let shcc = '-1', ok = 1;
                        if (items.length == 1) {
                            shcc = items[0].shcc;
                        } else {
                            let hoten = ho + ' ' + ten;
                            if (hoten == 'ĐOÀN HỮU HOÀNG KHUYÊN') shcc = '411.001';
                            if (hoten == 'LÊ CHÍ LÂM') shcc = '413.001';
                            if (hoten == 'LÊ THỊ SINH HIỀN') shcc = '414.003';
                            if (hoten == 'NGUYỄN ĐĂNG NGUYÊN') shcc = '410.00002';
                            if (hoten == 'NGUYỄN THANH TUẤN') shcc = '414.002';
                            if (hoten == 'NGUYỄN THỊ LY') shcc = '404.0004';
                            if (hoten == 'NGUYỄN THỊ HUỆ') shcc = '010.5004';
                            if (hoten == 'NGUYỄN THỊ KIM CHÂU') shcc = '414.001';
                            if (hoten == 'NGUYỄN THỊ NHƯ NGỌC') shcc = '410.0032';
                            if (hoten == 'NGUYỄN THỊ THU HIỀN' && donvi.toLowerCase().includes('công tác')) shcc = '400.0003';
                            if (hoten == 'NGUYỄN VĂN HOÀNG' && donvi.toLowerCase().includes('du lịch')) shcc = '413.007';
                            if (hoten == 'NGUYỄN VĂN HOÀNG' && donvi.toLowerCase().includes('ngữ văn pháp')) shcc = '413.0007';
                            if (hoten == 'SƠN THANH TÙNG' && donvi.toLowerCase().includes('đô thị học')) shcc = '401.001';
                            if (shcc == '-1') ok = 0;
                        }
                        if (isNaN(ngayQd) || isNaN(batdau) || isNaN(ketthuc)) ok = 0;
                        if (ok) {
                            let sql = 'insert into QT_CONG_TAC_TRONG_NUOC columns(NGAY_QUYET_DINH, SO_CV, SHCC, NOI_DEN, VIET_TAT, LY_DO, BAT_DAU, BAT_DAU_TYPE, KET_THUC, KET_THUC_TYPE, KINH_PHI, GHI_CHU) values(';
                            if (ngayQd != null) {
                                sql += '\'' + ngayQd + '\'';
                                sql += ',';
                            } else {
                                sql += '\'' + '\'';
                                sql += ',';
                            }
                            if (soCv != null) {
                                sql += '\'' + soCv + '\'';
                                sql += ',';
                            } else {
                                sql += '\'' + '\'';
                                sql += ',';
                            }
                            if (shcc != null) {
                                sql += '\'' + shcc + '\'';
                                sql += ',';
                            } else {
                                sql += '\'' + '\'';
                                sql += ',';
                            }
                            if (noiden != null) {
                                sql += '\'' + noiden + '\'';
                                sql += ',';
                            } else {
                                sql += '\'' + '\'';
                                sql += ',';
                            }
                            if (viettat != null) {
                                sql += '\'' + viettat + '\'';
                                sql += ',';
                            } else {
                                sql += '\'' + '\'';
                                sql += ',';
                            }
                            if (lydo != null) {
                                sql += '\'' + lydo + '\'';
                                sql += ',';
                            } else {
                                sql += '\'' + '\'';
                                sql += ',';
                            }
                            if (batdau != null) {
                                sql += '\'' + batdau + '\'';
                                sql += ',';
                                sql += '\'' + 'dd/mm/yyyy' + '\'';
                                sql += ',';
                            } else {
                                sql += '\'' + '\'';
                                sql += ',';
                                sql += '\'' + '\'';
                                sql += ',';
                            }
                            if (ketthuc != null) {
                                sql += '\'' + ketthuc + '\'';
                                sql += ',';
                                sql += '\'' + 'dd/mm/yyyy' + '\'';
                                sql += ',';
                            } else {
                                sql += '\'' + '\'';
                                sql += ',';
                                sql += '\'' + '\'';
                                sql += ',';
                            }
                            if (kinhphi != null) {
                                sql += '\'' + kinhphi + '\'';
                                sql += ',';
                            } else {
                                sql += '\'' + '\'';
                                sql += ',';
                            }
                            if (ghiChu != null) {
                                sql += '\'' + ghiChu + '\'';
                                sql += ');';
                            } else {
                                sql += '\'' + '\'';
                                sql += ');';
                            }
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

app.readyHooks.add('Run tool.qtCongTacTrongNuoc.js', {
    ready: () => app.dbConnection && app.model && app.model.canBo && app.model.dmTinhThanhPho,
    run,
});