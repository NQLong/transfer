module.exports = app => {
    const menu = { parentMenu: { index: 9200, title: 'Tệp tin lưu trữ', icon: 'fa-file', link: '/user/storage' } };
    app.permission.add(
        { name: 'storage:read', menu },
        { name: 'storage:write', menu },
        { name: 'storage:delete' }

    );
    app.get('/user/storage', app.permission.check('storage:read'), app.templates.admin);
    app.get('/user/storage/category', app.permission.check('category:read'), app.templates.admin);

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

    app.uploadHooks.add('fwStorageFile', (req, fields, files, params, done) =>
        app.permission.has(req, () => fwStorageFile(req, fields, files, params, done), done, 'staff:login'));

    const fwStorageFile = (req, fields, files, params, done) => {

        if (fields.userData && fields.userData[0] && fields.userData[0].startsWith('fwStorageFile') && files.fwStorageFile && files.fwStorageFile.length > 0) {
            const
                srcPath = files.fwStorageFile[0].path,
                body = JSON.parse(fields.data),
                id = fields.userData[0].substring(14),
                validUploadFileType = ['.xls', '.xlsx', '.doc', '.docx', '.pdf', '.png', '.jpg', '.jpeg'],
                baseNamePath = app.path.extname(srcPath);
            if (!validUploadFileType.includes(baseNamePath.toLowerCase())) {
                done && done({ error: 'Định dạng tập tin không hợp lệ!' });
                app.deleteFile(srcPath);
            } else {
                const newData = {
                    nameDisplay: body.nameDisplay,
                    note: body.note,
                    active: Number(body.active),
                    userUpload: req.session.user.lastName + ' ' + req.session.user.firstName,
                    maDonVi: req.session.user.maDonVi

                };
                if (id == 'new') {
                    app.model.fwStorage.create(newData, (error, item) => {
                        if (error || !item) {
                            done && done({ error });
                            app.deleteFile(srcPath);
                        } else {
                            const path = item.id + app.path.extname(srcPath);
                            app.fs.rename(srcPath, app.path.join(app.assetPath, 'document', path), error => {
                                if (error) {
                                    done && done({ error });
                                } else {
                                    app.model.fwStorage.update({ id: item.id }, { path: path }, (error, item) => {
                                        done && done({ error, item });
                                    });
                                }
                            });
                        }
                    });
                } else {

                    app.model.fwStorage.get({ id: id }, (error, item) => {
                        app.deleteFile(app.path.join(app.assetPath, 'document', item.path));

                        const path = id + app.path.extname(srcPath);
                        app.fs.rename(srcPath, app.path.join(app.assetPath, 'document', path), error => {

                            if (error) {
                                done && done({ error });
                            } else {
                                app.model.fwStorage.update({ id: id }, { ...newData, path: path }, (error, item) => {
                                    done && done({ error, item });
                                });
                            }
                        });
                    });
                }
                // TODO: getItem => Xoa file cu => fs.rename => update Path

            }
        }
    };

    app.get('/api/storage/download/:name', app.permission.check('storage:read'), (req, res) => {
        const fileName = req.params.name, path = app.path.join(app.documentPath, fileName);
        app.model.fwStorage.get({ path: fileName }, (error, item) => {
            if (app.fs.existsSync(path) && !error && item) {
                let displayName = req.query.displayName ? `${req.query.displayName}${app.path.extname(fileName)}` : fileName;
                res.download(path, displayName);
            } else {
                res.end();
            }
        });

    });
    app.get('/api/storage/all', app.permission.check('storage:read'), (req, res) => {
        app.model.fwStorage.getAll({}, '*', 'nameDisplay asc', (error, items) => {
            res.send({ error, items });
        });
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
            };
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
            res.send({ error, item });
        });
    });



    app.delete('/api/storage', app.permission.check('storage:delete'), (req, res) => {
        let pathDeleteFile = app.assetPath + '/document/';

        app.model.fwStorage.get({ id: req.body.id }, (error, itemCheck) => {

            pathDeleteFile += itemCheck.path;
        });
        app.model.fwStorage.delete({ id: req.body.id }, error => {
            if (app.fs.existsSync(pathDeleteFile))
                app.deleteFile(pathDeleteFile);
            res.send({ error });
        });
    });



};
