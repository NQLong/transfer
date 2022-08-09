module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4100: { title: 'Ngày lễ', link: '/user/danh-muc/ngay-le' },
        },
    };

    const menuDaoTao = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7007: { title: 'Danh sách ngày lễ trong năm', link: '/user/dao-tao/ngay-le', backgroundColor: '#FF9074', groupIndex: 2, icon: 'fa-yelp' }
        },
    };
    app.permission.add(
        { name: 'dmNgayLe:read', menu },
        { name: 'dtNgayLe:read', menu: menuDaoTao },
        { name: 'dmNgayLe:write' },
        { name: 'dmNgayLe:delete' },
        { name: 'dmNgayLe:upload' },
    );
    app.get('/user/danh-muc/ngay-le', app.permission.check('dmNgayLe:read'), app.templates.admin);
    app.get('/user/dao-tao/ngay-le', app.permission.check('dtNgayLe:read'), app.templates.admin);

    app.get('/user/danh-muc/ngay-le/upload', app.permission.check('dmNgayLe:write'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/ngay-le/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        const statement = ['ngay', 'moTa'].map(i => `lower(${i}) LIKE :searchText`).join(' OR ');
        if (req.query.searchText) {
            condition = {
                statement,
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmNgayLe.getPage(pageNumber, pageSize, condition, '*', 'ngay DESC', (error, page) => {
            if (req.query.year) page.list = page.list.filter(item => new Date(item.ngay).getFullYear() == req.query.year);
            page.pageCondition = {
                searchText: req.query.searchText || '',
                year: req.query.year || ''
            };
            res.send({ error, page });
        });
    });

    app.get('/api/danh-muc/ngay-le/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        Object.keys(condition).forEach(key => { condition[key] === '' ? condition[key] = null : ''; });
        app.model.dmNgayLe.getAll(condition, '*', 'ngay DESC', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/ngay-le/get-all-year', app.permission.check('user:login'), (req, res) => {
        app.model.dmNgayLe.getAll({ kichHoat: 1 }, 'ngay', 'ngay DESC', (error, items) => {
            let newItems = items.map(item => item = new Date(item.ngay).getFullYear());
            res.send({ error, items: [...new Set(newItems)] });
        });
    });

    app.get('/api/danh-muc/ngay-le/item/:id', app.permission.check('user:login'), (req, res) => {
        app.model.dmNgayLe.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/ngay-le', app.permission.check('dmNgayLe:write'), (req, res) => {
        app.model.dmNgayLe.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/ngay-le', app.permission.check('dmNgayLe:write'), (req, res) => {
        app.model.dmNgayLe.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/danh-muc/ngay-le', app.permission.check('dmNgayLe:delete'), (req, res) => {
        app.model.dmNgayLe.delete({ id: req.body.id }, errors => res.send({ errors }));
    });

    app.post('/api/danh-muc/ngay-le/multiple', app.permission.check('dmNgayLe:write'), (req, res) => {
        const dmNgayLe = req.body.dmNgayLe, errorList = [];
        for (let i = 0; i <= dmNgayLe.length; i++) {
            if (i == dmNgayLe.length) {
                res.send({ error: errorList });
            } else {
                if (dmNgayLe[i].kichHoat === 'true' | dmNgayLe[i].kichHoat === 'false')
                    dmNgayLe[i].kichHoat === 'true' ? dmNgayLe[i].kichHoat = 1 : dmNgayLe[i].kichHoat = 0;
                const current = dmNgayLe[i];
                app.model.dmNgayLe.create(current, (error,) => {
                    if (error) errorList.push(error);
                });
            }
        }
    });


    // Hook--------------------------------------------------------------------------------------------------------------------------------------------------------

    const dmNgayLeImportData = (fields, files, done) => {
        let worksheet = null;
        new Promise((resolve, reject) => {
            if (fields.userData && fields.userData[0] && fields.userData[0] == 'DmNgayLeFile' && files.DmNgayLeFile && files.DmNgayLeFile.length) {
                const srcPath = files.DmNgayLeFile[0].path;
                const workbook = app.excel.create();
                workbook.xlsx.readFile(srcPath).then(() => {
                    app.fs.deleteFile(srcPath);
                    worksheet = workbook.getWorksheet(1);
                    worksheet ? resolve() : reject('Invalid excel file!');
                });
            }
        }).then(() => {
            let index = 1,
                items = [];
            while (true) {
                index++;
                let ma = worksheet.getCell('A' + index).value;
                if (ma) {
                    ma = ma.toString().trim();
                    let ten = worksheet.getCell('B' + index).value ? worksheet.getCell('B' + index).value.toString().trim() : '',
                        soTinChi = worksheet.getCell('C' + index).value ? worksheet.getCell('C' + index).value.toString().trim() : 0,
                        tongSoTiet = worksheet.getCell('D' + index).value ? worksheet.getCell('D' + index).value.toString().trim() : 0,
                        soTietLt = worksheet.getCell('E' + index).value ? worksheet.getCell('E' + index).value.toString().trim() : 0,
                        soTietTh = worksheet.getCell('F' + index).value ? worksheet.getCell('F' + index).value.toString().trim() : 0,
                        soTietTt = worksheet.getCell('G' + index).value ? worksheet.getCell('G' + index).value.toString().trim() : 0,
                        soTietTl = worksheet.getCell('H' + index).value ? worksheet.getCell('H' + index).value.toString().trim() : 0,
                        soTietDa = worksheet.getCell('I' + index).value ? worksheet.getCell('I' + index).value.toString().trim() : 0,
                        soTietLa = worksheet.getCell('J' + index).value ? worksheet.getCell('J' + index).value.toString().trim() : 0,
                        tinhChatPhong = worksheet.getCell('J' + index).value ? worksheet.getCell('J' + index).value.toString().trim() : '',
                        tenTiengAnh = worksheet.getCell('L' + index).value ? worksheet.getCell('L' + index).value.toString().trim() : '',
                        boMon = worksheet.getCell('M' + index).value ? worksheet.getCell('M' + index).value.toString().trim() : '',
                        loaiHinh = worksheet.getCell('N' + index).value ? worksheet.getCell('N' + index).value.toString().trim() : '',
                        chuyenNganh = worksheet.getCell('O' + index).value ? worksheet.getCell('O' + index).value.toString().trim() : '',
                        ghiChu = worksheet.getCell('P' + index).value ? worksheet.getCell('P' + index).value.toString().trim() : '',
                        maCtdt = worksheet.getCell('Q' + index).value ? worksheet.getCell('Q' + index).value.toString().trim() : '',
                        tenCtdt = worksheet.getCell('R' + index).value ? worksheet.getCell('R' + index).value.toString().trim() : '',
                        kichHoat = worksheet.getCell('S' + index).value ? worksheet.getCell('S' + index).value.toString().trim() : '';
                    kichHoat = Number(kichHoat) || 0;
                    items.push({ ma, ten, soTinChi, tongSoTiet, soTietLt, soTietTh, soTietTt, soTietTl, soTietDa, soTietLa, tinhChatPhong, tenTiengAnh, boMon, loaiHinh, chuyenNganh, maCtdt, tenCtdt, kichHoat, ghiChu });
                } else {
                    done({ items });
                    break;
                }
            }
        }).catch(error => done({ error }));
    };
    app.uploadHooks.add('DmNgayLeFile', (req, fields, files, params, done) => {
        app.permission.has(req, () => dmNgayLeImportData(fields, files, done), done, 'dmNgayLe:write');
    });

    // Download Template ---------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/ngay-le/download-template', app.permission.check('staff:login'), (req, res) => {
        const workBook = app.excel.create();
        const ws = workBook.addWorksheet('Danh_muc_ngay_le_Template');
        const defaultColumns = [
            { header: 'Mã Môn Học', key: 'ma', width: 15 },
            { header: 'Tên Môn Học', key: 'ten', width: 50 },
            { header: 'STC', key: 'soTinChi', width: 10 },
            { header: 'Tổng Số Tiết', key: 'tongSoTiet', width: 15 },
            { header: 'Số Tiết LT', key: 'soTietLt', width: 15 },
            { header: 'Số Tiết TH', key: 'soTietTh', width: 15 },
            { header: 'Số Tiết TT', key: 'soTietTt', width: 15 },
            { header: 'Số Tiết TL', key: 'soTietTl', width: 15 },
            { header: 'Số Tiết ĐA', key: 'soTietDa', width: 15 },
            { header: 'Số Tiết LA', key: 'soTietLa', width: 15 },
            { header: 'Tính Chất Phòng', key: 'tinhChatPhong', width: 30 },
            { header: 'Tên Tiếng Anh', key: 'tenTiengAnh', width: 40 },
            { header: 'Khoa - Bộ Môn', key: 'boMon', width: 40 },
            { header: 'Loại hình', key: 'loaiHinh', width: 20 },
            { header: 'Chuyên Ngành', key: 'chuyenNganh', width: 20 },
            { header: 'Ghi Chú', key: 'ghiChu', width: 20 },
            { header: 'Danh Sách Mã CTĐT', key: 'maCtdt', width: 20 },
            { header: 'Danh Sách Tên CTĐT', key: 'tenCtdt', width: 40 },
            { header: 'Kích hoạt', key: 'kichHoat', width: 15 },
        ];
        ws.columns = defaultColumns;
        ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', horizontal: 'center' };
        app.excel.attachment(workBook, res, 'Danh_muc_ngay_le_Template.xlsx');
    });

};