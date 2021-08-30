module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            2007: { title: 'Quốc Gia', link: '/user/danh-muc/quoc-gia' },
        },
    };
    app.permission.add(
        { name: 'dmQuocGia:read', menu },
        { name: 'dmQuocGia:write' },
        { name: 'dmQuocGia:upload' },
        { name: 'dmQuocGia:delete' },
    );
    app.get('/user/danh-muc/quoc-gia', app.permission.check('dmQuocGia:read'), app.templates.admin);
    app.get('/user/danh-muc/quoc-gia/upload', app.permission.check('dmQuocGia:upload'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/quoc-gia/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        const statement = ['maCode', 'shortenName', 'tenKhac', 'tenQuocGia', 'country'].map(i => `lower(${i}) LIKE :searchText`).join(' OR ');
        if (req.query.condition) {
            condition = {
                statement,
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            }
        }
        app.model.dmQuocGia.getPage(pageNumber, pageSize, condition, '*', 'maCode', (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/danh-muc/quoc-gia/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmQuocGia.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/quoc-gia/item/:maCode', app.permission.check('user:login'), (req, res) => {
        app.model.dmQuocGia.get({ maCode: req.params.maCode }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/quoc-gia', app.permission.check('dmQuocGia:write'), (req, res) => {
        app.model.dmQuocGia.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/quoc-gia', app.permission.check('dmQuocGia:write'), (req, res) => {
        let changes = app.clone(req.body.changes);
        app.model.dmQuocGia.update({ maCode: req.body.maCode }, changes, (error, items) => res.send({ error, items }));
    });

    app.post('/api/danh-muc/quoc-gia/createFromFile', app.permission.check('dmQuocGia:write'), (req, res) => {
        let dataUpload = req.body.item;
        const errorList = [];
        for (let i = 0; i <= dataUpload.length; i++) {
            if (i == dataUpload.length) {
                res.send({ error: errorList });
            } else {
                const currentItem = dataUpload[i];
                app.model.dmQuocGia.create(currentItem, (error) => error && errorList.push(error));
            }
        }
    });

    app.post('/api/danh-muc/quoc-gia/upload', app.permission.check('dmQuocGia:upload'), (req, res) => {
        app.getUploadForm().parse(req, (error, fields, files) => {
            if (error) {
                res.send({ error });
            } else {
                let hasResponsed = false;
                app.uploadHooks.run(req, fields, files, req.query, data => {
                    if (hasResponsed == false) res.send(data);
                    hasResponsed = true;
                });
            }
        });
    });

    app.delete('/api/danh-muc/quoc-gia', app.permission.check('dmQuocGia:delete'), (req, res) => {
        app.model.dmQuocGia.delete({ maCode: req.body.maCode }, error => res.send({ error }));
    });

    //Hook uploadHooks ------------------------------------------------------------------------------------------------------------------------------
    const dmQuocGiaImportData = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'dmQuocGiaImportData' && files.DmQuocGiaFile && files.DmQuocGiaFile.length > 0) {
            const srcPath = files.DmQuocGiaFile[0].path;
            const workbook = app.excel.create();
            workbook.xlsx.readFile(srcPath).then(() => {
                const worksheet = workbook.getWorksheet(1);
                let index = 1, dmQuocGia = [];
                while (true) {
                    index++;
                    let maCode = worksheet.getCell('A' + index).value;
                    if (maCode) {
                        maCode = maCode.toString().trim();
                        const tenQuocGia = worksheet.getCell('B' + index).value.toString().trim();
                        const country = worksheet.getCell('C' + index).value.toString().trim();
                        const codeAlpha = (worksheet.getCell('D' + index).value != null) ? worksheet.getCell('D' + index).value.toString().trim() : '';
                        const shortenName = (worksheet.getCell('E' + index).value != null) ? worksheet.getCell('E' + index).value.toString().trim() : '';
                        const maKhuVuc = (worksheet.getCell('F' + index).value != null) ? worksheet.getCell('F' + index).value.toString().trim() : '';
                        dmQuocGia.push({ maCode, tenQuocGia, country, codeAlpha, shortenName, maKhuVuc });
                    } else {
                        require('fs').unlinkSync(srcPath);
                        req.session.dmQuocGia = dmQuocGia;
                        done({ dmQuocGia });
                        break;
                    }
                }
            });
        }
    };

    app.uploadHooks.add('dmQuocGiaImportData', (req, fields, files, params, done) =>
        app.permission.has(req, () => dmQuocGiaImportData(req, fields, files, params, done), done, 'dmQuocGia:write'));
};