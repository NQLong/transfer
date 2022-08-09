module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4011: { title: 'Chức vụ', link: '/user/danh-muc/chuc-vu' },
        },
    };
    app.permission.add(
        { name: 'dmChucVu:read', menu },
        { name: 'dmChucVu:write' },
        { name: 'dmChucVu:delete' },
    );
    app.get('/user/danh-muc/chuc-vu', app.permission.check('dmChucVu:read'), app.templates.admin);
    app.get('/user/danh-muc/chuc-vu/upload', app.permission.check('staff:login'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/chuc-vu/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmChucVu.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/chuc-vu/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmChucVu.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.post('/api/danh-muc/chuc-vu', app.permission.check('dmChucVu:write'), (req, res) => {
        let newData = req.body.item;
        newData.phuCap = newData.phuCap ? parseFloat(newData.phuCap).toFixed(2) : null;
        newData.kichHoat = newData.kichHoat ? parseInt(newData.kichHoat) : null;
        app.model.dmChucVu.create(newData, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/chuc-vu', app.permission.check('dmChucVu:write'), (req, res) => {
        let changes = app.clone(req.body.changes);
        app.model.dmChucVu.update({ ma: req.body.ma }, changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/chuc-vu', app.permission.check('dmChucVu:delete'), (req, res) => {
        app.model.dmChucVu.delete({ ma: req.body.ma }, error => res.send({ error }));
    });

    app.post('/api/danh-muc/chuc-vu/multiple', app.permission.check('dmChucVu:write'), (req, res) => {
        const isOverride = req.body.isOverride;
        const data = req.body.dmChucVu;
        const dataImported = [];
        const handleCreate = index => {
            if (index >= data.length) {
                res.send({ data: { message: 'Upload success', items: dataImported } });
            } else {
                app.model.dmChucVu.get({ ma: data[index].ma }, (error, item) => {
                    let currentDate = data[index];
                    currentDate.phuCap = currentDate.phuCap ? parseFloat(currentDate.phuCap).toFixed(2) : null;
                    currentDate.kichHoat = currentDate.kichHoat ? parseInt(currentDate.kichHoat) : null;
                    if (error) {
                        res.send({ error });
                    } else if (item) {
                        if (isOverride == 'TRUE') {
                            app.model.dmChucVu.update({ ma: data[index].ma }, currentDate, (error, item) => {
                                if (error) {
                                    res.send({ error });
                                } else {
                                    dataImported.push(item);
                                    handleCreate(index + 1);
                                }
                            });
                        } else {
                            handleCreate(index + 1);
                        }
                    } else {
                        app.model.dmChucVu.create(currentDate, (error, item) => {
                            if (error) {
                                res.send({ error });
                            } else {
                                dataImported.push(item);
                                handleCreate(index + 1);
                            }
                        });
                    }
                });
            }
        };
        handleCreate(0);
    });

    app.get('/api/danh-muc/chuc-vu/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmChucVu.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    // Hook uploadHooks -----------------------------------------------------------------------------------------------------------------------------
    const dmChucVuImportData = (fields, files, done) => {
        let worksheet = null;
        new Promise((resolve, reject) => {
            if (fields.userData && fields.userData[0] && fields.userData[0] == 'DmChucVuFile' && files.DmChucVuFile && files.DmChucVuFile.length) {
                const srcPath = files.DmChucVuFile[0].path;
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
                        phuCap = worksheet.getCell('C' + index).value ? worksheet.getCell('C' + index).value.toString().trim() : '',
                        kichHoat = worksheet.getCell('D' + index).value ? worksheet.getCell('D' + index).value.toString().trim() : '',
                        ghiChu = worksheet.getCell('E' + index).value ? worksheet.getCell('E' + index).value.toString().trim() : '';
                    phuCap = Number(phuCap) || 0;
                    kichHoat = Number(kichHoat) || 0;

                    items.push({ ma, ten, phuCap, kichHoat, ghiChu });
                } else {
                    done({ items });
                    break;
                }
            }
        }).catch(error => done({ error }));
    };

    app.uploadHooks.add('DmChucVuFile', (req, fields, files, params, done) => {
        app.permission.has(req, () => dmChucVuImportData(fields, files, done), done, 'dmChucVu:write');
    }
    );

    // Download Template ---------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/chuc-vu/download-template', app.permission.check('staff:login'), (req, res) => {
        const workBook = app.excel.create();
        const ws = workBook.addWorksheet('Danh_muc_chuc_vu_Template');
        const defaultColumns = [
            { header: 'MÃ CHỨC VỤ', key: 'ma', width: 15 },
            { header: 'TÊN CHỨC VỤ', key: 'ten', width: 50 },
            { header: 'PHỤ CẤP', key: 'phuCap', width: 15 },
            { header: 'KÍCH HOẠT', key: 'kichHoat', width: 15 },
            { header: 'GHI CHÚ', key: 'ghiChu', width: 50 },
        ];
        ws.columns = defaultColumns;
        ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', horizontal: 'center' };
        app.excel.attachment(workBook, res, 'Danh_muc_chuc_vu_Template.xlsx');
    });
};