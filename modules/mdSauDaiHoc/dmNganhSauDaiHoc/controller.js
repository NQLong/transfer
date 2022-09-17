module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7528: {
                title: 'Ngành đào tạo',
                // subTitle: 'Sau đại học',
                link: '/user/sau-dai-hoc/danh-sach-nganh'
            },
        },
    };
    app.permission.add(
        { name: 'dmNganhSdh:read', menu },
        { name: 'dmNganhSdh:write' },
        { name: 'dmNganhSdh:delete' },
    );
    app.get('/user/sau-dai-hoc/danh-sach-nganh', app.permission.check('dmNganhSdh:read'), app.templates.admin);
    app.get('/user/sau-dai-hoc/danh-sach-nganh/upload', app.permission.check('dmNganhSdh:write'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesNganhSdh', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'dmNganhSdh:read', 'dmNganhSdh:write', 'dmNganhSdh:delete');
            resolve();
        } else resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sau-dai-hoc/danh-sach-nganh/page/:pageNumber/:pageSize', app.permission.check('dmNganhSdh:read'), (req, res) => {
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

    app.get('/api/sau-dai-hoc/danh-sach-nganh/all', app.permission.check('dmNganhSdh:read'), (req, res) => {
        app.model.dmNganhSauDaiHoc.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/sau-dai-hoc/danh-sach-nganh/item/:ma', app.permission.check('dmNganhSdh:read'), (req, res) => {
        app.model.dmNganhSauDaiHoc.get({ maNganh: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/sau-dai-hoc/danh-sach-nganh', app.permission.check('dmNganhSdh:write'), (req, res) => {
        app.model.dmNganhSauDaiHoc.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/sau-dai-hoc/danh-sach-nganh', app.permission.check('dmNganhSdh:write'), (req, res) => {
        app.model.dmNganhSauDaiHoc.update({ maNganh: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/sau-dai-hoc/danh-sach-nganh', app.permission.check('dmNganhSdh:delete'), (req, res) => {
        app.model.dmNganhSauDaiHoc.delete({ maNganh: req.body.ma }, errors => res.send({ errors }));
    });

    app.post('/api/sau-dai-hoc/danh-sach-nganh/multiple', app.permission.check('dmNganhSdh:write'), async (req, res) => {
        try {
            const data = req.body.data;
            for (let index = 0; index < data.length; index++) {
                let item = data[index];
                const newData = {
                    maNganh: item.ma,
                    ten: item.ten,
                };
                let data = await app.model.dmNganhSauDaiHoc.get({ maNganh: item.ma });
                if (!data) await app.model.dmNganhSauDaiHoc.create(newData);
            }
            res.end();
        } catch (error) { res.send({ error }); }
    });

    // Hook--------------------------------------------------------------------------------------------------------------------------------------------------------
    app.uploadHooks.add('dmNganhSdhImportData', (req, fields, files, params, done) =>
        app.permission.has(req, () => dmNganhSdhImportData(req, fields, files, params, done), done, 'dmNganhSdh:write'));

    const dmNganhSdhImportData = async (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'dmNganhSdhImportData' && files.dmNganhSdhFile && files.dmNganhSdhFile.length > 0) {
            const srcPath = files.dmNganhSdhFile[0].path;
            const workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                const worksheet = workbook.getWorksheet(1), element = [], totalRow = worksheet.lastRow.number;
                const handleUpload = (index = 2) => {
                    const value = worksheet.getRow(index).values;
                    if (value.length == 0 || index == totalRow + 1) {
                        app.fs.deleteFile(srcPath);
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
                app.fs.deleteFile(srcPath);
                done({ error: 'Error' });
            }
        }
    };
};