module.exports = (app) => {
    const FILE_TYPE = 'DEN';

    const menu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            501: { title: 'Công văn đến', link: '/user/hcth/cong-van-den', icon: 'fa-caret-square-o-left', backgroundColor: '#00aa00' },
        },
    };
    app.permission.add({ name: 'hcthCongVanDen:read', menu });
    app.permission.add({ name: 'hcthCongVanDen:write' });
    app.permission.add({ name: 'hcthCongVanDen:delete' });

    app.get('/user/hcth/cong-van-den', app.permission.check('hcthCongVanDen:read'), app.templates.admin);
    app.get('/user/hcth/cong-van-den/:id', app.permission.check('hcthCongVanDen:read'), app.templates.admin);


    //api
    app.get('/api/hcth/cong-van-den/all', app.permission.check('hcthCongVanDen:read'), (req, res) => {
        app.model.hcthCongVanDen.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/hcth/cong-van-den/page/:pageNumber/:pageSize', app.permission.check('hcthCongVanDen:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        const statement = ['soCongVan', 'noiDung', 'chiDao']
            .map(i => `lower(${i}) LIKE :searchText`).join(' OR ');
        if (req.query.condition) {
            condition = {
                statement,
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.hcthCongVanDen.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/hcth/cong-van-den/page/:pageNumber/:pageSize', app.permission.check('hcthCongVanDen:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        const statement = ['soCongVan', 'noiDung', 'chiDao']
            .map(i => `lower(${i}) LIKE :searchText`).join(' OR ');
        if (req.query.condition) {
            condition = {
                statement,
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.hcthCongVanDen.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ error, page });
        });
    });

    app.post('/api/hcth/cong-van-den', app.permission.check('hcthCongVanDen:write'), (req, res) => {
        const { fileList, ...data } = req.body.data;
        app.model.hcthCongVanDen.create(data, (error, item) => {
            if (error)
                res.send({ error, item });
            else {
                let { id } = item;
                app.createFolder(app.path.join(app.assetPath, `/congVanDen/${id}`));
                if (fileList && fileList.length > 0) {
                    updateListFile(fileList, id, ({ error }) => {
                        if (error) {
                            deleteCongVan(id, () => res.send({ error }));
                        }
                        else
                            res.send({ item });
                    });
                }
                else res.send({ item });
            }
        });
    });

    const updateListFile = (listFile, congVanId, done) => {
        const [{ id, ...changes }] = listFile.splice(0, 1),
            sourcePath = app.path.join(app.assetPath, `/congVanDen/new/${changes.ten}`),
            destPath = app.path.join(app.assetPath, `/congVanDen/${congVanId}/${changes.ten}`);
        if (!changes.congVan)
            app.fs.rename(sourcePath, destPath, error => {
                if (error) done && done({ error });
                else
                    app.model.hcthFileCongVan.update({ id }, { ...changes, congVan: congVanId }, (error, item) => {
                        if (error)
                            done && done({ error });
                        else {
                            if (listFile.length > 0)
                                updateListFile(listFile, congVanId, done);
                            else
                                done && done({ error, item });
                        }
                    });
            });
        else
            app.model.hcthFileCongVan.update({ id }, { ...changes }, (error, item) => {
                if (error)
                    done && done({ error });
                else {
                    if (listFile.length > 0)
                        updateListFile(listFile, congVanId, done);
                    else
                        done && done({ error, item });
                }
            });
    };

    const deleteCongVan = (id, done) => {
        app.model.hcthFileCongVan.delete({ congVan: id }, (error) => {
            if (error) done && done({ error });
            else
                app.model.hcthCongVanDen.delete({ id }, error => {
                    app.deleteFolder(app.assetPath + '/congVanDen/' + id);
                    done && done({ error });
                });
        });
    };


    app.put('/api/hcth/cong-van-den', app.permission.check('hcthCongVanDen:write'), (req, res) => {
        const { fileList, ...changes } = req.body.changes;
        app.model.hcthCongVanDen.update({ id: req.body.id }, changes, (errors, item) => {
            if (errors)
                res.send({ errors, item });
            else {
                if (fileList && fileList.length > 0) {
                    updateListFile(fileList, req.body.id, ({ error }) => res.send({ error }));
                }
                else res.send({ item });
            }
        });
    });

    app.delete('/api/hcth/cong-van-den', app.permission.check('hcthCongVanDen:delete'), (req, res) => {
        deleteCongVan(req.body.id, ({ error }) => res.send({ error }));
    });


    app.get('/api/hcth/cong-van-den/search/page/:pageNumber/:pageSize', app.permission.check('hcthCongVanDen:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        let { donViGuiCongVan, donViNhanCongVan, canBoNhanCongVan, timeType, fromTime, toTime } = (req.query.filter && req.query.filter != '%%%%%%') ? req.query.filter :
            { donViGuiCongVan: null, donViNhanCongVan: null, canBoNhanCongVan: null, timeType: null, fromTime: null, toTime: null };
        donViGuiCongVan = donViGuiCongVan || null;
        donViNhanCongVan = donViNhanCongVan || null;
        canBoNhanCongVan = canBoNhanCongVan || null;
        timeType = timeType || null;
        fromTime = fromTime || null;
        toTime = toTime || null;
        app.model.hcthCongVanDen.searchPage(pageNumber, pageSize, donViGuiCongVan, donViNhanCongVan, canBoNhanCongVan, timeType, fromTime, toTime, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.createFolder(app.path.join(app.assetPath, '/congVanDen'));


    app.uploadHooks.add('hcthCongVanDenFile', (req, fields, files, params, done) =>
        app.permission.has(req, () => hcthCongVanDenFile(req, fields, files, params, done), done, 'staff:login'));

    const hcthCongVanDenFile = (req, fields, files, params, done) => {
        if (
            fields.userData &&
            fields.userData[0] &&
            fields.userData[0].startsWith('hcthCongVanDenFile') &&
            files.hcthCongVanDenFile &&
            files.hcthCongVanDenFile.length > 0) {
            const
                srcPath = files.hcthCongVanDenFile[0].path,
                isNew = fields.userData[0].substring(19) == 'new',
                id = fields.userData[0].substring(19),
                originalFilename = files.hcthCongVanDenFile[0].originalFilename,
                filePath = (isNew ? '/new/' : `/${id}/`) + originalFilename,
                destPath = app.assetPath + '/congVanDen' + filePath,
                validUploadFileType = ['.xls', '.xlsx', '.doc', '.docx', '.pdf', '.png', '.jpg', '.jpeg'],
                baseNamePath = app.path.extname(srcPath);
            if (!validUploadFileType.includes(baseNamePath.toLowerCase())) {
                done && done({ error: 'Định dạng tập tin không hợp lệ!' });
                app.deleteFile(srcPath);
            } else {
                app.createFolder(
                    app.path.join(app.assetPath, '/congVanDen/' + (isNew ? '/new' : '/' + id))
                );
                app.fs.rename(srcPath, destPath, error => {
                    if (error) {
                        done && done({ error });
                    } else {
                        app.model.hcthFileCongVan.create({ ten: originalFilename, thoiGian: new Date().getTime(), loai: FILE_TYPE, congVan: id === 'new' ? null : id }, (error, item) => done && done({ error, item }));
                    }
                });
            }
        }
    };

    //Delete file
    app.put('/api/hcth/cong-van-den/delete-file', app.permission.check('hcthCongVanDen:delete'), (req, res) => {
        const
            id = req.body.id,
            fileId = req.body.fileId,
            file = req.body.file,
            congVan = id || null,
            filePath = app.assetPath + '/congVanDen/' + (id ? id + '/' : 'new/') + file;
        app.model.hcthFileCongVan.delete({ id: fileId, congVan }, (error) => {
            if (error) {
                res.send({ error });
            }
            else {
                if (app.fs.existsSync(filePath))
                    app.deleteFile(filePath);
                res.send({ error: null });
            }
        });
    });

    app.get('/api/hcth/cong-van-den/download/:id/:fileName', app.permission.check('hcthCongVanDen:read'), (req, res) => {
        const { id, fileName } = req.params;
        const dir = app.path.join(app.assetPath, `/congVanDen/${id}`);
        if (app.fs.existsSync(dir)) {
            const serverFileNames = app.fs.readdirSync(dir).filter(v => app.fs.lstatSync(app.path.join(dir, v)).isFile());
            for (const serverFileName of serverFileNames) {
                const clientFileIndex = serverFileName.indexOf(fileName);
                if (clientFileIndex !== -1 && serverFileName.slice(clientFileIndex) === fileName) {
                    return res.sendFile(app.path.join(dir, serverFileName));
                }
            }
        }

        res.status(400).send('Không tìm thấy tập tin');
    });

    app.get('/api/hcth/cong-van-den/:id', app.permission.check('hcthCongVanDen:read'), (req, res) => {
        const id = req.params.id;
        app.model.hcthCongVanDen.get({ id }, (error, item) => {
            if (error)
                res.send({ error, item });
            else
                app.model.hcthFileCongVan.getAll({ congVan: id, loai: FILE_TYPE }, '*', 'thoiGian', (error, files) => res.send({ error, item: { ...item, listFile: files || [] } }));
        });
    });

};