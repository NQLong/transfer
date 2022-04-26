module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            503: { title: 'Giao nhiệm vụ', link: '/user/hcth/giao-nhiem-vu', icon: 'fa-list-alt', backgroundColor: '#de602f' },
        },
    };
    app.permission.add(
        { name: 'hcthGiaoNhiemVu:read' },
        { name: 'hcthGiaoNhiemVu:write' },
        { name: 'hcthGiaoNhiemVu:delete' },
        { name: 'hcth:login'},
        { name: 'staff:login', menu},
    );

    app.get('/user/hcth/giao-nhiem-vu', app.permission.check('staff:login'), app.templates.admin);
    app.get('/user/hcth/giao-nhiem-vu/:id', app.permission.check('staff:login'), app.templates.admin);

    //api
    app.get('/api/hcth/giao-nhiem-vu/all', app.permission.check('staff:login'), (req, res) => {
        app.model.hcthGiaoNhiemVu.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/hcth/giao-nhiem-vu/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
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
        app.model.hcthGiaoNhiemVu.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ error, page });
        });
    });

    const updateListFile = (listFile, nhiemVuId, done) => {
        if (listFile && listFile.length > 0) {
            const [{ id, ...changes }] = listFile.splice(0, 1),
                sourcePath = app.path.join(app.assetPath, `/nhiemVu/new/${changes.ten}`),
                destPath = app.path.join(app.assetPath, `/nhiemVu/${nhiemVuId}/${changes.ten}`);
            if (!changes.congVan)
                app.fs.rename(sourcePath, destPath, error => {
                    if (error) done && done({ error });
                    else
                        app.model.hcthFileCongVan.update({ id }, { ...changes, congVan: nhiemVuId }, (error) => {
                            if (error)
                                done && done({ error });
                            else updateListFile(listFile, nhiemVuId, done);
                        });
                });
            else
                app.model.hcthFileCongVan.update({ id }, { ...changes }, (error) => {
                    if (error)
                        done && done({ error });
                    else
                        updateListFile(listFile, nhiemVuId, done);
                });
        } else {
            done && done({error: null});
        }

    };

    const deleteNhiemVu = (id, done) => {
        app.model.hcthFileCongVan.delete({ congVan: id }, (error) => {
            if (error) done && done({ error });
            else
                app.model.hcthGiaoNhiemVu.delete({ id }, error => {
                    app.deleteFolder(app.assetPath + '/nhiemVu/' + id);
                    done && done({ error });
                });

        });
    };

    app.post('/api/hcth/giao-nhiem-vu', app.permission.orCheck('manager:write', 'htch:manage', 'rectors:login'), (req, res) => {
        const { fileList = [], canBoNhan } = req.body.data;
        const postData = req.body.data;
        delete postData.canBoNhan;
        app.model.hcthGiaoNhiemVu.create(postData, (error, item) => {
            if (error) {
                res.send({ error, item });
            } else {
                let { id, nguoiTao } = item;
                app.model.hcthCanBoNhan.create({
                    canBoNhan,
                    loai: 'NHIEM_VU',
                    key: id,
                    nguoiTao
                }, (canBoNhanError, result) => {
                    if (canBoNhanError) {
                        res.send({ canBoNhanError, result });
                    } else {
                        app.createFolder(app.path.join(app.assetPath, `/nhiemVu/${id}`));
                        try {
                            updateListFile(fileList, id, ({ error }) => {
                                if (error) {
                                    throw error;
                                }
                                else {
                                    res.send({ error, item });
                                }
                            });
                        } catch (error) {
                            deleteNhiemVu(id, () => res.send({ error }));
                        }
                    }
                });
            }
        });
    });

    app.put('/api/hcth/giao-nhiem-vu', app.permission.orCheck('manager:write', 'rectors:login', 'hcth:manager', 'president:login'), (req, res) => {
        // app.model.hcthGiaoNhiemVu.update({ id: req.body.id }, req.body.changes, (errors, items) => res.send({ errors, items }));
        const { fileList, ...changes } = req.body.changes;
        const postData = {
            nguoiTao: changes.nguoiTao,
            tieuDe: changes.tieuDe,
            noiDung: changes.noiDung,
            ngayBatDau: Number(changes.ngayBatDau),
            ngayKetThuc: Number(changes.ngayKetThuc),
            doUuTien: Number(changes.doUuTien),
            ngayTao: Number(changes.ngayTao),
            donViNhan: changes.donViNhan
        };
        app.model.hcthGiaoNhiemVu.update({ id: parseInt(req.body.id) }, postData, (errors, item) => {
            if (errors) {
                res.send({ errors, item });
            }

            else {
                app.model.hcthCanBoNhan.update({ 
                    key: parseInt(req.body.id),
                    loai: 'NHIEM_VU',
                    nguoiTao: postData.nguoiTao
                }, { canBoNhan: changes.canBoNhan }, (canBoNhanError, result) => {
                    if (canBoNhanError) {
                        res.send({ canBoNhanError, result });
                    } else {
                        updateListFile(fileList, req.body.id, ({ error }) => {
                            if (error) {
                                throw error;
                            }
                            else {
                                res.send({ error, item });
                            }
                        });
                    }
                });
            }
        });
    });

    app.delete('/api/hcth/giao-nhiem-vu', app.permission.check('hcthGiaoNhiemVu:delete'), (req, res) => {
        app.model.hcthGiaoNhiemVu.delete({ id: req.body.id }, errors => {
            app.deleteFolder(app.assetPath + '/congVanDen/' + req.body.id);
            res.send({ errors });
        });
    });

    app.get('/api/hcth/giao-nhiem-vu/search/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        let { donViNhan, canBoNhan, userId } = (req.query.filter && req.query.filter != '%%%%%%') ? req.query.filter :
            { donViNhan: null, canBoNhan: null, ngayHetHan: null, userId: req.query.filter.userId };
        donViNhan = donViNhan || null;
        canBoNhan = canBoNhan || null;
        const user = req.session.user;
        const permissions = user.permissions;

        if (permissions.includes('hcth:manage') || permissions.includes('president:login')) {
            userId = null;
        } 

        app.model.hcthGiaoNhiemVu.searchPage(pageNumber, pageSize, userId, donViNhan, canBoNhan, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
        
    });

    app.createFolder(app.path.join(app.assetPath, '/nhiemVu'));


    app.uploadHooks.add('hcthGiaoNhiemVuFile', (req, fields, files, params, done) =>
        app.permission.has(req, () => hcthGiaoNhiemVuFile(req, fields, files, params, done), done, 'staff:login'));

    const hcthGiaoNhiemVuFile = (req, fields, files, params, done) => {
        if (
            fields.userData &&
            fields.userData[0] &&
            fields.userData[0].startsWith('hcthGiaoNhiemVuFile') &&
            files.hcthGiaoNhiemVuFile &&
            files.hcthGiaoNhiemVuFile.length > 0) {
            const
                srcPath = files.hcthGiaoNhiemVuFile[0].path,
                isNew = fields.userData[0].substring(19) == 'new',
                id = fields.userData[0].substring(20),
                originalFilename = files.hcthGiaoNhiemVuFile[0].originalFilename,
                filePath = (isNew ? '/new/' : `/${id}/`) + (new Date().getTime()).toString() + '_' + files.hcthGiaoNhiemVuFile[0].originalFilename,
                destPath = app.assetPath + '/nhiemVu' + filePath,
                validUploadFileType = ['.xls', '.xlsx', '.doc', '.docx', '.pdf', '.png', '.jpg', '.jpeg'],
                baseNamePath = app.path.extname(srcPath);
            if (!validUploadFileType.includes(baseNamePath.toLowerCase())) {
                done({ error: 'Định dạng tập tin không hợp lệ!' });
                app.deleteFile(srcPath);
            } else {
                app.createFolder(
                    app.path.join(app.assetPath, '/nhiemVu/' + (isNew ? '/new' : '/' + id))
                );
                app.fs.rename(srcPath, destPath, error => {
                    if (error) {
                        done && done({ error });
                    } else {
                        app.model.hcthFileCongVan.create({ ten: originalFilename, thoiGian: new Date().getTime(), loai: 'NHIEM_VU', congVan: id === 'new' ? null : id }, (error, item) => {
                            done && done({ error, item });
                        });
                    }
                });
            }
        }
    };

    app.get('/api/hcth/giao-nhiem-vu/download/:id/:fileName', app.permission.check('staff:login'), (req, res) => {
        const { id, fileName } = req.params;
        const dir = app.path.join(app.assetPath, `/nhiemVu/${id}`);
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

    app.get('/api/hcth/giao-nhiem-vu/:id', app.permission.check('staff:login'), (req, res) => {
        const id = parseInt(req.params.id);
        app.model.hcthGiaoNhiemVu.get({ id }, (error, item) => {
            if (error)
                res.send({ error, item });
            else {
                app.model.hcthCanBoNhan.getAllCanBoNhan(id, (canBoNhanError, canBoNhan) => {
                    app.model.hcthFileCongVan.getAll({ congVan: id, loai: 'NHIEM_VU' }, '*', 'thoiGian', (fileError, files) => {
                        app.model.hcthPhanHoi.getAllFrom(id, 'NHIEM_VU', (phanHoiError, phanHoi) => {
                            app.model.hcthLienKet.getAllLienKet(id, 'NHIEM_VU', (lienKetError, lienKet) => {
                                res.send({ error: error || canBoNhanError || fileError || phanHoiError || lienKetError, item: { ...item, phanHoi: phanHoi?.rows || [], listFile: files || [], lienKet: lienKet?.rows || [], canBoNhanNhiemVu: canBoNhan?.rows || []} });
                            });
                        });
                    });
                });
            }
        });
        //app.model.hcthGiaoNhiemVu.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });
    app.post('/api/hcth/giao-nhiem-vu/phan-hoi', app.permission.check('staff:login'), (req, res) => {
        app.model.hcthPhanHoi.create({ ...req.body.data, loai: 'NHIEM_VU' }, (error, item) => {
            res.send({ error, item });
        });
    });

    app.get('/api/hcth/giao-nhiem-vu/phan-hoi/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            app.model.hcthPhanHoi.getAllFrom(id, 'NHIEM_VU', (error, result) => {
                res.send({ error: null, items: result.rows });
            });

        }
        catch (error) {
            res.send({ error });
        }
    });

    // cán bộ nhận nhiệm vụ API
    
    app.post('/api/hcth/giao-nhiem-vu/can-bo-nhan-nhiem-vu', app.permission.check('manager:write'), async (req, res) => {
        const { key, nguoiTao, canBoNhan: newCanBoNhan } = req.body.data;
        app.model.hcthCanBoNhan.get({ key, loai: 'NHIEM_VU', nguoiTao }, '*', 'id', (error, item) => {
            if (item) {
                let { canBoNhan } = item;
                canBoNhan = canBoNhan + ',' + newCanBoNhan;
                app.model.hcthCanBoNhan.update({ key, loai: 'NHIEM_VU', nguoiTao }, { canBoNhan } ,(error, item) => {
                    res.send({ error, item });
                });
            } else {
                app.model.hcthCanBoNhan.create(req.body.data, (error, item) => {
                    res.send({ error, item });
                });
            }
        });
    });

    app.put('/api/hcth/giao-nhiem-vu/can-bo-nhan-nhiem-vu', app.permission.check('manager:write'), async (req, res) => {
        const { key, loai, nguoiTao, shcc } = req.body.data;
        app.model.hcthCanBoNhan.get({ key, loai, nguoiTao }, '*', 'id', (error, item) => {
            if (item) {
                const { canBoNhan: oldCanBoNhan } = item;
                const oldCanBoNhanArr = oldCanBoNhan.split(',');
                const deleteIndex = oldCanBoNhanArr.findIndex(item => item === shcc);
                oldCanBoNhanArr.splice(deleteIndex, 1);
                const newCanBoNhan = oldCanBoNhanArr.slice(0).join(',');
                app.model.hcthCanBoNhan.update({ key, loai, nguoiTao }, { canBoNhan: newCanBoNhan }, (error, item) => {
                    res.send({ error, item });
                });
            } else {
                res.send({ error, item});
            }
        });
    });


    app.get('/api/hcth/giao-nhiem-vu/can-bo-nhan-nhiem-vu/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            app.model.hcthCanBoNhan.getAllCanBoNhan(id, (error, result) => {
                res.send({ error: null, items: result?.rows });
            });
        }
        catch (error) {
            res.send({ error });
        }
    });


    // liên kết API

    app.post('/api/hcth/giao-nhiem-vu/lien-ket', app.permission.check('staff:login'), async (req, res) => {
        const { data } = req.body; 
        const postData = {
            ...data,
            keyA: Number(data.keyA),
            keyB: Number(data.keyB)
        };
        app.model.hcthLienKet.create({...postData}, (error, item) => {
            res.send({ error, item });
        });
    });

    app.get('/api/hcth/giao-nhiem-vu/lien-ket/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            app.model.hcthLienKet.getAllLienKet(id,'NHIEM_VU',(error, result) => {
                res.send({ error: null, items: result?.rows });
            });

        }
        catch (error) {
            res.send({ error });
        }
    });

};
