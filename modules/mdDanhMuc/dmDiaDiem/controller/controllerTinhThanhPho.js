module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: { 2114: { title: 'Tỉnh thành phố', link: '/user/danh-muc/tinh-thanh-pho' } },
    };
    app.permission.add(
        { name: 'dmTinhThanhPho:read', menu },
        { name: 'dmTinhThanhPho:write' },
        { name: 'dmTinhThanhPho:delete' }
    );
    app.get('/user/danh-muc/tinh-thanh-pho', app.permission.check('dmTinhThanhPho:read'), app.templates.admin);
    app.get('/user/danh-muc/tinh-thanh-pho/upload', app.permission.check('dmTinhThanhPho:write'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/tinh-thanh-pho/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmTinhThanhPho.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.post('/api/danh-muc/tinh-thanh-pho', app.permission.check('dmTinhThanhPho:write'), (req, res) =>
        app.model.dmTinhThanhPho.create(req.body.dmTinhThanhPho, (error, item) => res.send({ error, item })));

    app.get('/api/danh-muc/tinh-thanh-pho/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmTinhThanhPho.getAll((error, items) => res.send({ error, items }));
    });

    app.post('/api/danh-muc/tinh-thanh-pho/multiple', app.permission.check('dmTinhThanhPho:write'), (req, res) => {
        const data = req.body.multiDMTinhThanhPho;
        const isOverride = req.body.isOverride;
        const dataImported = [];
        const handleCreate = index => {
            if (index >= data.length) res.send({ data: { message: 'Upload success', items: dataImported } });
            else
                app.model.dmTinhThanhPho.get({ ma: data[index].ma }, (error, item) => {
                    if (error) res.send({ error });
                    else if (item) {
                        if (isOverride == 'TRUE')
                            app.model.dmTinhThanhPho.update({ ma: data[index].ma }, data[index], (error, item) => {
                                if (error) res.send({ error });
                                else {
                                    dataImported.push(item);
                                    handleCreate(index + 1);
                                }
                            });
                        else handleCreate(index + 1);
                    }
                    else app.model.dmTinhThanhPho.create(data[index], (error, item) => {
                        if (error) res.send({ error });
                        else {
                            dataImported.push(item);
                            handleCreate(index + 1);
                        }
                    });
                });
        };
        handleCreate(0);
    });

    app.put('/api/danh-muc/tinh-thanh-pho', app.permission.check('dmTinhThanhPho:write'), (req, res) =>
        app.model.dmTinhThanhPho.update(req.body.ma, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/danh-muc/tinh-thanh-pho', app.permission.check('dmTinhThanhPho:delete'), (req, res) =>
        app.model.dmTinhThanhPho.delete({ ma: req.body.ma }, error => res.send({ error })));

    // Hook uploadHooks -----------------------------------------------------------------------------------------------------------------------------
    app.uploadHooks.add('dmTinhThanhPhoImportData', (req, fields, files, params, done) =>
        app.permission.has(req, () => dmTinhThanhPhoImportData(req, fields, files, params, done), done, 'dmTinhThanhPho:write'));

    const dmTinhThanhPhoImportData = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'dmTinhThanhPhoImportData' && files.DMTinhThanhPhoFile && files.DMTinhThanhPhoFile.length > 0) {
            const srcPath = files.DMTinhThanhPhoFile[0].path;
            app.excel.readFile(srcPath, workbook => {
                if (workbook) {
                    const worksheet = workbook.getWorksheet(1), data = [], totalRow = worksheet.lastRow.number;
                    const handleUpload = index => {
                        const value = worksheet.getRow(index).values;
                        if (value.length == 0 || index == totalRow + 1) {
                            app.deleteFile(srcPath);
                            done({ data });
                        } else {
                            data.push({ 'ma': value[1], 'ten': value[2] });
                            handleUpload(index + 1);
                        }
                    };
                    handleUpload(2);
                } else {
                    app.deleteFile(srcPath);
                    done({ error: 'Error' });
                }
            }).catch(error => done({ error }));
        }
    };
};