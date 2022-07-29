module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4104: { title: 'Ngành Sau đại học', link: '/user/danh-muc/nganh-sau-dai-hoc' },
        },
    };
    app.permission.add(
        { name: 'dmNganhSdh:read', menu },
        { name: 'dmNganhSdh:write' },
        { name: 'dmNganhSdh:delete' },
    );
    app.get('/user/danh-muc/nganh-sau-dai-hoc', app.permission.check('dmNganhSdh:read'), app.templates.admin);
    app.get('/user/danh-muc/nganh-sau-dai-hoc/upload', app.permission.check('dmNganhSdh:write'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/nganh-sau-dai-hoc/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
            if (req.query.kichHoat) {
                condition.statement += ' AND kichHoat = :kichHoat';
                condition.parameter.kichHoat = req.query.kichHoat;
            }
            if (req.query.maKhoaSdh) {
                condition.statement += ' AND maKhoa = :maKhoa';
                condition.parameter.maKhoa = req.query.maKhoaSdh;
            }
        } else if (req.query.kichHoat) {
            condition = {
                statement: 'kichHoat = :kichHoat',
                parameter: { kichHoat: req.query.kichHoat }
            };
            if (req.query.maKhoaSdh) {
                condition.statement += ' AND maKhoa = :maKhoa';
                condition.parameter.maKhoa = req.query.maKhoaSdh;
            }
        } else if (req.query.maKhoaSdh) {
            condition = {
                maKhoa: req.query.maKhoaSdh
            };
        }

        app.model.dmNganhSauDaiHoc.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/nganh-sau-dai-hoc/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmNganhSauDaiHoc.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/nganh-sau-dai-hoc/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmNganhSauDaiHoc.get({maNganh: req.params.ma}, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/nganh-sau-dai-hoc', app.permission.check('dmNganhSdh:write'), (req, res) => {
        app.model.dmNganhSauDaiHoc.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/nganh-sau-dai-hoc', app.permission.check('dmNganhSdh:write'), (req, res) => {
        app.model.dmNganhSauDaiHoc.update({ maNganh: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/danh-muc/nganh-sau-dai-hoc', app.permission.check('dmNganhSdh:delete'), (req, res) => {
        app.model.dmNganhSauDaiHoc.delete({ maNganh: req.body.ma }, errors => res.send({ errors }));
    });

    app.post('/api/danh-muc/nganh-sau-dai-hoc/multiple', app.permission.check('dmNganhSdh:write'), (req, res) => {
        const data = req.body.data;
        let errors = [];
        const handleCreateItem = (index = 0) => {
            let item = data[index];

            if (index < data.length) {
                const newData = {
                    maNganh: item.maNganh,
                    ten: item.ten,
                };
                app.model.dmNganhSauDaiHoc.get({ maNganh: item.maNganh }, (error, svSdh) => {
                    if (error || svSdh) {
                        handleCreateItem(index+1);
                    } else {
                        app.model.dmNganhSauDaiHoc.create(newData, () => {
                            handleCreateItem(index+1);
                        });
                    }
                });
            } else {
                res.send({ errors });
            }
        };
        handleCreateItem();
    });

    // Hook--------------------------------------------------------------------------------------------------------------------------------------------------------
    app.uploadHooks.add('dmNganhSdhImportData', (req, fields, files, params, done) =>
        app.permission.has(req, () => dmNganhSdhImportData(req, fields, files, params, done), done, 'dmNganhSdh:write'));

    const dmNganhSdhImportData = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'dmNganhSdhImportData' && files.dmNganhSdhFile && files.dmNganhSdhFile.length > 0) {
            const srcPath = files.dmNganhSdhFile[0].path;
            app.excel.readFile(srcPath, workbook => {
                if (workbook) {
                    const worksheet = workbook.getWorksheet(1), element = [], totalRow = worksheet.lastRow.number;
                    const handleUpload = (index = 2) => {
                        const value = worksheet.getRow(index).values;
                        if (value.length == 0 || index == totalRow + 1) {
                            app.deleteFile(srcPath);
                            done({ element });
                        } else {
                            let data = {
                                maNganh: value[1],
                                ten: value[2] ? value[2].trim() : '',
                            };

                            element.push(data);
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
};