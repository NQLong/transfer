module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            501: { title: 'Công văn đến', link: '/user/hcth/cong-van-den', icon: 'fa-caret-square-o-left', backgroundColor: '#00aa00' },
        },
    };
    app.permission.add({ name: 'hcthCongVanDen:read', menu });
    app.permission.add({ name: 'hcthCongVanDen:write' });
    app.permission.add({ name: 'hcthCongVanDen:delete' });

    app.get('/user/hcth/cong-van-den', app.permission.check('staff:login'), app.templates.admin);
    app.get('/user/hcth/cong-van-den/:id', app.permission.check('staff:login'), app.templates.admin);


    //api
    app.get('/api/hcth/cong-van-den/all', app.permission.check('staff:login'), (req, res) => {
        app.model.hcthCongVanDen.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/hcth/cong-van-den/page/:pageNumber/:pageSize', (req, res) => {
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

    app.get('/api/hcth/cong-van-den/page/:pageNumber/:pageSize', (req, res) => {
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

    app.post('/api/hcth/cong-van-den', app.permission.check('staff:login'), (req, res) => {
        app.model.hcthCongVanDen.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/hcth/cong-van-den', app.permission.check('hcthCongVanDen:write'), (req, res) => {
        app.model.hcthCongVanDen.update({ id: req.body.id }, req.body.changes, (errors, items) => res.send({ errors, items }));
    });

    app.delete('/api/hcth/cong-van-den', app.permission.check('hcthCongVanDen:delete'), (req, res) => {
        app.model.hcthCongVanDen.delete({ id: req.body.id }, errors => res.send({ errors }));
    });

    app.get('/api/hcth/cong-van-den/search/page/:pageNumber/:pageSize', app.permission.check('hcthCongVanDen:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { donViGuiCongVan, donViNhanCongVan, canBoNhanCongVan } = (req.query.filter && req.query.filter != '%%%%%%') ? req.query.filter : { donViGuiCongVan: null, donViNhanCongVan: null, canBoNhanCongVan: null };
        app.model.hcthCongVanDen.searchPage(pageNumber, pageSize, donViGuiCongVan, donViNhanCongVan, canBoNhanCongVan, searchTerm, (error, page) => {
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
            const user = req.session.user,
                srcPath = files.hcthCongVanDenFile[0].path,
                filePath = '/' + user.shcc + '_' + (new Date().getTime()).toString() + '_' + files.hcthCongVanDenFile[0].originalFilename,
                destPath = app.assetPath + '/congVanDen' + filePath,
                validUploadFileType = ['.xls', '.xlsx', '.doc', '.docx', '.pdf', '.png', '.jpg'],
                baseNamePath = app.path.extname(srcPath);
            if (!validUploadFileType.includes(baseNamePath.toLowerCase())) {
                done({ error: 'Định dạng tập tin không hợp lệ!' });
                app.deleteFile(srcPath);
            } else {
                app.fs.rename(srcPath, destPath, error => {
                    if (error) {
                        done({ error });
                    } else {
                        done({ data: filePath });
                    }
                });
            }
        }
    };

    //Delete file
    app.put('/api/hcth/cong-van-den/delete-file', app.permission.check('staff:login'), (req, res) => {
        const id = req.body.id,
            index = req.body.index,
            file = req.body.file;
        app.model.hcthCongVanDen.get({ id: id }, (error, item) => {
            if (error) {
                res.send({ error });
            } else if (item && item.linkCongVan) {
                let newList = JSON.parse(item.fileMinhChung);
                app.deleteFile(app.assetPath + '/congVanDen' + newList[index]);
                newList.splice(index, 1);
                app.model.hcthCongVanDen.update(id, { linkCongVan: JSON.stringify(newList) }, (error, item) => {
                    res.send({ error, item });
                });
            } else {
                const filePath = app.path.join(app.assetPath, '/congVanDen', file);
                if (app.fs.existsSync(filePath)) {
                    app.deleteFile(filePath);
                    res.send({ error: null });
                } else {
                    res.send({ error: 'Không tìm thấy đề tài' });
                }
            }
        });
    });

    app.get('/api/hcth/cong-van-den/download/:fileName', app.permission.check('staff:login'), (req, res) => {
        const { fileName } = req.params;
        const dir = app.path.join(app.assetPath, `/congVanDen/${fileName}`);

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

    app.get('/api/hcth/cong-van-den/:id', app.permission.check('staff:login'), (req, res) => {
        app.model.hcthCongVanDen.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });
};
