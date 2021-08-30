module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            2113: { title: 'Chức vụ', link: '/user/danh-muc/chuc-vu' },
        },
    };
    app.permission.add(
        { name: 'dmChucVu:read', menu },
        { name: 'dmChucVu:write' },
        { name: 'dmChucVu:delete' },
    );
    app.get('/user/danh-muc/chuc-vu', app.permission.check('dmChucVu:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/chuc-vu/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            }
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
        const dataImported = []
        const handleCreate = index => {
            if (index >= data.length) {
                res.send({ data: { message: 'Upload success', items: dataImported } })
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
                })
            }
        };
        handleCreate(0);
    });

    // Hook uploadHooks -----------------------------------------------------------------------------------------------------------------------------
    const dmChucVuImportData = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'dmChucVuImportData' && files.DmChucVuFile && files.DmChucVuFile.length > 0) {
            const srcPath = files.DmChucVuFile[0].path;
            app.excel.readFile(srcPath, workbook => {
                if (workbook) {
                    const worksheet = workbook.getWorksheet(1), element = [], totalRow = worksheet.lastRow.number;
                    const handleUpload = (index = 2) => {
                        const value = worksheet.getRow(index).values;
                        if (value.length == 0 || index == totalRow + 1) {
                            app.deleteFile(srcPath);
                            done({ element });
                        } else {
                            element.push({
                                ma: value[1], ten: value[2], phuCap: value[3], kichHoat: value[4], ghiChu: value[5],
                            });
                            handleUpload(index + 1);
                        }
                    };
                    handleUpload();
                } else {
                    app.deleteFile(srcPath);
                    done({ error: 'Error' });
                }
            });
        }
    };

    app.uploadHooks.add('dmChucVuImportData', (req, fields, files, params, done) =>
        app.permission.has(req, () => dmChucVuImportData(req, fields, files, params, done), done, 'dmChucVu:write'));
};