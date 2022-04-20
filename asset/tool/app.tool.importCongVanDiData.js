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
app.database = {};
app.model = {};
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
    app.excel.readFile(app.path.join(app.assetPath, './data/cong_van_cac_phong.xlsx'), async (workbook) => {
        if (workbook) {
            const object = {
                "Lê Thi Ngọc Điệp": {
                    id: "426.0001",
                    isGroup: 0
                },
                "Trần Phú Huệ Quang": {
                    id: "426.0007",
                    isGroup: 0
                },
                "Phan Thanh Huyền": {
                    id: "414.0021",
                    isGroup: 0
                },
                "Trần Thị Nga": {
                    id: "415.0020",
                    isGroup: 0
                },
                "Phạm Quang Thanh Trà": {
                    id: "412.5101",
                    isGroup: 0
                },
                "Nguyễn Thị Thuỳ Duyên": {
                    id: "008.0002",
                    isGroup: 0
                },
                "Ngô Thanh Loan": {
                    id: "406.0010",
                    isGroup: 0
                },
                "Phạm Thanh Duy": {
                    id: "004.0001",
                    isGroup: 0
                },
                "Phạm Thị Bích Ngọc": {
                    id: "413.0009",
                    isGroup: 0
                },
                "Cao Thị Phương Dung": {
                    id: "410.0014",
                    isGroup: 0
                },
                "Phạm Tấn Hạ": {
                    id: "001.0004",
                    isGroup: 0
                },
                "Nguyễn Thị Thuý Dung": {
                    id: "415.0105",
                    isGroup: 0
                },
                "Nguyễn Thị Lam Anh": {
                    id: "403.0007",
                    isGroup: 0
                },
                "Lê Thuỳ Ngân": {
                    id: "413.0014",
                    isGroup: 0
                },
                "Trần Long": {
                    id: "426.0008",
                    isGroup: 0
                },
                "Nguyễn Thị Lan": {
                    id: "014.5013",
                    isGroup: 0
                },
                "Nguyễn Thanh Huy": {
                    id: "004.0002",
                    isGroup: 0
                },
                "Lê Công Bắc": {
                    id: "017.5101",
                    isGroup: 0
                },
                "Nguyễn Thị Phương Thảo": {
                    id: "400.01",
                    isGroup: 0
                },
                "Võ Thị Hoa": {
                    id: "421.0023",
                    isGroup: 0
                },
                "Nguyễn Thị Vân Hạnh": {
                    id: "406.0015",
                    isGroup: 0
                },
                "Nguyễn Công Lý": {
                    id: "425.0008",
                    isGroup: 0
                },
                "Phạm Thái Thuần": {
                    id: "419.0019",
                    isGroup: 0
                },
                "Dương Hoàng Lộc": {
                    id: "425.0026",
                    isGroup: 0
                },
                "Nguyễn Thị Hoài Châu": {
                    id: "403.0020",
                    isGroup: 0
                },
                "Cao Xuân Long": {
                    id: "421.0014",
                    isGroup: 0
                },
                "Đinh Thị Dung": {
                    id: "427.0019",
                    isGroup: 0
                },
                "Bùi Thị Thúy Nga": {
                    id: "416.0007",
                    isGroup: 0
                },
                "Bùi Thị Mỹ Linh": {
                    id: "402.001",
                    isGroup: 0
                },
                "Bùi Thị Vân Anh": {
                    id: "412.5103",
                    isGroup: 0
                },
                "Bùi Thu Hằng": {
                    id: "012.5002",
                    isGroup: 0
                },
                "Đặng Kiên Trung": {
                    id: "409.0005",
                    isGroup: 0
                },
                "Đặng Văn Thắng": {
                    id: "414.0019",
                    isGroup: 0
                },
                "Dương Ngọc Dũng": {
                    id: "419.0009",
                    isGroup: 0
                },
                "Dương Thành Thông": {
                    id: "420.5005",
                    isGroup: 0
                },
                "Dương Thị Hữu Hiền": {
                    id: "406.0013",
                    isGroup: 0
                },
                "Hồ Cẩm Nhung": {
                    id: "018.5002",
                    isGroup: 0
                },
                "Hoàng Thị Trang": {
                    id: "402.0015",
                    isGroup: 0
                },
                "Hoàng Tố Uyên": {
                    id: "410.5001",
                    isGroup: 0
                },
                "Hoàng Văn Việt": {
                    id: "414.0023",
                    isGroup: 0
                },
                "Huỳnh Anh Khoa": {
                    id: "416.5002",
                    isGroup: 0
                },
                "Huỳnh Kim Ngân": {
                    id: "***.79",
                    isGroup: 0
                },
                "Huỳnh Quốc Duy": {
                    id: "****468",
                    isGroup: 0
                },
                "Huỳnh Thị Minh Tú": {
                    id: "402.5003",
                    isGroup: 0
                },
                "Huỳnh Trọng Hiền": {
                    id: "403.0009",
                    isGroup: 0
                },
                "Khâu Đồ Hồng Anh": {
                    id: "026.5002",
                    isGroup: 0
                },
                "La Duy Tân": {
                    id: "402.0023",
                    isGroup: 0
                },
                "La Mai Thi Gia": {
                    id: "425.0013",
                    isGroup: 0
                },
                "Lê Chí Lâm": {
                    id: "413.0010",
                    isGroup: 0
                },
                "Lê Giang": {
                    id: "427.0001",
                    isGroup: 0
                },
                "Lê Hiền Anh": {
                    id: "402.0006",
                    isGroup: 0
                },
                "Lê Hoàng Bảo Trâm": {
                    id: "402.0101",
                    isGroup: 0
                },
                "Lê Minh Công": {
                    id: "422.0004",
                    isGroup: 0
                },
                "Lê Ngọc Bảo Trâm": {
                    id: "422.0013",
                    isGroup: 0
                },
                "Lê Quốc Khiêm": {
                    id: "008.5006",
                    isGroup: 0
                },
                "Lê Thị Đức Hải": {
                    id: "416.0011",
                    isGroup: 0
                },
                "Lê Thị Mai Liên": {
                    id: "422.0010",
                    isGroup: 0
                },
                "Lê Thị Minh Hằng": {
                    id: "427.0003",
                    isGroup: 0
                },
                "Lê Thị Ngọc Ánh": {
                    id: "410.0019",
                    isGroup: 0
                },
                "Lê Thị Tuyết Nga": {
                    id: "017.5100",
                    isGroup: 0
                },
                "Lê Thùy Ngân": {
                    id: "413.0014",
                    isGroup: 0
                },
                "Mai Kim Chi": {
                    id: "402.0016",
                    isGroup: 0
                },
                "Ngô Thị Thu Trang": {
                    id: "003.0002",
                    isGroup: 0
                },
                "Nguyễn Đăng Nguyên": {
                    id: "410.0002",
                    isGroup: 0
                },
                "Nguyễn Danh Minh Trí": {
                    id: "424.0012",
                    isGroup: 0
                },
                "Nguyễn Đình Phức": {
                    id: "423.0017",
                    isGroup: 0
                },
                "Nguyễn Hoàng Bảo Ngọc": {
                    id: "***.136",
                    isGroup: 0
                },
                "Nguyễn Hữu Nhân": {
                    id: "013.5005",
                    isGroup: 0
                },
                "Nguyễn Huỳnh Luân": {
                    id: "422.5002",
                    isGroup: 0
                },
                "Nguyễn Huỳnh Minh Phúc": {
                    id: "****1",
                    isGroup: 0
                },
                "Nguyễn Lê Ánh Phương": {
                    id: "416.5004",
                    isGroup: 0
                },
                "Nguyễn Lưu Tâm Anh": {
                    id: "031.5101",
                    isGroup: 0
                },
                "Nguyễn Ngọc Thơ": {
                    id: "007.0001",
                    isGroup: 0
                },
                "Nguyễn Quang Dũng": {
                    id: "419.0010",
                    isGroup: 0
                },
                "Nguyễn Tăng Nghị": {
                    id: "419.0014",
                    isGroup: 0
                },
                "Nguyễn Thanh Hải": {
                    id: "413.0013",
                    isGroup: 0
                },
                "Nguyễn Thảo Chi": {
                    id: "017.5002",
                    isGroup: 0
                },
                "Lưu Thụy Tố Lan": {
                    id: "***.48",
                    isGroup: 0
                },
                "Nguyễn Thị Đăng Khoa": {
                    id: "409.5101",
                    isGroup: 0
                },
                "Nguyễn Thị Diễm Huỳnh": {
                    id: "012.5101",
                    isGroup: 0
                },
                "Nguyễn Thị Hải": {
                    id: "012.5011",
                    isGroup: 0
                },
                "Nguyễn Thị Hồng Thắm": {
                    id: "410.0030",
                    isGroup: 0
                },
                "Nguyễn Thị Hương Diệu": {
                    id: "412.5009",
                    isGroup: 0
                },
                "Nguyễn Thị Ly": {
                    id: "402.0109",
                    isGroup: 0
                },
                "Nguyễn Thị Ngọc Hạnh": {
                    id: "409.5001",
                    isGroup: 0
                },
                "Nguyễn Thị Ngọc Khánh": {
                    id: "031.5001",
                    isGroup: 0
                },
                "Nguyễn Thị Ninh": {
                    id: "411.5001",
                    isGroup: 0
                },
                "Nguyễn Thị Thanh Hà": {
                    id: "427.0008",
                    isGroup: 0
                },
                "Nguyễn Thị Thanh Tùng": {
                    id: "400.0006",
                    isGroup: 0
                },
                "Nguyễn Thị Thu Ngân": {
                    id: "410.0022",
                    isGroup: 0
                },
                "Nguyễn Thị Thúy Dung": {
                    id: "415.0105",
                    isGroup: 0
                },
                "Nguyễn Thị Thùy Duyên": {
                    id: "008.0002",
                    isGroup: 0
                },
                "Nguyễn Thị Tú Anh": {
                    id: "026.5100",
                    isGroup: 0
                },
                "Nguyễn Thu Lan": {
                    id: "427.0011",
                    isGroup: 0
                },
                "Nguyễn Trần Thanh Vi": {
                    id: "416.0012",
                    isGroup: 0
                },
                "Nguyễn Trung Hiệp": {
                    id: "402.0017",
                    isGroup: 0
                },
                "Nguyễn Văn Chứ": {
                    id: "014.5003",
                    isGroup: 0
                },
                "Nguyễn Võ Hoàng Mai": {
                    id: "016.5004",
                    isGroup: 0
                },
                "Nguyễn Vũ Kỳ": {
                    id: "403.0015",
                    isGroup: 0
                },
                "Nguyễn Vũ Quỳnh Như": {
                    id: "****69",
                    isGroup: 0
                },
                "Nguyễn Xuân Thùy Linh": {
                    id: "402.0005",
                    isGroup: 0
                },
                "Nguyễn Xuân Triều": {
                    id: "410.0036",
                    isGroup: 0
                },
                "Phạm Đức Thiện": {
                    id: "406.5002",
                    isGroup: 0
                },
                "Phạm Ngọc Minh Trang": {
                    id: "419.0018",
                    isGroup: 0
                },
                "Phạm Ngọc Thúy Vi": {
                    id: "****467",
                    isGroup: 0
                },
                "Phạm Quốc Trọng": {
                    id: "002.5007",
                    isGroup: 0
                },
                "Phạm Thị Liên": {
                    id: "012.5014",
                    isGroup: 0
                },
                "Phan Đình Bích Vân": {
                    id: "401.5002",
                    isGroup: 0
                },
                "Phan Mạnh Hùng": {
                    id: "425.0014",
                    isGroup: 0
                },
                "Phan Thanh Tâm": {
                    id: "427.0023",
                    isGroup: 0
                },
                "Phan Thị Anh Thư": {
                    id: "420.0024",
                    isGroup: 0
                },
                "Phan Thị Hồng Xuân": {
                    id: "401.0001",
                    isGroup: 0
                },
                "Phan Thị Kim Loan": {
                    id: "410.0003",
                    isGroup: 0
                },
                "Phan Thị Thu Hiền": {
                    id: "402.0001",
                    isGroup: 0
                },
                "Phùng Thị Thanh Xuân": {
                    id: "426.0102",
                    isGroup: 0
                },
                "Quang Thị Mộng Chi": {
                    id: "422.0015",
                    isGroup: 0
                },
                "Thái Vĩnh Trân": {
                    id: "420.0003",
                    isGroup: 0
                },
                "Thành Phần": {
                    id: "****30",
                    isGroup: 0
                },
                "Trần Anh Tiến": {
                    id: "007.0002",
                    isGroup: 0
                },
                "Trần Bá Hùng": {
                    id: "404.0100",
                    isGroup: 0
                },
                "Trần Cẩm Thu": {
                    id: "419.0025",
                    isGroup: 0
                },
                "Trần Cao Bội Ngọc": {
                    id: "005.0003",
                    isGroup: 0
                },
                "Trần Dũng": {
                    id: "417.0014",
                    isGroup: 0
                },
                "Trần Hoài Bảo": {
                    id: "031.5100",
                    isGroup: 0
                },
                "Trần Nguyễn Tường Oanh": {
                    id: "428.0100",
                    isGroup: 0
                },
                "Trần Thị Mai Nhân": {
                    id: "427.0012",
                    isGroup: 0
                },
                "Trần Thị Thanh Vân": {
                    id: "033.5002",
                    isGroup: 0
                },
                "Trần Thị Thùy Trang": {
                    id: "403.5005",
                    isGroup: 0
                },
                "Trần Tịnh Vy": {
                    id: "425.0028",
                    isGroup: 0
                },
                "Triệu Thanh Lê": {
                    id: "411.0006",
                    isGroup: 0
                },
                "Trịnh Thị Hồng Huyên": {
                    id: "015.5003",
                    isGroup: 0
                },
                "Trương Hoàng Tố Nga": {
                    id: "406.5003",
                    isGroup: 0
                },
                "Trương Hoàng Trương": {
                    id: "401.0012",
                    isGroup: 0
                },
                "Trương Mạnh Hải": {
                    id: "416.0013",
                    isGroup: 0
                },
                "Từ Lê Tâm": {
                    id: "411.0009",
                    isGroup: 0
                },
                "Văn Thị Nhã Trúc": {
                    id: "410.0025",
                    isGroup: 0
                },
                "Võ Bình Nguyên": {
                    id: "002.5006",
                    isGroup: 0
                },
                "Võ Huỳnh Thanh": {
                    id: "410.0100",
                    isGroup: 0
                },
                "Võ Tuấn Vũ": {
                    id: "405.5005",
                    isGroup: 0
                },
                "Võ Văn Nhơn": {
                    id: "425.0022",
                    isGroup: 0
                },
                "Võ Văn Sen": {
                    id: "420.0025",
                    isGroup: 0
                },
                "Vũ Anh Thu": {
                    id: "****57",
                    isGroup: 0
                },
                "Vũ Bích Phượng": {
                    id: "422.5003",
                    isGroup: 0
                },
                "Vũ Phương Ly": {
                    id: "427.5006",
                    isGroup: 0
                },
                "Vũ Quý Tùng Anh": {
                    id: "420.5004",
                    isGroup: 0
                },
                "Vương Khánh Linh": {
                    id: "410.5010",
                    isGroup: 0
                },
                "K GD": {
                    id: "7",
                    isGroup: 1
                },
                "Cty văn khoa": {
                    id: "41",
                    isGroup: 1
                },
                "Nguyễn Văn Thanh": {
                    id: "406.0007",
                    isGroup: 0
                },
                "Lương Đức Nhật": {
                    id: "014.5009",
                    isGroup: 0
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
                "K HQH": {
                    id: "8",
                    isGroup: 1
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
                },
                "Khoa Đông phương": {
                    id: "6",
                    isGroup: 1
                },
                "K. VNH": {
                    id: "27",
                    isGroup: 1
                },
                "Khoa tâm lý học": {
                    id: "22",
                    isGroup: 1
                },
                "Nguyễn Thị Ngoc Mai": {
                    id: "019.5002",
                    isGroup: 0
                },
                "Trần Minh Duy": {
                    id: "406.0008",
                    isGroup: 0
                },
                "Xuân - TT.ĐTQT": {
                    id: "42",
                    isGroup: 1
                },
                // "": {
                //     id: "",
                //     isGroup: 1
                // },
                // "": {
                //     id: "",
                //     isGroup: 1
                // },
                // "": {
                //     id: "",
                //     isGroup: 1
                // },
                // "": {
                //     id: "",
                //     isGroup: 1
                // },
                // "": {
                //     id: "",
                //     isGroup: 1
                // },
                // "": {
                //     id: "",
                //     isGroup: 1
                // },
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
                    trichYeu: getVal('D', 'text'),
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
            // const worksheet1 = workbook.getWorksheet('P. ĐT');
            // solve1 = async (index = 2) => {
            //     const getVal = (column, type, Default) => {
            //         if (type === 'text') {
            //             Default = Default ? Default : null;
            //             const val = worksheet1.getCell(column + index).text.trim();
            //             return val === '' ? Default : (val == null ? '' : val);
            //         }
            //         if (type === 'date') {
            //             Default = Default ? Default : null;
            //             const val = worksheet1.getCell(column + index).value;
            //             if (val === '' || val === null) return Default;
            //             if (typeof val == 'object') return val.getTime();
            //             return val;
            //         }
            //     }

            //     if (worksheet1.getCell('D' + index).value === null) {
            //         process.stdout.clearLine();
            //         process.stdout.cursorTo(0);
            //         console.log('Running done!');
            //         if (errorList.length)
            //             console.log(`Error on line(s): ${errorList.join(', ')}.`);
            //         else console.log('All successfully');
            //         process.exit();
            //     };

            //     let record = {
            //         noiDung: getVal('D', 'text'),
            //         ngayGui: getVal('B', 'date'),
            //         ngayKy: getVal('C', 'date'),
            //         donViGui: 33
            //     };

            //     let donViNhanArr = [];
            //     let nguoiNhanArr = [];
            //     const donViAndNguoiNhan = getVal('E', 'text');
            //     let donViAndNguoiNhanArr = [];
            //     if (donViAndNguoiNhan) {
            //         if (donViAndNguoiNhan.indexOf(';') > 0) donViAndNguoiNhanArr = donViAndNguoiNhan.split(';')
            //         else donViAndNguoiNhanArr = donViAndNguoiNhan.split('\n');
            //     };
            //     donViAndNguoiNhanArr.length > 0 && donViAndNguoiNhanArr.forEach((item) => {
            //         if (object.hasOwnProperty(item)) {
            //             if (object[item].isGroup === 1) donViNhanArr.push(object[item].id);
            //             else nguoiNhanArr.push(object[item].id);
            //         }
            //     });
            //     let donViNhanStr = donViNhanArr.join(';');
            //     let nguoiNhanStr = nguoiNhanArr.join(';');
            //     record.donViNhan = donViNhanStr;
            //     record.canBoNhan = nguoiNhanStr;
            //     process.stdout.clearLine();
            //     process.stdout.cursorTo(0);
            //     process.stdout.write(`Importing line ${index} (shcc=${record.donViGui})`);

            //     await app.model.hcthCongVanDi.create(record, error => {
            //         if (error) {
            //             console.log(` => Thêm qtNuocNgoai ${index} bị lỗi\n - data: ${JSON.stringify(record, null, 4)}\n - error: ${error}`);
            //             errorList.push(index);
            //         }
            //         solve1(index + 1)
            //     });
            //     // }
            // }
            // if (worksheet1) solve1();

            // sheet 3
            // const worksheet2 = workbook.getWorksheet('P.KT&ĐBCL');
            // solve2 = async (index = 2) => {
            //     const getVal = (column, type, Default) => {
            //         if (type === 'text') {
            //             Default = Default ? Default : null;
            //             const val = worksheet2.getCell(column + index).text.trim();
            //             return val === '' ? Default : (val == null ? '' : val);
            //         }
            //         if (type === 'date') {
            //             Default = Default ? Default : null;
            //             const val = worksheet2.getCell(column + index).value;
            //             if (val === '' || val === null) return Default;
            //             if (typeof val == 'object') return val.getTime();
            //             return val;
            //         }
            //     }

            //     if (worksheet2.getCell('D' + index).value === null) {
            //         process.stdout.clearLine();
            //         process.stdout.cursorTo(0);
            //         console.log('Running done!');
            //         if (errorList.length)
            //             console.log(`Error on line(s): ${errorList.join(', ')}.`);
            //         else console.log('All successfully');
            //         process.exit();
            //     };

            //     let record = {
            //         noiDung: getVal('D', 'text'),
            //         ngayGui: getVal('B', 'date'),
            //         ngayKy: getVal('C', 'date'),
            //         donViGui: 35
            //     };

            //     let donViNhanArr = [];
            //     let nguoiNhanArr = [];
            //     const donViAndNguoiNhan = getVal('E', 'text');
            //     let donViAndNguoiNhanArr = [];
            //     if (donViAndNguoiNhan) {
            //         if (donViAndNguoiNhan.indexOf(';') > 0) donViAndNguoiNhanArr = donViAndNguoiNhan.split(';')
            //         else donViAndNguoiNhanArr = donViAndNguoiNhan.split('\n');
            //     };
            //     donViAndNguoiNhanArr.length > 0 && donViAndNguoiNhanArr.forEach((item) => {
            //         if (object.hasOwnProperty(item)) {
            //             if (object[item].isGroup === 1) donViNhanArr.push(object[item].id);
            //             else nguoiNhanArr.push(object[item].id);
            //         }
            //     });
            //     let donViNhanStr = donViNhanArr.join(';');
            //     let nguoiNhanStr = nguoiNhanArr.join(';');
            //     record.donViNhan = donViNhanStr;
            //     record.canBoNhan = nguoiNhanStr;
            //     process.stdout.clearLine();
            //     process.stdout.cursorTo(0);
            //     process.stdout.write(`Importing line ${index} (shcc=${record.donViGui})`);

            //     await app.model.hcthCongVanDi.create(record, error => {
            //         if (error) {
            //             console.log(` => Thêm qtNuocNgoai ${index} bị lỗi\n - data: ${JSON.stringify(record, null, 4)}\n - error: ${error}`);
            //             errorList.push(index);
            //         }
            //         solve2(index + 1)
            //     });
            //     // }
            // }
            // if (worksheet2) solve2();
        }
    });
}

app.readyHooks.add('Run tool.importCongVanDiData.js', {
    ready: () => app.database.oracle.connected && app.model && app.model.hcthCongVanDi,
    run,
});