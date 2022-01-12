module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4066: { title: 'Tài Khoản Kế Toán', link: '/user/danh-muc/tai-khoan-ke-toan' },
        },
    };
    app.permission.add(
        { name: 'dmTaiKhoanKeToan:read', menu },
        { name: 'dmTaiKhoanKeToan:write' },
        { name: 'dmTaiKhoanKeToan:upload' },
        { name: 'dmTaiKhoanKeToan:delete' },
    );
    app.get('/user/danh-muc/tai-khoan-ke-toan', app.permission.check('dmTaiKhoanKeToan:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/tai-khoan-ke-toan/page/:pageNumber/:pageSize', app.permission.check('dmTaiKhoanKeToan:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        const statement = ['ma', 'tenTaiKhoan'].map(i => `lower(${i}) LIKE :searchText`).join(' OR ');
        if (req.query.condition) {
            condition = {
                statement,
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmTaiKhoanKeToan.getPage(pageNumber, pageSize, condition, '*', 'ma', (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/danh-muc/tai-khoan-ke-toan/all', app.permission.check('dmTaiKhoanKeToan:read'), (req, res) => {
        app.model.dmTaiKhoanKeToan.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/tai-khoan-ke-toan/item/:ma', app.permission.check('dmTaiKhoanKeToan:read'), (req, res) => {
        app.model.dmTaiKhoanKeToan.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/tai-khoan-ke-toan', app.permission.check('dmTaiKhoanKeToan:write'), (req, res) => {
        app.model.dmTaiKhoanKeToan.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/tai-khoan-ke-toan', app.permission.check('dmTaiKhoanKeToan:write'), (req, res) => {
        let changes = app.clone(req.body.changes);
        app.model.dmTaiKhoanKeToan.update({ ma: req.body.ma }, changes, (error, items) => res.send({ error, items }));
    });

    app.post('/api/danh-muc/tai-khoan-ke-toan/createFromFile', app.permission.check('dmTaiKhoanKeToan:write'), (req, res) => {
        let dataUpload = req.body.item;
        const errorList = [];
        for (let i = 0; i <= dataUpload.length; i++) {
            if (i == dataUpload.length) {
                res.send({ error: errorList });
            } else {
                const currentItem = dataUpload[i];
                app.model.dmTaiKhoanKeToan.create(currentItem, (error) => {
                    if (error) errorList.push(error);
                });
            }
        }
    });

    app.post('/api/danh-muc/tai-khoan-ke-toan/upload', app.permission.check('dmTaiKhoanKeToan:upload'), (req, res) => {
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


    app.delete('/api/danh-muc/tai-khoan-ke-toan', app.permission.check('dmTaiKhoanKeToan:delete'), (req, res) => {
        app.model.dmTaiKhoanKeToan.delete({ ma: req.body.ma }, error => res.send({ error }));
    });

    //Hook uploadHooks ------------------------------------------------------------------------------------------------------------------------------
    const dmTaiKhoanKeToanImportData = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'dmTaiKhoanKeToanImportData' && files.DmTaiKhoanKeToanFile && files.DmTaiKhoanKeToanFile.length > 0) {
            const srcPath = files.DmTaiKhoanKeToanFile[0].path;
            const workbook = app.excel.create();
            workbook.xlsx.readFile(srcPath).then(() => {
                const worksheet = workbook.getWorksheet(1);
                let index = 1, dmTaiKhoanKeToan = [];
                while (true) {
                    index++;
                    let ma = worksheet.getCell('A' + index).value;
                    if (ma) {
                        ma = ma.toString().trim();
                        const tenTaiKhoan = worksheet.getCell('B' + index).value.toString().trim();
                        dmTaiKhoanKeToan.push({ ma, tenTaiKhoan });
                    } else {
                        require('fs').unlinkSync(srcPath);
                        req.session.dmTaiKhoanKeToan = dmTaiKhoanKeToan;
                        done({ dmTaiKhoanKeToan });
                        break;
                    }
                }
            });
        }
    };

    app.uploadHooks.add('dmTaiKhoanKeToanImportData', (req, fields, files, params, done) =>
        app.permission.has(req, () => dmTaiKhoanKeToanImportData(req, fields, files, params, done), done, 'dmTaiKhoanKeToan:write'));
};