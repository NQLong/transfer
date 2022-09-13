module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4105: {
                title: 'Môn học (trước 2022)',
                subTitle: 'Sau đại học',
                link: '/user/danh-muc/mon-hoc'
            },
        },
    };
    const menuSDH = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7510: {
                title: 'Môn học (trước 2022)',
                link: '/user/sau-dai-hoc/mon-hoc', icon: 'fa-list', backgroundColor: '#1ca474', groupIndex:1
            },
        },
    };
    app.permission.add(
        { name: 'dmMonHocSdh:manage', menu },
        { name: 'dmMonHocSdh:manage', menu: menuSDH },
        { name: 'dmMonHocSdh:write' },
        { name: 'dmMonHocSdh:delete' },
    );
    app.get('/user/sau-dai-hoc/mon-hoc', app.permission.check('dmMonHocSdh:manage'), app.templates.admin);
    app.get('/user/sau-dai-hoc/mon-hoc/upload', app.permission.check('dmMonHocSdh:write'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesMonHocSdh', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'dmMonHocSdh:manage', 'dmMonHocSdh:write', 'dmMonHocSdh:delete');
            resolve();
        } else resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sau-dai-hoc/mon-hoc/page/:pageNumber/:pageSize', app.permission.check('dmMonHocSdh:manage'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(tenTiengViet) LIKE :searchText',
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
                condition.statement += ' AND khoaSdh = :maKhoa';
                condition.parameter.maKhoa = req.query.maKhoaSdh;
            }
        } else if (req.query.maKhoaSdh) {
            condition = {
                khoaSdh: req.query.maKhoaSdh
            };
        }

        app.model.dmMonHocSdh.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/sau-dai-hoc/mon-hoc/all', app.permission.check('dmMonHocSdh:manage'), (req, res) => {
        app.model.dmMonHocSdh.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/sau-dai-hoc/mon-hoc/item/:ma', app.permission.check('dmMonHocSdh:manage'), (req, res) => {
        app.model.dmMonHocSdh.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/sau-dai-hoc/mon-hoc', app.permission.check('dmMonHocSdh:write'), (req, res) => {
        app.model.dmMonHocSdh.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/sau-dai-hoc/mon-hoc', app.permission.check('dmMonHocSdh:write'), (req, res) => {
        app.model.dmMonHocSdh.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/sau-dai-hoc/mon-hoc', app.permission.check('dmMonHocSdh:delete'), (req, res) => {
        app.model.dmMonHocSdh.delete({ ma: req.body.ma }, error => res.send({ error }));
    });

    app.post('/api/sau-dai-hoc/mon-hoc/multiple', app.permission.check('dmMonHocSdh:write'), async (req, res) => {
        try {
            const data = req.body.data;
            let donViMapping = {};
            const items = await app.model.dmDonVi.getAll({ kichHoat: 1 });
            (items || []).forEach(item => donViMapping[item.ten.toLowerCase()] = item.ma);

            for (let index = 0; index < data.length; index++) {
                let item = data[index];
                const newData = {
                    ma: item.ma,
                    tenTiengViet: item.tenTiengViet,
                    tenTiengAnh: item.tenTiengAnh || '',
                    tcLyThuyet: item.tcLyThuyet || 0,
                    tcThucHanh: item.tcThucHanh || 0,
                    khoaSdh: item.khoaSdh ? donViMapping[item.khoaSdh.toLowerCase()] : '',
                    kichHoat: 1
                };
                let dmMonHocSdh = await app.model.dmMonHocSdh.get({ ma: item.ma });
                if (!dmMonHocSdh) await app.model.dmMonHocSdh.create(newData);
            }
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    // Hook--------------------------------------------------------------------------------------------------------------------------------------------------------
    app.uploadHooks.add('dmMonHocSdhImportData', (req, fields, files, params, done) =>
        app.permission.has(req, () => dmMonHocSdhImportData(req, fields, files, params, done), done, 'dmMonHocSdh:write'));

    const dmMonHocSdhImportData = async (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'dmMonHocSdhImportData' && files.dmMonHocSdhFile && files.dmMonHocSdhFile.length > 0) {
            const srcPath = files.dmMonHocSdhFile[0].path;
            let workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                const worksheet = workbook.getWorksheet(1), element = [], totalRow = worksheet.lastRow.number;
                const handleUpload = (index = 2) => {
                    const value = worksheet.getRow(index).values;
                    if (value.length == 0 || index == totalRow + 1) {
                        app.fs.deleteFile(srcPath);
                        done({ element });
                    } else {
                        let data = {
                            ma: value[1],
                            tenTiengViet: value[2] ? value[2].trim() : '',
                            tenTiengAnh: value[3] ? value[3].trim() : '',
                            tcLyThuyet: value[4],
                            tcThucHanh: value[5],
                            khoaSdh: value[6]
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