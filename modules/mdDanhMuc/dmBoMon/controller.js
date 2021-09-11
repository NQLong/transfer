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

    app.get('/api/dm-bo-mon/all', app.permission.check('staff:login'), (req, res) => {
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
    app.uploadHooks.add('dmBoMonImportData', (req, fields, files, params, done) =>
        app.permission.has(req, () => dmBoMonImportData(req, fields, files, params, done), done, 'dmBoMon:upload'));

    const dmBoMonImportData = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'dmBoMonImportData' && files.dmBoMonFile && files.dmBoMonFile.length > 0) {
            const srcPath = files.dmBoMonFile[0].path;
            app.excel.readFile(srcPath, workbook => {
                if (workbook) {
                    const worksheet = workbook.getWorksheet(1), element = [], totalRow = worksheet.lastRow.number;
                    const handleUpload = (index = 2) => {
                        const value = worksheet.getRow(index).values;
                        if (value.length == 0 || index == totalRow + 1) {
                            app.deleteFile(srcPath);
                            done({ element });
                        } else {
                            element.push({ ma: value[1], ten: value[2], tenTiengAnh: value[3], maDv: value[4], qdThanhLap: value[5], qdXoaTen: value[6], kichHoat: value[7], ghiChu: value[8] });
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