module.exports = app => {
    const menuSdh = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7511: {
                title: 'Môn học mới (sau 2022)',
                link: '/user/sau-dai-hoc/mon-hoc-moi', icon: 'fa-list', backgroundColor: '#1ca474', groupIndex: 1
            },
        },
    };
    app.permission.add(
        { name: 'dmMonHocSdhMoi:manage', menu: menuSdh },
        { name: 'dmMonHocSdhMoi:write' },
        { name: 'dmMonHocSdhMoi:delete' },
    );
    app.get('/user/sau-dai-hoc/mon-hoc-moi', app.permission.check('dmMonHocSdhMoi:manage'), app.templates.admin);
    app.get('/user/sau-dai-hoc/mon-hoc-moi/upload', app.permission.check('dmMonHocSdhMoi:write'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesMonHocSdhMoi', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'dmMonHocSdhMoi:manage', 'dmMonHocSdhMoi:write', 'dmMonHocSdhMoi:delete');
            resolve();
        } else resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sau-dai-hoc/mon-hoc-moi/page/:pageNumber/:pageSize', app.permission.check('dmMonHocSdhMoi:manage'), (req, res) => {
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

        app.model.sdhDmMonHocMoi.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/sau-dai-hoc/mon-hoc-moi/all', app.permission.check('dmMonHocSdhMoi:manage'), (req, res) => {
        app.model.sdhDmMonHocMoi.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/sau-dai-hoc/mon-hoc-moi/item/:ma', app.permission.check('dmMonHocSdhMoi:manage'), (req, res) => {
        app.model.sdhDmMonHocMoi.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/sau-dai-hoc/mon-hoc-moi', app.permission.check('dmMonHocSdhMoi:write'), (req, res) => {
        app.model.sdhDmMonHocMoi.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/sau-dai-hoc/mon-hoc-moi', app.permission.check('dmMonHocSdhMoi:write'), (req, res) => {
        app.model.sdhDmMonHocMoi.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/sau-dai-hoc/mon-hoc-moi', app.permission.check('dmMonHocSdhMoi:delete'), (req, res) => {
        app.model.sdhDmMonHocMoi.delete({ ma: req.body.ma }, error => res.send({ error }));
    });

    app.post('/api/sau-dai-hoc/mon-hoc-moi/multiple', app.permission.check('dmMonHocSdhMoi:write'), async (req, res) => {
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
                let dmMonHocSdhMoi = await app.model.sdhDmMonHocMoi.get({ ma: item.ma });
                if (!dmMonHocSdhMoi) await app.model.sdhDmMonHocMoi.create(newData);
            }
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    // Hook--------------------------------------------------------------------------------------------------------------------------------------------------------
    app.uploadHooks.add('dmMonHocSdhMoiImportData', (req, fields, files, params, done) =>
        app.permission.has(req, () => dmMonHocSdhMoiImportData(req, fields, files, params, done), done, 'dmMonHocSdhMoi:write'));

    const dmMonHocSdhMoiImportData = async (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'dmMonHocSdhMoiImportData' && files.dmMonHocSdhMoiFile && files.dmMonHocSdhMoiFile.length > 0) {
            const srcPath = files.dmMonHocSdhMoiFile[0].path;
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