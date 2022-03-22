module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            531: { title: 'Công văn đi', link: '/user/hcth/cong-van-di', icon: 'fa-caret-square-o-right', backgroundColor: '#00aa00' },
        },
    };
    app.permission.add(
        { name: 'hcthCongVanDi:read', menu},
        { name: 'hcthCongVanDi:write'},
        { name: 'hcthCongVanDi:delete'},
        { name: 'staff:login'});
    app.get('/user/hcth/cong-van-di', app.permission.check('staff:login'), app.templates.admin);
    
    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/hcth/cong-van-di/search/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { donViGui, donViNhan, canBoNhan} = (req.query.filter && req.query.filter != '%%%%%%') ? req.query.filter : { donViGui: null, donViNhan: null, canBoNhan: null};
        app.model.hcthCongVanDi.searchPage(pageNumber, pageSize, canBoNhan, donViGui, donViNhan, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });
    
    app.get('/api/hcth/cong-van-di/all', app.permission.check('staff:login'), (req, res) => {
        app.model.hcthCongVanDi.getAll((error, items) => res.send({ error, items }));
    });
    
    app.get('/api/hcth/cong-van-di/item/:id', app.permission.check('staff:login'), (req, res) => {
        app.model.hcthCongVanDi.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/hcth/cong-van-di', app.permission.check('staff:login'), (req, res) => {
        console.log(req.body);
        app.model.hcthCongVanDi.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/hcth/cong-van-di', app.permission.check('hcthCongVanDi:write'), (req, res) => {
        app.model.hcthCongVanDi.update({ id: req.body.id }, req.body.changes, (errors, items) => res.send({ errors, items }));
    });

    app.delete('/api/hcth/cong-van-di', app.permission.check('hcthCongVanDi:delete'), (req, res) => {
        app.model.hcthCongVanDi.delete({ id: req.body.id }, errors => res.send({ errors }));
    });

    app.get('/api/hcth/cong-van-di/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        const statement = ['noiDung']
            .map(i => `lower(${i}) LIKE :searchText`).join(' OR ');
        if (req.query.condition) {
            condition = {
                statement,
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.hcthCongVanDi.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ error, page });
        });
    });


    // User API  -----------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.assetPath, '/congVanDi'));

    app.get('/api/hcth/cong-van-di/download/:id/:fileName', app.permission.check('staff:login'), (req, res) => {
        const { id, fileName } = req.params;
        const dir = app.path.join(app.assetPath, `/congVanDi/${id}`);

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

    app.uploadHooks.add('hcthCongVanDiFile', (req, fields, files, params, done) =>
        app.permission.has(req, () => hcthCongVanDiFile(req, fields, files, params, done), done, 'staff:login'));

    const hcthCongVanDiFile = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0].startsWith('hcthCongVanDiFile') && files.hcthCongVanDiFile && files.hcthCongVanDiFile.length > 0) {
            const user = req.session.user,
                srcPath = files.hcthCongVanDiFile[0].path,
                filePath = (fields.userData[0].substring(19) != 'new' ? '/' + fields.userData[0].substring(19) : '/new') + '/' + user.shcc + '_' + (new Date().getTime()).toString() + '_' + files.deTaiNCKHStaffFile[0].originalFilename,
                destPath = app.assetPath + '/congVanDi' + filePath,
                validUploadFileType = ['.xls', '.xlsx', '.doc', '.docx', '.pdf', '.png', '.jpg'],
                baseNamePath = app.path.extname(srcPath);
            if (!validUploadFileType.includes(baseNamePath.toLowerCase())) {
                done({ error: 'Định dạng tập tin không hợp lệ!' });
                app.deleteFile(srcPath);
            } else {
                app.createFolder(
                    app.path.join(app.assetPath, '/congVanDi/' + (fields.userData[0].substring(19) != 'new' ? '/' + fields.userData[0].substring(19) : '/new'))
                );
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
    
    // Delete File
    
};    

