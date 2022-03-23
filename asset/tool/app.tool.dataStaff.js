let package = require('../../package');
const path = require('path');
// Variables ==================================================================
const app = {
    isDebug: !__dirname.startsWith('/var/www/'),
    fs: require('fs'),
    path,
    modulesPath: path.join(__dirname, '../../' + package.path.modules),
};
// Configure ==================================================================
require('../../config/common')(app);
require('../../config/lib/excel')(app);
require('../../config/lib/fs')(app);
require('../../config/lib/string')(app);
require('../../config/database')(app, package);
require('../../config/io')(app);
// Init =======================================================================
app.loadModules(false);
const errorList = [];

//To compare Vietnamese
const nonAccentVietnamese = str => str.toLowerCase()
    .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
    .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
    .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
    .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
    .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
    .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '')
    .replace(/\u02C6|\u0306|\u031B/g, '');

const removeAccentHatVietnamese = str => str.toLowerCase()
    .replace(/â|ă/g, 'a')
    .replace(/à|ầ|ằ/g, 'à')
    .replace(/á|ấ|ắ/g, 'á')
    .replace(/ả|ẩ|ẳ/g, 'ả')
    .replace(/ã|ẫ|ẵ/g, 'ã')
    .replace(/ạ|ậ|ặ/g, 'ạ')
    .replace(/ê/g, 'e')
    .replace(/è|ề/g, 'è')
    .replace(/é|ế/g, 'é')
    .replace(/ẻ|ể/g, 'ẻ')
    .replace(/ẽ|ễ/g, 'ẽ')
    .replace(/ẹ|ệ/g, 'ẹ')
    .replace(/ô|ơ/g, 'o')
    .replace(/ò|ồ|ờ/g, 'ò')
    .replace(/ó|ố|ớ/g, 'ó')
    .replace(/ỏ|ổ|ở/g, 'ỏ')
    .replace(/õ|ỗ|ỗ/g, 'õ')
    .replace(/ọ|ộ|ợ/g, 'ọ')
    .replace(/ư/g, 'u')
    .replace(/ù|ừ/g, 'ù')
    .replace(/ú|ứ/g, 'ú')
    .replace(/ủ|ử/g, 'ủ')
    .replace(/ũ|ữ/g, 'ũ')
    .replace(/ụ|ự/g, 'ụ')
    .replace(/đ/g, 'd')
    .replace(/\u02C6|\u0306|\u031B/g, '');

const removeAccentMarksVietnamese = str => str.toLowerCase()
    .replace(/à|á|ả|ã|ạ/g, 'a')
    .replace(/ằ|ắ|ẳ|ẵ|ặ/g, 'ă')
    .replace(/ầ|ấ|ẩ|ẫ|ậ/g, 'â')
    .replace(/è|é|ẻ|ẽ|ẹ/g, 'e')
    .replace(/ề|ế|ể|ễ|ệ/g, 'ê')
    .replace(/ì|í|ỉ|ĩ|ị/g, 'i')
    .replace(/ò|ó|ỏ|õ|ọ/g, 'o')
    .replace(/ờ|ớ|ở|ỡ|ợ/g, 'ơ')
    .replace(/ồ|ố|ổ|ỗ|ộ/g, 'ô')
    .replace(/ù|ú|ủ|ũ|ụ/g, 'u')
    .replace(/ừ|ứ|ử|ữ|ự/g, 'ư')
    .replace(/ỳ|ý|ỷ|ỹ|ỵ/g, 'y')
    .replace(/\u0300|\u0301|\u0309|\u0303|\u0323/g, '');

const compareSearch = (item, searchValue) => {
    item = item.toLowerCase();
    searchValue = searchValue.toLowerCase();
    if (item.includes(searchValue)) {
        return true;
    } else if (!nonAccentVietnamese(item).includes(nonAccentVietnamese(searchValue))) {
        return false;
    } else {
        return (nonAccentVietnamese(item).includes(searchValue) ||
            removeAccentMarksVietnamese(item).includes(searchValue) ||
            removeAccentHatVietnamese(item).includes(searchValue));
    }
};

let mapperTenDV = {};
const getTenDmDonVi = () => {
    app.model.dmDonVi.getAll((error, items) => items.forEach(i => mapperTenDV[i.ma] = i.ten));
}

const run = () => app.excel.readFile(app.path.join(__dirname, 'DSCB.xlsx'), workbook => {
    if (workbook) {
        getTenDmDonVi();
        let errors = '';
        // const worksheet = workbook.getWorksheet(1),
        //     solve = (index = 1) => {
        //         const getVal = (column, type, Default) => {
        //             if (type === 'text') {
        //                 Default = Default ? Default : null;
        //                 const val = worksheet.getCell(column + index).text.trim();
        //                 return val === '' ? Default : (val == null ? '' : val);
        //             }
        //             if (type === 'date') {
        //                 Default = Default ? Default : null;
        //                 const val = worksheet.getCell(column + index).value;
        //                 if (val === '' || val === null) return Default;
        //                 if (typeof val == 'object') return val.getTime();
        //                 return val;
        //             }
        //         }
        //         if (worksheet.getCell('A' + index).value == null) {
        //             process.stdout.clearLine();
        //             process.stdout.cursorTo(0);
        //             console.log('Running done!');
        //             if (errorList.length)
        //                 console.log(`Found error(s) on line(s): ${errorList.join(', ')}.`);
        //             else console.log('All successfully');
        //             process.exit();
        //         }
        //         const record = {
        //             shcc: getVal('B', 'text'),
        //             ho: getVal('C', 'text'),
        //             ten: getVal('D', 'date'),
        //             donVi: getVal('L', 'text'),
        //             ngaySinh: getVal('E', 'date')
        //         }
        //         // let condition = {
        //         //     statement: 'lower(ho || \' \' || ten) LIKE :hoTen',
        //         //     parameter: `%${record.ho + ' ' + record.ten}`
        //         // }
        //         if (record) {
        //             process.stdout.clearLine();
        //             process.stdout.cursorTo(0);
        //             // process.stdout.write(`Dòng ${index + 8}: MãCB = ${record.shcc}; Họ tên = ${record.ho + ' ' + record.ten}`);
        //             app.model.canBo.get({ shcc: record.shcc }, 'shcc', null, (error, staff) => {
        //                 if (error || !staff) {

        //                     errorList.push(index + 8);
        //                 }
        //                 solve(index + 1);
        //             });
        //             // app.model.canBo.getAll()
        //         } else {
        //             if (errors) console.log('\nError:', errors);
        //             else console.log('\nDone');
        //         };
        //     };
        const worksheet = workbook.getWorksheet('Sheet2'),
            solve = (index = 1) => {
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
                if (worksheet.getCell('A' + index).value == null) {
                    process.stdout.clearLine();
                    process.stdout.cursorTo(0);
                    console.log('Running done!');
                    if (errorList.length)
                        console.log(`Found error(s) on line(s): ${errorList.join(', ')}.`);
                    else console.log('All successfully');
                    process.exit();
                }
                const record = {
                    shcc: getVal('A', 'text'),
                    hoTen: getVal('B', 'text'),
                    donVi: getVal('C', 'text'),
                }
                if (record) {
                    process.stdout.clearLine();
                    process.stdout.cursorTo(0);
                    // process.stdout.write(`Line ${index}:`);
                    app.model.canBo.get({
                        statement: 'lower(ho || \' \' || ten) LIKE :hoTen',
                        parameter: { hoTen: `%${record.hoTen.toLowerCase()}%` }
                    }, (error, staff) => {
                        if (error || !staff) { }
                        else {
                            console.log(`Data: ${staff.shcc} - ${staff.ho + ' ' + staff.ten} - ${mapperTenDV[staff.maDonVi]?.normalizedName()} \n Excel: ${record.shcc} - ${record.hoTen} - ${record.donVi} \n`);
                        }
                        solve(index + 1);
                    });
                } else {
                    if (errors) console.log('\nError:', errors);
                    else console.log('\nDone');
                };
            }
        if (worksheet) {
            solve();
        }
    }
});
app.readyHooks.add('Run tool.dataStaff.js', {
    ready: () => app.dbConnection && app.model && app.model.canBo && app.model.dmDonVi,
    run,
});