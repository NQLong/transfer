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
require('../../config/database.oracleDB')(app, package);

// Init =======================================================================
app.loadModules(false);
const errorList = [];
const run = () => {
    app.excel.readFile(app.path.join(app.assetPath, './data/cong_van_den.xlsx'), async (workbook) => {
        if (workbook) {
            const worksheet = workbook.getWorksheet(1);
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


                let data = {
                    ngayNhan: getVal('D', 'date'),
                    donViGui: getVal('E', 'text'),
                    soCongVan: getVal('F', 'text'),
                    ngayCongVan: getVal('G', 'date'),
                    noiDung: getVal('H', 'text'),
                    ngayHetHan: getVal('J', 'date'),
                    chiDao: getVal('K', 'text'),
                };

                let condition = null;
                if (data.donViGui) {
                    condition = {
                        statement: 'lower(ten) LIKE :searchTerm',
                        parameter: { searchTerm: `%${data.donViGui.toLowerCase()}%` },
                    }
                }

                const object = {
                    "HT": {
                        id: '001.0068',
                        isGroup: 0
                    },
                    "P.ĐT": {
                        id: '33',
                        isGroup: 1
                    },
                    "BGH": {
                        id: '67',
                        isGroup: 1
                    },
                    "P.CTSV": {
                        id: '32',
                        isGroup: 1
                    },
                    "P. CTSV": {
                        id: '32',
                        isGroup: 1
                    },
                    "HT": {
                        id: '001.0068',
                        isGroup: 0
                    },
                    "P.ĐT": {
                        id: '33',
                        isGroup: 1
                    },
                    "P.HCTH": {
                        id: "29",
                        isGroup: 1
                    },
                    "P.HCTH(Lưu)": {
                        id: '29',
                        isGroup: 1
                    },
                    "P.SĐH": {
                        id: '37',
                        isGroup: 1
                    },
                    "TT TVHN-PTNNL": {
                        id: '55',
                        isGroup: 1
                    },
                    "TT NN": {
                        id: '52',
                        isGroup: 1
                    },
                    "P.KHTC": {
                        id: '34',
                        isGroup: 1
                    },
                    "P.ĐN&QLKH": {
                        id: '31',
                        isGroup: 1
                    },
                    "TTNN": {
                        id: '52',
                        isGroup: 1
                    },
                    "K.LT&QTVP": {
                        id: '10',
                        isGroup: 1
                    },
                    "K.NNH": {
                        id: '11',
                        isGroup: 1
                    },
                    "P.QTTB": {
                        id: "36",
                        isGroup: 1
                    },
                    "PHT P.T.Hạ": {
                        id: "001.0004",
                        isGroup: 0
                    },
                    "P.TT&QHDN": {
                        id: "39",
                        isGroup: 1
                    },
                    "K.CTXH": {
                        id: "2",
                        isGroup: 1
                    },
                    "K. Địa lý": {
                        id: "4",
                        isGroup: 1
                    },
                    "PHT P.T.Định": {
                        id: "001.0002",
                        isGroup: 0
                    },
                    "PHT L.H.Dũng": {
                        id: "410.0023",
                        isGroup: 0
                    },
                    "TT TH": {
                        id: "54",
                        isGroup: 1
                    },
                    "Chủ tịch HĐ Trường": {
                        id: "426.0001",
                        isGroup: 0
                    },
                    "TT. TVHN PTNNL": {
                        id: "55",
                        isGroup: 1
                    },
                    "TS. Lê thị Ngọc Điệp": {
                        id: "426.0001",
                        isGroup: 0
                    },
                    "K.GD": {
                        id: "7",
                        isGroup: 1
                    },
                    "P.TCCB": {
                        id: "30",
                        isGroup: 1
                    },
                    "P.KH-TC": {
                        id: "34",
                        isGroup: 1
                    },
                    "P. KHTC": {
                        id: "34",
                        isGroup: 1
                    },
                    "P.QT-TB": {
                        id: "36",
                        isGroup: 1
                    },
                    "P.QTTB": {
                        id: "36",
                        isGroup: 1
                    },
                    "TT.PTNT-SU": {
                        id: "53",
                        isGroup: 1
                    },
                    "K.LTH-QTVP": {
                        id: "10",
                        isGroup: 1
                    },
                    "ĐT": {
                        id: "33",
                        isGroup: 1
                    },
                    "QTTB": {
                        id: "36",
                        isGroup: 1
                    },
                    "PHT. L.H. Dũng": {
                        id: "410.0023",
                        isGroup: 0
                    },
                    "TCCB": {
                        id: "30",
                        isGroup: 1
                    },
                    "Ô. Việt": {
                        id: "414.0023",
                        isGroup: 0
                    },
                    "Ô. Gầu": {
                        id: "421.0007",
                        isGroup: 0
                    },
                    "K.HQH": {
                        id: "8",
                        isGroup: 1
                    },
                    "P.TCCB (đã triển khai)": {
                        id: "30",
                        isGroup: 1
                    },
                    "B. Loan (K. GD)": {
                        id: "415.0021",
                        isGroup: 0
                    },
                    "P. TTNN": {
                        id: '52',
                        isGroup: 1
                    },
                    "TTTH": {
                        id: "54",
                        isGroup: 1
                    },
                    "K.LT-QTVP": {
                        id: "10",
                        isGroup: 1
                    },
                    "TT. TVHN-PTNNL": {
                        id: "55",
                        isGroup: 1
                    },
                    "TT TVHN&PTNNL": {
                        id: "55",
                        isGroup: 1
                    },
                    "K. Lưu trữ &QTVP": {
                        id: "10",
                        isGroup: 1
                    },
                    "PHT. Hạ": {
                        id: "001.0004",
                        isGroup: 0
                    },
                    "CTSV": {
                        id: '32',
                        isGroup: 1
                    },
                    "P. ĐT": {
                        id: '33',
                        isGroup: 1
                    },
                    "Đoàn TN, HSV": {
                        id: '60',
                        isGroup: 1
                    },
                    "TT ĐTQT": {
                        id: '42',
                        isGroup: 1
                    }

                };
                let donViNhanArr = [];
                let nguoiNhanArr = [];
                const donViAndNguoiNhan = getVal('I', 'text');
                let donViAndNguoiNhanArr = [];
                if (donViAndNguoiNhan) {
                    if (donViAndNguoiNhan.indexOf(';') > 0) donViAndNguoiNhanArr = donViAndNguoiNhan.split(';')
                    else donViAndNguoiNhanArr = donViAndNguoiNhan.split('\m');
                };
                donViAndNguoiNhanArr.length > 0 && donViAndNguoiNhanArr.forEach((item) => {
                    if (object.hasOwnProperty(item)) {
                        if (object[item].isGroup === 1) donViNhanArr.push(object[item].id);
                        else nguoiNhanArr.push(object[item].id);
                    }
                });
                let donViNhanStr = donViNhanArr.join(';');
                let nguoiNhanStr = nguoiNhanArr.join(';');
                data.donViNhan = donViNhanStr;
                data.canBoNhan = nguoiNhanStr;
                if (condition) {
                    await app.model.dmDonViGuiCv.get(condition, '*', 'id', async (error, res) => {
                        if (error || res == null) {
                            // console.log(index + ': ' + searchTerm);
                            solve(index + 1);
                        } else {
                            console.log(res);
                            console.log(data);
                            data.donViGui = res.id;

                            process.stdout.clearLine();
                            process.stdout.cursorTo(0);
                            process.stdout.write(`Importing line ${index} (shcc=${data.donViGui})`);

                            await app.model.hcthCongVanDen.create(data, error => {
                                if (error) {
                                    console.log(` => Thêm qtNuocNgoai ${index} bị lỗi\n - data: ${JSON.stringify(data, null, 4)}\n - error: ${error}`);
                                    errorList.push(index);
                                }
                                solve(index + 1)
                            });
                        }
                    });
                } else {
                    process.stdout.clearLine();
                    process.stdout.cursorTo(0);
                    process.stdout.write(`Importing line ${index} (shcc=${data.donViGui})`);

                    await app.model.hcthCongVanDen.create(data, error => {
                        if (error) {
                            console.log(` => Thêm qtNuocNgoai ${index} bị lỗi\n - data: ${JSON.stringify(data, null, 4)}\n - error: ${error}`);
                            errorList.push(index);
                        }
                        solve(index + 1)
                    });
                }
                // }
            }
            if (worksheet) solve();
        }
    });
}

app.readyHooks.add('Run tool.qtNghiKhongLuong.js', {
    ready: () => app.dbConnection && app.model && app.model.canBo,
    run,
});