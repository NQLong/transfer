module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            2011: { title: 'Bộ môn', link: '/user/dm-bo-mon' },
        },
    };
    app.permission.add(
        { name: 'dmBoMon:read', menu },
        'dmBoMon:write', 'dmBoMon:delete', 'dmBoMon:upload',
    );
    app.get('/user/dm-bo-mon', app.permission.check('dmBoMon:read'), app.templates.admin);
    app.get('/user/dm-bo-mon/upload', app.permission.check('dmBoMon:write'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dm-bo-mon/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText OR lower(tenTiengAnh) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmBoMon.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/dm-bo-mon/all', (req, res) => {
        app.model.dmBoMon.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/dm-bo-mon/item/:ma', app.permission.check('staff:login'), (req, res) => {
        app.model.dmBoMon.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.get('/api/dm-bo-mon/donVi', app.permission.check('staff:login'), (req, res) => {
        app.model.dmDonVi.getAll({}, 'ma , ten', (error, item) => res.send({ error, item }));
    });

    app.post('/api/dm-bo-mon', app.permission.check('dmBoMon:write'), (req, res) => {
        app.model.dmBoMon.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/dm-bo-mon', app.permission.check('dmBoMon:write'), (req, res) => {
        app.model.dmBoMon.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/dm-bo-mon', app.permission.check('dmBoMon:delete'), (req, res) => {
        app.model.dmBoMon.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });

    app.post('/api/dm-bo-mon/multiple', app.permission.check('dmBoMon:write'), (req, res) => {
        const dmBoMon = req.body.dmBoMon, errorList = [];
        for (let i = 0; i <= dmBoMon.length; i++) {
            if (i == dmBoMon.length) {
                res.send({ error: errorList });
            } else {
                if (dmBoMon[i].kichHoat === 'true' | dmBoMon[i].kichHoat === 'false')
                    dmBoMon[i].kichHoat === 'true' ? dmBoMon[i].kichHoat = 1 : dmBoMon[i].kichHoat = 0;
                const current = dmBoMon[i];
                app.model.dmBoMon.create(current, (error,) => {
                    if (error) errorList.push(error);
                });
            }
        }
    });

    // Hook--------------------------------------------------------------------------------------------------------------------------------------------------------

    const dmBoMonImportData = (fields, files, done) => {
        let worksheet = null;
        new Promise((resolve, reject) => {
            if (fields.userData && fields.userData[0] && fields.userData[0] == 'DmBoMonFile' && files.DmBoMonFile && files.DmBoMonFile.length) {
                const srcPath = files.DmBoMonFile[0].path;
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
                        tenTiengAnh = worksheet.getCell('C' + index).value ? worksheet.getCell('C' + index).value.toString().trim() : '',
                        maDv = worksheet.getCell('D' + index).value ? worksheet.getCell('D' + index).value.toString().trim() : '',
                        qdThanhLap = worksheet.getCell('E' + index).value ? worksheet.getCell('E' + index).value.toString().trim() : '',
                        qdXoaTen = worksheet.getCell('F' + index).value ? worksheet.getCell('F' + index).value.toString().trim() : '',
                        kichHoat = worksheet.getCell('G' + index).value ? worksheet.getCell('G' + index).value.toString().trim() : '',
                        ghiChu = worksheet.getCell('H' + index).value ? worksheet.getCell('H' + index).value.toString().trim() : '';
                    kichHoat = Number(kichHoat) || 0;

                    items.push({ ma, ten, tenTiengAnh, maDv, qdThanhLap, qdXoaTen, kichHoat, ghiChu });
                } else {
                    done({ items });
                    break;
                }
            }
        }).catch(error => done({ error }));
    };
    app.uploadHooks.add('DmBoMonFile', (req, fields, files, params, done) => {
        app.permission.has(req, () => dmBoMonImportData(fields, files, done), done, 'dmBoMon:write');
    });

    // Download Template ---------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dm-bo-mon/download-template', app.permission.check('staff:login'), (req, res) => {
        const workBook = app.excel.create();
        const ws = workBook.addWorksheet('Danh_muc_bo_mon_Template');
        const defaultColumns = [
            { header: 'MÃ BỘ MÔN', key: 'ma', width: 15 },
            { header: 'TÊN BỘ MÔN (TIẾNG VIỆT)', key: 'ten', width: 50 },
            { header: 'TÊN BỘ MÔN (TIẾNG ANH)', key: 'tenTiengAnh', width: 50 },
            { header: 'MÃ ĐƠN VỊ', key: 'maDv', width: 15 },
            { header: 'QUYẾT ĐỊNH THÀNH LẬP', key: 'qdThanhLap', width: 30 },
            { header: 'QUYẾT ĐỊNH XÓA TÊN', key: 'qdXoaTen', width: 30 },
            { header: 'KÍCH HOẠT', key: 'kichHoat', width: 15 },
            { header: 'GHI CHÚ', key: 'ghiChu', width: 50 },
        ];
        ws.columns = defaultColumns;
        ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', horizontal: 'center' };
        app.excel.attachment(workBook, res, 'Danh_muc_bo_mon_Template.xlsx');
    });
};