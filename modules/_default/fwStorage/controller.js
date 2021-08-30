module.exports = app => {
    const menu = { parentMenu: { index: 9200, title: 'Tệp tin lưu trữ', icon: 'fa-file', link: '/user/storage' } };
    app.permission.add(
        { name: 'storage:read', menu },
        { name: 'storage:write', menu },
        { name: 'storage:delete' }

    );
    app.get('/user/storage', app.permission.check('storage:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/storage/item/:id', app.permission.check('storage:read'), (req, res) => {
        if (req.params.id != null) {
            app.model.fwStorage.get({ id: req.params.id }, (error, item) => {
                res.send({ error, item });
            });
        } else {
            res.send({ error: 'Thông tin bạn gửi không hợp lệ!' });
        }
    });

    app.post('/user/upload-file', app.permission.check('storage:write'), (req, res) => {
        app.getUploadForm().parse(req, (error, fields, files) => {
            const body = JSON.parse(fields.data);
            body.path = files.assets[0].originalFilename;
            body.userUpload = req.session.user.lastName + ' ' + req.session.user.firstName;
            body.maDonVi = req.session.user.maDonVi;
            app.fs.rename(files.assets[0].path, app.path.join(app.documentPath, body.path), error => {
                app.model.fwStorage.get({ path: body.path }, (error, itemCheck) => {
                    if (itemCheck) {
                        res.send({ error: 'Đã tồn tại tệp tin trùng tên trong hệ thống.' })
                    } else {
                        app.model.fwStorage.create(body, (error, item) => {
                            res.send({ error, item });
                        })
                    }
                })
            })
        })
    });
    app.get('/api/storage/page/:pageNumber/:pageSize', app.permission.check('storage:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            user = req.session.user,
            condition = { maDonVi: user && user.maDonVi ? user.maDonVi : -1 };
        if (req.query.condition) {
            condition = {
                statement: 'nameDisplay LIKE :searchText',
                parameter: { searchText: `%${req.query.condition}%` },
                active: 1,
            }
        }
        app.model.fwStorage.getPage(pageNumber, pageSize, condition, '*', 'id DESC', (error, page) => {
            const response = {};
            if (error || page == null) {
                res.send({ error });
            } else {
                let list = page.list.map(item => app.clone(item, { content: null }));
                response.page = app.clone(page, { list });
            }
            res.send(response);
        });
    });
    app.put('/api/storage', app.permission.check('storage:write'), (req, res) => {
        let { id, changes } = req.body;
        app.model.fwStorage.update({ id }, changes, (error, item) => {
            res.send({ error, item })
        });
    });

    app.delete('/api/storage', app.permission.check('storage:delete'), (req, res) =>
        app.model.fwStorage.delete2({ id: req.body.id }, error => res.send({ error })));

};