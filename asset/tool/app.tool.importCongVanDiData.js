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
// require('../../config/common')(app);
// require('../../config/lib/excel')(app);
// require('../../config/lib/fs')(app);
// require('../../config/lib/string')(app);
// require('../../config/database')(app, package.db);

// Configure ==================================================================
require('../../config/common')(app);
require('../../config/lib/excel')(app);
require('../../config/lib/fs')(app);
require('../../config/io')(app);
require('../../config/lib/string')(app);
require('../../config/database')(app, package);

// Init =======================================================================
app.loadModules(false);
const errorList = [];
const run = () => {
    app.excel.readFile(app.path.join(app.assetPath, './data/cong_van_di.xlsx'), async (workbook) => {
        if (workbook) {
            const object = {
                "Lê Thi Ngọc Điệp": {
                    id: "426.0001",
                    isGroup: 0
                },
                "Phan Thanh Huyền": {
                    id: "414.0021",
                    isGroup: 0
                },
                "Ngô Thanh Loan": {
                    id: "406.001",
                    isGroup: 0
                },
                "Phạm Tấn Hạ": {
                    id: "001.0004",
                    isGroup: 0
                },
                "Lê Thuý Ngân": {
                    id: "413.0014",
                    isGroup: 0
                },
                "Nguyễn Văn Thanh": {
                    id: "406.0007",
                    isGroup: 0
                },
                "Lương Đức Nhật": {
                    id: "014.5009",
                    isGroup: 0
                },
                "K HQH": {
                    id: "8",
                    isGroup:1
                },
                "Vũ Thị Bắc": {
                    id: "****445",
                    isGroup: 0
                },
                "Lê Hoàng Dũng": {
                    id: "410.0023",
                    isGroup: 0
                },
                "Sơn Thanh Tùng": {
                    id: "401.001",
                    isGroup: 0
                },
                "Ngô Tiến Quân": {
                    id: "014.5010",
                    isGroup: 0
                },
                "Nguyễn Văn Chất": {
                    id: "406.0005",
                    isGroup: 0
                },
                "Lê Thị Nhuần": {
                    id: "012.5008",
                    isGroup: 0
                },
                "TTĐT&PTNNL": {
                    id: "43",
                    isGroup: 1
                },
                "K. Du lịch": {
                    id: "3",
                    isGroup: 1
                },
                "Khoa du lịch": {
                    id: "3",
                    isGroup: 1
                },
                "K Lịch sử": {
                    id: "9",
                    isGroup: 1
                },
                "K Đông phương học": {
                    id: "6",
                    isGroup: 1
                },
                "GD": {
                    id: "7",
                    isGroup: 1
                },
                "Chi K. GD": {
                    id: "7",
                    isGroup: 1
                },
                "K Tâm lý": {
                    id: "22",
                    isGroup: 1
                },
                "K Tâm lý": {
                    d: "22",
                    isGroup: 1
                },
                "TT ĐTQT": {
                    id: "42",
                    isGroup: 1
                },
                "K TVTTH": {
                    id: "23",
                    isGroup: 1
                },
                "Khoa địa lý": {
                    id: "4",
                    isGroup: 1
                },
                "K. địa lý": {
                    id: "4",
                    isGroup: 1
                },
                "K địa lý": {
                    id: "4",
                    isGroup: 1
                },
                "Khoa ngôn ngữ học": {
                    id: "11",
                    isGroup: 1
                },
                "Khoa Nga": {
                    id: "14",
                    isGroup: 1
                },
                "TTĐTQT": {
                    id: "42",
                    isGroup: 1
                },
                "Trung tâm đào tạo quốc tế": {
                    id: "42",
                    isGroup: 1
                },
                "K.VNH": {
                    id: "27",
                    isGroup: 1
                },
                "Khoa Anh": {
                    id: "12",
                    isGroup: 1
                },
                "Khoa Nhân học": {
                    id: "19",
                    isGroup: 1
                },
                "Khoa XHH": {
                    id: "28",
                    isGroup: 1
                },
                "Khoa TVTTH": {
                    id: "23",
                    isGroup: 1
                },
                "TVTTH": {
                    id: "23",
                    isGroup: 1
                },
                "K thư viện TTH": {
                    id: "23",
                    isGroup: 1
                },
                "TT TVHN": {
                    id: "55",
                    isGroup: 1
                },
                "K.GD": {
                    id: "7",
                    isGroup: 1
                },
                "K.LTH-QTVP": {
                    id: "10",
                    isGroup: 1
                }
            }
            /// sheet 1
            const worksheet = workbook.getWorksheet('P.TCCB');
            solve = async (index = 2) => {
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
                        if (typeof val == 'object') return val.getTime();
                        return val;
                    }
                }
                
                if (worksheet.getCell('B' + index).value === null) {
                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        console.log('Running done!');
                        if (errorList.length)
                            console.log(`Error on line(s): ${errorList.join(', ')}.`);
                        else console.log('All successfully');
                        process.exit();
                };
                
                let record = {
                    noiDung: getVal('D', 'text'),
                    ngayGui: getVal('B', 'date'),
                    ngayKy: getVal('C', 'date'),
                    donViGui: 30
                };
                
                    let donViNhanArr = [];
                    let nguoiNhanArr = [];
                    const donViAndNguoiNhan = getVal('E', 'text');
                    let donViAndNguoiNhanArr = [];
                    if (donViAndNguoiNhan) {
                        if (donViAndNguoiNhan.indexOf(';') > 0) donViAndNguoiNhanArr = donViAndNguoiNhan.split(';') 
                        else donViAndNguoiNhanArr = donViAndNguoiNhan.split('\n');
                    };
                    donViAndNguoiNhanArr.length > 0 && donViAndNguoiNhanArr.forEach((item) => {
                        if (object.hasOwnProperty(item)) {
                            if (object[item].isGroup === 1) donViNhanArr.push(object[item].id);
                            else nguoiNhanArr.push(object[item].id);
                        }
                    });
                    let donViNhanStr = donViNhanArr.join(';');
                    let nguoiNhanStr = nguoiNhanArr.join(';');
                    record.donViNhan = donViNhanStr;
                    record.canBoNhan = nguoiNhanStr;
                    process.stdout.clearLine();
                    process.stdout.cursorTo(0);
                    process.stdout.write(`Importing line ${index} (shcc=${record.donViGui})`);
                                    
                     await app.model.hcthCongVanDi.create(record, error => {
                            if (error) {
                                console.log(` => Thêm qtNuocNgoai ${index} bị lỗi\n - data: ${JSON.stringify(record, null, 4)}\n - error: ${error}`);
                                errorList.push(index);
                            }
                            solve(index + 1)
                    });

            
               // }
            }    
            if (worksheet) solve();

            // sheet 2
            const worksheet1 = workbook.getWorksheet('P. ĐT');
            solve1 = async (index = 2) => {
                const getVal = (column, type, Default) => {
                    if (type === 'text') {
                        Default = Default ? Default : null;
                        const val = worksheet1.getCell(column + index).text.trim();
                        return val === '' ? Default : (val == null ? '' : val);
                    }
                    if (type === 'date') {
                        Default = Default ? Default : null;
                        const val = worksheet1.getCell(column + index).value;
                        if (val === '' || val === null) return Default;
                        if (typeof val == 'object') return val.getTime();
                        return val;
                    }
                }
                
                if (worksheet1.getCell('D' + index).value === null) {
                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        console.log('Running done!');
                        if (errorList.length)
                            console.log(`Error on line(s): ${errorList.join(', ')}.`);
                        else console.log('All successfully');
                        process.exit();
                };
                
                let record = {
                    noiDung: getVal('D', 'text'),
                    ngayGui: getVal('B', 'date'),
                    ngayKy: getVal('C', 'date'),
                    donViGui: 33
                };
                
                    let donViNhanArr = [];
                    let nguoiNhanArr = [];
                    const donViAndNguoiNhan = getVal('E', 'text');
                    let donViAndNguoiNhanArr = [];
                    if (donViAndNguoiNhan) {
                        if (donViAndNguoiNhan.indexOf(';') > 0) donViAndNguoiNhanArr = donViAndNguoiNhan.split(';') 
                        else donViAndNguoiNhanArr = donViAndNguoiNhan.split('\n');
                    };
                    donViAndNguoiNhanArr.length > 0 && donViAndNguoiNhanArr.forEach((item) => {
                        if (object.hasOwnProperty(item)) {
                            if (object[item].isGroup === 1) donViNhanArr.push(object[item].id);
                            else nguoiNhanArr.push(object[item].id);
                        }
                    });
                    let donViNhanStr = donViNhanArr.join(';');
                    let nguoiNhanStr = nguoiNhanArr.join(';');
                    record.donViNhan = donViNhanStr;
                    record.canBoNhan = nguoiNhanStr;
                    process.stdout.clearLine();
                    process.stdout.cursorTo(0);
                    process.stdout.write(`Importing line ${index} (shcc=${record.donViGui})`);
                                    
                     await app.model.hcthCongVanDi.create(record, error => {
                            if (error) {
                                console.log(` => Thêm qtNuocNgoai ${index} bị lỗi\n - data: ${JSON.stringify(record, null, 4)}\n - error: ${error}`);
                                errorList.push(index);
                            }
                            solve1(index + 1)
                    });
               // }
            }    
            if (worksheet1) solve1();

            // sheet 3
            const worksheet2 = workbook.getWorksheet('P.KT&ĐBCL');
            solve2 = async (index = 2) => {
                const getVal = (column, type, Default) => {
                    if (type === 'text') {
                        Default = Default ? Default : null;
                        const val = worksheet2.getCell(column + index).text.trim();
                        return val === '' ? Default : (val == null ? '' : val);
                    }
                    if (type === 'date') {
                        Default = Default ? Default : null;
                        const val = worksheet2.getCell(column + index).value;
                        if (val === '' || val === null) return Default;
                        if (typeof val == 'object') return val.getTime();
                        return val;
                    }
                }
                
                if (worksheet2.getCell('D' + index).value === null) {
                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        console.log('Running done!');
                        if (errorList.length)
                            console.log(`Error on line(s): ${errorList.join(', ')}.`);
                        else console.log('All successfully');
                        process.exit();
                };
                
                let record = {
                    noiDung: getVal('D', 'text'),
                    ngayGui: getVal('B', 'date'),
                    ngayKy: getVal('C', 'date'),
                    donViGui: 35
                };
                
                    let donViNhanArr = [];
                    let nguoiNhanArr = [];
                    const donViAndNguoiNhan = getVal('E', 'text');
                    let donViAndNguoiNhanArr = [];
                    if (donViAndNguoiNhan) {
                        if (donViAndNguoiNhan.indexOf(';') > 0) donViAndNguoiNhanArr = donViAndNguoiNhan.split(';') 
                        else donViAndNguoiNhanArr = donViAndNguoiNhan.split('\n');
                    };
                    donViAndNguoiNhanArr.length > 0 && donViAndNguoiNhanArr.forEach((item) => {
                        if (object.hasOwnProperty(item)) {
                            if (object[item].isGroup === 1) donViNhanArr.push(object[item].id);
                            else nguoiNhanArr.push(object[item].id);
                        }
                    });
                    let donViNhanStr = donViNhanArr.join(';');
                    let nguoiNhanStr = nguoiNhanArr.join(';');
                    record.donViNhan = donViNhanStr;
                    record.canBoNhan = nguoiNhanStr;
                    process.stdout.clearLine();
                    process.stdout.cursorTo(0);
                    process.stdout.write(`Importing line ${index} (shcc=${record.donViGui})`);
                                    
                     await app.model.hcthCongVanDi.create(record, error => {
                            if (error) {
                                console.log(` => Thêm qtNuocNgoai ${index} bị lỗi\n - data: ${JSON.stringify(record, null, 4)}\n - error: ${error}`);
                                errorList.push(index);
                            }
                            solve2(index + 1)
                    });
               // }
            }    
            if (worksheet2) solve2();
        }
    });
}

app.readyHooks.add('Run tool.qtNghiKhongLuong.js', {
    ready: () => app.dbConnection && app.model && app.model.canBo,
    run,
});