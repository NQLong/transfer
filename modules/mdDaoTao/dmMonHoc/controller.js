module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            9007: { title: 'Danh sách Môn học', subTitle: 'Của các Khoa/Bộ môn', link: '/user/pdt/mon-hoc', groupIndex: 2, backgroundColor: '#9DE7BE', icon: 'fa-leanpub', color: '#000' },
        },
    };
    app.permission.add(
        { name: 'dmMonHoc:read', menu },
        { name: 'manager:read', menu },
        { name: 'dmMonHoc:write' },
        { name: 'dmMonHoc:delete' },
        { name: 'dmMonHoc:upload' },
    );
    app.get('/user/pdt/mon-hoc', app.permission.orCheck('dmMonHoc:read', 'manager:read'), app.templates.admin);
    app.get('/user/pdt/mon-hoc/upload', app.permission.orCheck('dmMonHoc:read', 'manager:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/pdt/mon-hoc/page/:pageNumber/:pageSize', app.permission.orCheck('dmMonHoc:read', 'dmMonHoc:manage'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
             pageSize = parseInt(req.params.pageSize),
             donViFilter = req.query.donViFilter,
             donVi = req.session.user.staff ? req.session.user.staff.maDonVi : null,
             searchTerm = typeof req.query.searchTerm === 'string' ? `%${req.query.searchTerm.toLowerCase()}%` : '',
             statement = 'lower(ten) LIKE :searchTerm',
             parameter = { searchTerm };
        if (req.session.user.permissions.exists(['dmMonHoc:read']) && donViFilter) donVi = donViFilter;
        if (donVi) {
             statement = 'boMon = :donVi AND lower(ten) LIKE :searchTerm';
             parameter.donVi = parseInt(donVi);
        }
        let condition = { statement, parameter };
        app.model.dmMonHoc.getPage(pageNumber, pageSize, condition, '*', 'boMon', (error, page) => {
             page.pageCondition = {
                  searchTerm,
                  donViFilter: donViFilter
             };
             res.send({ error, page });
        });
   });

    app.get('/api/pdt/mon-hoc/all', app.permission.orCheck('dmMonHoc:read', 'manager:read'), (req, res) => {
        const condition = req.query.condition || {};
        Object.keys(condition).forEach(key => { condition[key] === '' ? condition[key] = null : ''; });
        app.model.dmMonHoc.getAll(condition, '*', 'ten ASC', (error, items) => res.send({ error, items }));
    });

    app.get('/api/pdt/mon-hoc/item/:ma', app.permission.orCheck('dmMonHoc:read', 'manager:read'), (req, res) => {
        app.model.dmMonHoc.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/pdt/mon-hoc', app.permission.check('dmMonHoc:write'), (req, res) => {
        app.model.dmMonHoc.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/pdt/mon-hoc', app.permission.check('dmMonHoc:write'), (req, res) => {
        app.model.dmMonHoc.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/pdt/mon-hoc', app.permission.check('dmMonHoc:delete'), (req, res) => {
        app.model.dmMonHoc.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });

    app.post('/api/pdt/mon-hoc/multiple', app.permission.check('dmMonHoc:write'), (req, res) => {
        const dmMonHoc = req.body.dmMonHoc, errorList = [];
        for (let i = 0; i <= dmMonHoc.length; i++) {
            if (i == dmMonHoc.length) {
                res.send({ error: errorList });
            } else {
                if (dmMonHoc[i].kichHoat === 'true' | dmMonHoc[i].kichHoat === 'false')
                    dmMonHoc[i].kichHoat === 'true' ? dmMonHoc[i].kichHoat = 1 : dmMonHoc[i].kichHoat = 0;
                const current = dmMonHoc[i];
                app.model.dmMonHoc.create(current, (error,) => {
                    if (error) errorList.push(error);
                });
            }
        }
    });


    // Hook--------------------------------------------------------------------------------------------------------------------------------------------------------

    const dmMonHocImportData = (fields, files, done) => {
        let worksheet = null;
        new Promise((resolve, reject) => {
            if (fields.userData && fields.userData[0] && fields.userData[0] == 'DmMonHocFile' && files.DmMonHocFile && files.DmMonHocFile.length) {
                const srcPath = files.DmMonHocFile[0].path;
                const workbook = app.excel.create();
                workbook.xlsx.readFile(srcPath).then(() => {
                    app.deleteFile(srcPath);
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
    app.uploadHooks.add('DmMonHocFile', (req, fields, files, params, done) => {
        app.permission.has(req, () => dmMonHocImportData(fields, files, done), done, 'dmMonHoc:write');
    });

    // Download Template ---------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/pdt/mon-hoc/download-template', app.permission.check('staff:login'), (req, res) => {
        const workBook = app.excel.create();
        const ws = workBook.addWorksheet('Danh_muc_mon_hoc_Template');
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
        app.excel.attachment(workBook, res, 'Danh_muc_mon_hoc_Template.xlsx');
    });

};