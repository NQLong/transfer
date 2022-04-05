module.exports = (app) => {
    const CONG_VAN_TYPE = 'DEN';
    const MA_CHUC_VU_HIEU_TRUONG = '001';

    const menu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            501: { title: 'Công văn đến', link: '/user/hcth/cong-van-den', icon: 'fa-caret-square-o-left', backgroundColor: '#00aa00' },
        },
    };
    app.permission.add({ name: 'hcthCongVanDen:read', menu });
    app.permission.add({ name: 'hcthCongVanDen:write' });
    app.permission.add({ name: 'hcthCongVanDen:delete' });
    app.permission.add({ name: 'hcth:login' });

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
        const { fileList, chiDao, quyenChiDao, ...data } = req.body.data;
        const dsCanBoChiDao = quyenChiDao.split(',');
        app.model.qtChucVu.get({ maChucVu: MA_CHUC_VU_HIEU_TRUONG }, (error, hieuTruong) => {
            if (error)
                res.send(error);
            else {
                if (hieuTruong && hieuTruong.shcc && !dsCanBoChiDao.includes(hieuTruong.shcc))
                    dsCanBoChiDao.push(hieuTruong.shcc);
                app.model.hcthCongVanDen.create({ ...data, quyenChiDao: dsCanBoChiDao.toString() }, (error, item) => {
                    if (error)
                        res.send({ error, item });
                    else {
                        let { id } = item;
                        app.createFolder(app.path.join(app.assetPath, `/congVanDen/${id}`));
                        createChiDaoFromList(chiDao, id, ({ error }) => {
                            if (error)
                                res.send({ error, item });
                            else
                                updateListFile(fileList, id, ({ error }) => {
                                    if (error) {
                                        deleteCongVan(id, () => res.send({ error }));
                                    }
                                    else
                                        res.send({ item });
                                });
                        });
                    }
                });
            }
        });
    });


    const updateListFile = (listFile, congVanId, done) => {
        if (listFile && listFile.length > 0) {
            const [{ id, ...changes }] = listFile.splice(0, 1),
                sourcePath = app.path.join(app.assetPath, `/congVanDen/new/${changes.ten}`),
                destPath = app.path.join(app.assetPath, `/congVanDen/${congVanId}/${changes.ten}`);
            if (!changes.congVan)
                app.fs.rename(sourcePath, destPath, error => {
                    if (error) done && done({ error });
                    else
                        app.model.hcthFileCongVan.update({ id }, { ...changes, congVan: congVanId }, (error) => {
                            if (error)
                                done && done({ error });
                            else updateListFile(listFile, congVanId, done);
                        });
                });
            else
                app.model.hcthFileCongVan.update({ id }, { ...changes }, (error) => {
                    if (error)
                        done && done({ error });
                    else
                        updateListFile(listFile, congVanId, done);
                });
        } else
            done && done({});
    };

    const deleteCongVan = (id, done) => {
        app.model.hcthFileCongVan.delete({ congVan: id }, (error) => {
            if (error) done && done({ error });
            else
                app.model.hcthChiDao.delete({ congVan: id, loai: CONG_VAN_TYPE }, (error) => {
                    if (error) done && done({ error });
                    else
                        app.model.hcthCongVanDen.delete({ id }, error => {
                            app.deleteFolder(app.assetPath + '/congVanDen/' + id);
                            done && done({ error });
                        });
                });
        });
    };


    app.put('/api/hcth/cong-van-den', app.permission.check('hcthCongVanDen:read'), (req, res) => {
        const { fileList, chiDao, ...changes } = req.body.changes;
        app.model.hcthCongVanDen.update({ id: req.body.id }, changes, (errors, item) => {
            if (errors)
                res.send({ errors, item });
            else
                createChiDaoFromList(chiDao, req.body.id, () => {
                    updateListFile(fileList, req.body.id, ({ error }) => res.send({ error, item }));
                });
        });
    });


    const createChiDaoFromList = (listChiDao, congVanId, done) => {
        if (listChiDao && listChiDao.length > 0) {
            const [chiDao] = listChiDao.splice(0, 1);
            app.model.hcthChiDao.create({ ...chiDao, congVan: congVanId, loai: CONG_VAN_TYPE }, (error) => {
                if (error)
                    done && done({ error });
                else createChiDaoFromList(listChiDao, congVanId, done);
            });
        }
        else
            done && done({ error: null });
    };

    app.delete('/api/hcth/cong-van-den', app.permission.check('hcthCongVanDen:delete'), (req, res) => {
        deleteCongVan(req.body.id, ({ error }) => res.send({ error }));
    });

    const getCurrentPermissions = (req) => (req.session && req.session.user && req.session.user.permissions) || [];

    const getUserPermission = (req, prefix, listPermissions = ['read', 'write', 'delete']) => {
        const permission = {}, currentPermissions = getCurrentPermissions(req);
        listPermissions.forEach(item => permission[item] = currentPermissions.includes(`${prefix}:${item}`));
        return permission;
    };


    app.get('/api/hcth/cong-van-den/search/page/:pageNumber/:pageSize', app.permission.check('hcthCongVanDen:read'), (req, res) => {
        const
            obj2Db = { 'ngayHetHan': 'NGAY_HET_HAN', 'ngayNhan': 'NGAY_NHAN' },
            pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        let { donViGuiCongVan, donViNhanCongVan, canBoNhanCongVan, timeType, fromTime, toTime, congVanYear, sortBy, sortType } = (req.query.filter && req.query.filter != '%%%%%%') ? req.query.filter :
            { donViGuiCongVan: null, donViNhanCongVan: null, canBoNhanCongVan: null, timeType: null, fromTime: null, toTime: null, congVanYear: null };
        let donViCanBo = '', canBo = '';



        const rectorsPermission = getUserPermission(req, 'rectors', ['login']);
        const hcthPermission = getUserPermission(req, 'hcth', ['login']);

        if (!rectorsPermission.login && !hcthPermission.login) {
            donViCanBo = (req.session?.user?.staff?.donViQuanLy || []);
            donViCanBo = donViCanBo.map(item => item.maDonVi).toString();
            canBo = req.session?.user?.shcc || '';
        }

        if (congVanYear && Number(congVanYear) > 1900) {
            timeType = 2;
            fromTime = new Date(`${congVanYear}-01-01`).getTime();
            toTime = new Date(`${Number(congVanYear) + 1}-01-01`).getTime();
        }

        app.model.hcthCongVanDen.searchPage(pageNumber, pageSize, donViGuiCongVan, donViNhanCongVan, canBoNhanCongVan, timeType, fromTime, toTime, obj2Db[sortBy] || '', sortType, canBo, donViCanBo, searchTerm, (error, page) => {
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
                        app.model.hcthFileCongVan.create({ ten: originalFilename, thoiGian: new Date().getTime(), loai: CONG_VAN_TYPE, congVan: id === 'new' ? null : id }, (error, item) => done && done({ error, item }));
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
                app.model.hcthFileCongVan.getAll({ congVan: id, loai: CONG_VAN_TYPE }, '*', 'thoiGian', (error, files) => {
                    app.model.hcthChiDao.getCongVanChiDao(id, CONG_VAN_TYPE, (errors, chiDao) => {
                        res.send({ error: error || errors, item: { ...item, listFile: files || [], danhSachChiDao: chiDao?.rows || [] } });
                    });
                });
        });
    });

    app.post('/api/hcth/cong-van-den/chi-dao', app.permission.check('hcthCongVanDen:read'), (req, res) => {
        app.model.hcthChiDao.create({ ...req.body.data, loai: CONG_VAN_TYPE }, (error, item) => res.send({ error, item }));
    });
};