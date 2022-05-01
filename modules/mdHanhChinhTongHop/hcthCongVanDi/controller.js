module.exports = app => {
    const { MA_HCTH } = require('../constant');
    const FILE_TYPE = 'DI';

    const menu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            531: { title: 'Công văn giữa các phòng', link: '/user/hcth/cong-van-cac-phong', icon: 'fa-caret-square-o-right', backgroundColor: '#0B86AA' },
        },
    };
    app.permission.add(
        { name: 'hcthCongVanDi:read' },
        { name: 'hcthCongVanDi:write' },
        { name: 'hcthCongVanDi:delete' },
        { name: 'hcthCongVanDi:manage'},
        { name: 'hcthCongVanDi:approve'},
        { name: 'hcth:login'},
        { name: 'staff:login', menu},
    );
    app.get('/user/hcth/cong-van-cac-phong', app.permission.check('staff:login'), app.templates.admin);
    app.get('/user/hcth/cong-van-cac-phong/:id', app.permission.check('staff:login'), app.templates.admin);

    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/hcth/cong-van-cac-phong/search/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        let { donViGui, donViNhan, canBoNhan, loaiCongVan, donViNhanNgoai, congVanLaySo } = (req.query.filter && req.query.filter != '%%%%%%') ? req.query.filter : 
            { donViGui: null, donViNhan: null, canBoNhan: null, loaiCongVan: null, donViNhanNgoai: null, congVanLaySo: null };

        const rectorsPermission = getUserPermission(req, 'rectors', ['login']);
        const hcthPermission = getUserPermission(req, 'hcth', ['login']);

        let donViXem = '', canBoXem = '';

        let loaiCanBo = rectorsPermission.login ? 1 : hcthPermission.login ? 2 : 0;
        if (!rectorsPermission.login && !hcthPermission.login) {
            donViXem = (req.session?.user?.staff?.donViQuanLy || []);
            donViXem = donViXem.map(item => item.maDonVi).toString();
            canBoXem = req.session?.user?.shcc || '';
        }
        
        app.model.hcthCongVanDi.searchPage(pageNumber, pageSize, canBoNhan, donViGui, donViNhan, loaiCongVan, donViNhanNgoai, donViXem, canBoXem, loaiCanBo, congVanLaySo, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    const getCurrentPermissions = (req) => (req.session && req.session.user && req.session.user.permissions) || [];

    const getUserPermission = (req, prefix, listPermissions = ['read', 'write', 'delete']) => {
        const permission = {}, currentPermissions = getCurrentPermissions(req);
        listPermissions.forEach(item => permission[item] = currentPermissions.includes(`${prefix}:${item}`));
        return permission;
    };

    app.get('/api/hcth/cong-van-cac-phong/all', app.permission.check('hcthCongVanDi:read'), (req, res) => {
        app.model.hcthCongVanDi.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/hcth/cong-van-cac-phong/item/:id', app.permission.check('hcthCongVanDi:read'), (req, res) => {
        app.model.hcthCongVanDi.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    // app.permission.check('hcthCongVanDi:write')
    app.post('/api/hcth/cong-van-cac-phong', (req, res) => {
        const {fileList, ...data} = req.body.data;
        app.model.hcthCongVanDi.create({...data}, (error, item) => {
            if(error) {
                res.send({ error, item });
            } else {
                let { id } = item;
                app.createFolder(app.path.join(app.assetPath, `/congVanDi/${id}`));
                if (fileList && fileList.length > 0) {
                    updateListFile(fileList, id, ({ error }) => {
                        if (error) {
                            deleteCongVan(id, () => res.send({ error }));
                        }
                        else {
                            res.send({ item });
                        }
                    });
                }
                else res.send({ item });
                app.model.hcthHistory.create({ loai: 'DI', key: id, shcc: req.session?.user?.shcc,  hanhDong: 'CREATE', thoiGian: new Date().getTime() }, error => {
                    if (error) {
                        res.send({ error });
                    } else {
                        res.send({ item });
                    }
                });
            }
        });
    });

    const updateListFile = (listFile, congVanId, done) => {
        const [{ id, ...changes }] = listFile.splice(0, 1),
            sourcePath = app.path.join(app.assetPath, `/congVanDi/new/${changes.ten}`),
            destPath = app.path.join(app.assetPath, `/congVanDi/${congVanId}/${changes.ten}`);
        if (!changes.congVan)
            app.fs.rename(sourcePath, destPath, error => {
                if (error) done && done({ error });
                else {
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
                }
            });
        else {
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
        }
    };

    const deleteCongVan = (id, done) => {
        app.model.hcthFileCongVan.delete({ congVan: id }, (error) => {
            if (error) done && done({ error });
            else
                app.model.hcthCongVanDi.delete({ id }, error => {
                    app.deleteFolder(app.assetPath + '/congVanDi/' + id);
                    done && done({ error });
                });
        });
    };

    // Cần sửa lại
    app.put('/api/hcth/cong-van-cac-phong', app.permission.check('staff:login'), (req, res) => {
        const { fileList, ...changes } = req.body.changes;
        const { isSend = false } = changes;

        if (isSend) {
            const currentYear = new Date().getFullYear();
            const firstDayOfYear = new Date(currentYear, 0, 1);
            const nam = Date.parse(firstDayOfYear);
            let { id: ma, donViGui, trangThai } = changes;
            ma = parseInt(ma);
            donViGui = parseInt(donViGui);
            app.model.hcthCongVanDi.updateSoCongVanDi(ma, donViGui, nam, (errors, result) => {
                if (errors)
                    res.send({ errors, result });
                else {
                    app.model.hcthCongVanDi.update({ id: req.body.id }, { trangThai }, (errors, item) => {
                        if (errors)
                            res.send({ errors, item });
                        else {
                            if (fileList && fileList.length > 0) {
                                updateListFile(fileList, req.body.id, ({ error }) => res.send({ error }));
                            }
                            else res.send({ item });
                        }
                    });
                }
            });
            
        } else {
            app.model.hcthCongVanDi.update({ id: req.body.id }, changes, (errors, item) => {
                if (errors)
                    res.send({ errors, item });
                else {
                    if (fileList && fileList.length > 0) {
                        updateListFile(fileList, req.body.id, ({ error }) => res.send({ error }));
                    }
                    else res.send({ item });
                }
            });
        }
    });

    app.delete('/api/hcth/cong-van-cac-phong', app.permission.check('hcthCongVanDi:delete'), (req, res) => {
        deleteCongVan(req.body.id, ({ error }) => res.send({ error }));
    });

    app.get('/api/hcth/cong-van-cac-phong/page/:pageNumber/:pageSize', app.permission.check('hcthCongVanDi:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        const statement = ['trichYeu', 'donViGui']
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


    // Upload API  -----------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.assetPath, '/congVanDi'));


    app.uploadHooks.add('hcthCongVanDiFile', (req, fields, files, params, done) =>
        app.permission.has(req, () => hcthCongVanDiFile(req, fields, files, params, done), done, 'staff:login'));

    const hcthCongVanDiFile = (req, fields, files, params, done) => {
        if (
            fields.userData &&
            fields.userData[0] &&
            fields.userData[0].startsWith('hcthCongVanDiFile') &&
            files.hcthCongVanDiFile &&
            files.hcthCongVanDiFile.length > 0) {
            const
                srcPath = files.hcthCongVanDiFile[0].path,
                isNew = fields.userData[0].substring(18) == 'new',
                id = fields.userData[0].substring(18),
                // filePath = (isNew ? '/new/' : `/${id}/`) + (new Date().getTime()).toString() + '_' + files.hcthCongVanDiFile[0].originalFilename,
                originalFilename = files.hcthCongVanDiFile[0].originalFilename,
                filePath = (isNew ? '/new/' : `/${id}/`) + originalFilename,
                destPath = app.assetPath + '/congVanDi' + filePath,
                validUploadFileType = ['.xls', '.xlsx', '.doc', '.docx', '.pdf', '.png', '.jpg'],
                baseNamePath = app.path.extname(srcPath);
            if (!validUploadFileType.includes(baseNamePath.toLowerCase())) {
                done && done({ error: 'Định dạng tập tin không hợp lệ!' });
                app.deleteFile(srcPath);
            } else {
                app.createFolder(
                    app.path.join(app.assetPath, '/congVanDi/' + (isNew ? '/new' : '/' + id))
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
    app.put('/api/hcth/cong-van-cac-phong/delete-file', app.permission.check('hcthCongVanDi:delete'), (req, res) => {
        const
            id = req.body.id,
            fileId = req.body.fileId,
            file = req.body.file,
            congVan = id || null,
            filePath = app.assetPath + '/congVanDi/' + (id ? id + '/' : 'new/') + file;
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

    app.get('/api/hcth/cong-van-cac-phong/download/:id/:fileName', app.permission.check('hcthCongVanDi:read'), (req, res) => {
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

    

    app.get('/api/hcth/cong-van-cac-phong/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw { status: 400, message: 'Invalid id' };
            }
            const congVan = await app.model.hcthCongVanDi.getCVD({ id });
            const files = await app.model.hcthFileCongVan.getAllFile({ congVan: id, loai: 'DI'}, '*', 'thoiGian');
            const phanHoi = await app.model.hcthPhanHoi.getAllPhanHoiFrom(id, 'DI');
            const history = await app.model.hcthHistory.getAllHistoryFrom(id, 'DI');
            
            const loaiCV = (congVan.loaiCongVan);
            const donViGui = parseInt(congVan.donViGui);
            const tenVietTatLoaiCongVan = loaiCV !== null ? await app.model.dmLoaiCongVan.getLoai({ id: loaiCV }, 'tenVietTat', '') : null;
            const tenVietTatDonViGui = await app.model.dmDonVi.getDonVi({ ma: donViGui }, 'tenVietTat', '');

            res.send({
                item: {
                    ...congVan,
                    phanHoi: phanHoi?.rows || [],
                    listFile: files || [],
                    history: history?.rows || [],
                    tenVietTatLoaiCongVan: tenVietTatLoaiCongVan? tenVietTatLoaiCongVan : null,
                    tenVietTatDonViGui: tenVietTatDonViGui.tenVietTat ? tenVietTatDonViGui.tenVietTat : null
                }
            });

        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/hcth/cong-van-cac-phong/phan-hoi', app.permission.check('staff:login'), (req, res) => {
        const {
            canBoGui,
            noiDung,
            key,
            ngayTao,
            loai
        } = req.body.data;

        const newPhanHoi = {
            canBoGui,
            noiDung,
            key: Number(key),
            ngayTao: Number(ngayTao),
            loai
        };

        app.model.hcthPhanHoi.create(newPhanHoi, (error, item) => res.send({ error, item }));
    });

    app.put('/api/hcth/cong-van-cac-phong/lich-su', app.permission.check('staff:login'), (req, res) => {
        const {
            loai,
            key,
            shcc,
            hanhDong,
            thoiGian
        } = req.body.data;

        const newHistory = {
            loai,
            key: Number(key),
            shcc,
            hanhDong,
            thoiGian: Number(thoiGian)
        };

        app.model.hcthHistory.create(newHistory, (error, item) => res.send({ error, item }));
    });

    app.get('/api/hcth/cong-van-cac-phong/lich-su/:id', app.permission.check('staff:login'), (req, res) => {
        app.model.hcthHistory.getAllFrom(parseInt(req.params.id), 'DI', (error, item) => res.send({ error, item: item?.rows || [] }));
    });

    // Phân quyền duyệt công văn
    
    const duyetCongVanDiRole = 'duyetCongVanDi';
    app.assignRoleHooks.addRoles(duyetCongVanDiRole, { id: 'hcthCongVanDi:approve', text: 'Hành chính - Tổng hợp: Duyệt công văn đi'});

    app.assignRoleHooks.addHook(duyetCongVanDiRole, async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole == duyetCongVanDiRole && userPermissions.includes('hcth:manage')) {
            const assignRolesList = app.assignRoleHooks.get(duyetCongVanDiRole).map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('staff', 'checkRoleQuanLyHcth', (user, staff) => new Promise(resolve => {
        if (staff.donViQuanLy && staff.donViQuanLy.length && staff.maDonVi == MA_HCTH) {
            app.permissionHooks.pushUserPermission(user, 'hcthCongVanDi:approve', 'hcth:manage');
        }
        resolve();
    }));

    app.permissionHooks.add('assignRole', 'checkRoleDuyetCongVanDi', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == duyetCongVanDiRole);
        inScopeRoles.forEach(role => {
            if (role.tenRole === 'hcthCongVanDi:approve') {
                app.permissionHooks.pushUserPermission(user, 'hcth:login' ,'hcthCongVanDi:read', 'hcthCongVanDi:write', 'hcthCongVanDi:approve');
            }
        });
        resolve();
    }));
};

