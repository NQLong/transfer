
module.exports = (app) => {
    const { trangThaiSwitcher, action, CONG_VAN_TYPE, MA_CHUC_VU_HIEU_TRUONG, MA_BAN_GIAM_HIEU, MA_HCTH } = require('./constant');

    const menu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            501: { title: 'Công văn đến', link: '/user/hcth/cong-van-den', icon: 'fa-caret-square-o-left', backgroundColor: '#00aa00' },
        },
    };
    app.permission.add({ name: 'hcthCongVanDen:read' });
    app.permission.add({ name: 'staff:login', menu });
    app.permission.add({ name: 'hcthCongVanDen:write' });
    app.permission.add({ name: 'hcthCongVanDen:delete' });
    app.permission.add({ name: 'hcth:login' });
    app.permission.add({ name: 'hcth:manage' });

    app.get('/user/hcth/cong-van-den', app.permission.check('staff:login'), app.templates.admin);
    app.get('/user/hcth/cong-van-den/:id', app.permission.check('staff:login'), app.templates.admin);

    //api
    app.get('/api/hcth/cong-van-den/all', app.permission.check('staff:login'), (req, res) => {
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

    app.post('/api/hcth/cong-van-den', app.permission.check('hcthCongVanDen:write'), (req, res) => {
        const { fileList, chiDao, quyenChiDao, donViNhan, ...data } = req.body.data;
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
                        try {
                            createChiDaoFromList(chiDao, id, ({ error }) => {
                                if (error)
                                    throw error;
                                else
                                    updateListFile(fileList, id, ({ error }) => {
                                        if (error) {
                                            throw error;
                                        }
                                        else
                                            createDonViNhanFromList(donViNhan, id, ({ error }) => {
                                                if (error)
                                                    throw error;
                                                else {
                                                    app.model.hcthHistory.create({ key: id, loai: CONG_VAN_TYPE, hanhDong: action.CREATE, thoiGian: new Date().getTime(), shcc: req.session?.user?.shcc }, (error) => {
                                                        if (error)
                                                            throw error;
                                                        else
                                                            res.send({ error, item });
                                                    });
                                                }
                                            });
                                    });
                            });
                        }
                        catch (error) {
                            deleteCongVan(id, () => res.send({ error }));
                        }
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
        const { fileList, chiDao, donViNhan, ...changes } = req.body.changes;
        app.model.hcthCongVanDen.update({ id: req.body.id }, changes, (errors, item) => {
            if (errors)
                res.send({ errors, item });
            else
                createChiDaoFromList(chiDao, req.body.id, () => {
                    app.model.hcthDonViNhanCongVan.delete({ congVan: req.body.id }, () => createDonViNhanFromList(donViNhan, req.body.id, () => {
                        updateListFile(fileList, req.body.id, () => app.model.hcthHistory.create({ key: req.body.id, loai: CONG_VAN_TYPE, hanhDong: action.UPDATE, thoiGian: new Date().getTime(), shcc: req.session?.user?.shcc }, (error) => {
                            res.send({ error, item });
                        }));
                    })
                    );
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

    const createDonViNhanFromList = (listDonViNhan, congVanId, done) => {
        if (listDonViNhan && listDonViNhan.length > 0) {
            const [donViNhan] = listDonViNhan.splice(0, 1);
            app.model.hcthDonViNhanCongVan.create({ donViNhan, congVan: congVanId, loai: CONG_VAN_TYPE }, (error) => {
                if (error)
                    done && done({ error });
                else createDonViNhanFromList(listDonViNhan, congVanId, done);
            });
        }
        else
            done && done({ error: null });
    };


    app.delete('/api/hcth/cong-van-den', app.permission.check('hcthCongVanDen:delete'), (req, res) => {
        deleteCongVan(req.body.id, ({ error }) => res.send({ error }));
    });



    app.get('/api/hcth/cong-van-den/search/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        try {
            const
                obj2Db = { 'ngayHetHan': 'NGAY_HET_HAN', 'ngayNhan': 'NGAY_NHAN', 'tinhTrang': 'TINH_TRANG' },
                pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let { donViGuiCongVan, donViNhanCongVan, canBoNhanCongVan, timeType, fromTime, toTime, congVanYear, sortBy, sortType, tab, status = '' } = (req.query.filter && req.query.filter != '%%%%%%') ? req.query.filter :
                { donViGuiCongVan: null, donViNhanCongVan: null, canBoNhanCongVan: null, timeType: null, fromTime: null, toTime: null, congVanYear: null },
                donViCanBo = '', canBo = '', tabValue = parseInt(tab);

            const user = req.session.user;
            const permissions = user.permissions;
            donViCanBo = (req.session?.user?.staff?.donViQuanLy || []);
            donViCanBo = donViCanBo.map(item => item.maDonVi).toString() || (permissions.includes('president:login') && MA_BAN_GIAM_HIEU) || '';
            canBo = req.session?.user?.shcc || '';

            if (tabValue == 0) {
                if (permissions.includes('rectors:login') || permissions.includes('hcth:login') || (!user.isStaff && !user.isStudent)) {
                    donViCanBo = '';
                    canBo = '';
                }
            }
            else if (tabValue == 1) {
                if (donViCanBo.length) {
                    canBo = '';
                } else
                    donViCanBo = '';
            } else donViCanBo = '';



            if (congVanYear && Number(congVanYear) > 1900) {
                timeType = 2;
                fromTime = new Date(`${congVanYear}-01-01`).getTime();
                toTime = new Date(`${Number(congVanYear) + 1}-01-01`).getTime();
            }

            app.model.hcthCongVanDen.searchPage(pageNumber, pageSize, donViGuiCongVan, donViNhanCongVan, canBoNhanCongVan, timeType, fromTime, toTime, obj2Db[sortBy] || '', sortType, canBo, donViCanBo, permissions.includes('rectors:login') ? 1 : permissions.includes('hcth:login') ? 0 : 2, status, searchTerm, (error, page) => {
                if (error || page == null) {

                    res.send({ error });
                } else {
                    const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                    const pageCondition = searchTerm;
                    res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
                }
            });
        } catch (error) {
            res.send({ error });
        }
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

    app.get('/api/hcth/cong-van-den/download/:id/:fileName', app.permission.check('staff:login'), (req, res) => {
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

    app.post('/api/hcth/cong-van-den/phan-hoi', app.permission.check('staff:login'), (req, res) => {
        app.model.hcthPhanHoi.create({ ...req.body.data, loai: CONG_VAN_TYPE }, (error, item) => res.send({ error, item }));
    });

    app.get('/api/hcth/cong-van-den/:id', app.permission.check('staff:login'), (req, res) => {
        const id = req.params.id;
        app.model.hcthCongVanDen.get({ id }, (error, item) => {
            if (error)
                res.send({ error, item });
            else
                app.model.hcthFileCongVan.getAll({ congVan: id, loai: CONG_VAN_TYPE }, '*', 'thoiGian', (fileError, files) => {
                    app.model.hcthChiDao.getCongVanChiDao(id, CONG_VAN_TYPE, (chiDaoError, chiDao) => {
                        app.model.hcthDonViNhanCongVan.getAll({ congVan: id, loai: CONG_VAN_TYPE }, 'donViNhan', 'id', (donViError, donViNhan) => {
                            app.model.hcthPhanHoi.getAllFrom(id, CONG_VAN_TYPE, (phanHoiError, phanHoi) => {
                                app.model.hcthHistory.getAllFrom(id, CONG_VAN_TYPE, (historyError, history) => {
                                    res.send({ error: fileError || chiDaoError || donViError || phanHoiError || historyError, item: { ...item, phanHoi: phanHoi?.rows || [], donViNhan: (donViNhan ? donViNhan.map(item => item.donViNhan) : []).toString(), listFile: files || [], danhSachChiDao: chiDao?.rows || [], history: history?.rows || [] } });
                                });
                            });
                        });
                    });
                });
        });
    });

    app.post('/api/hcth/cong-van-den/chi-dao', app.permission.orCheck('rectors:login', 'hcth:login'), (req, res) => {
        app.model.hcthChiDao.create({ ...req.body.data, loai: CONG_VAN_TYPE }, (error, item) => res.send({ error, item }));
    });


    app.get('/api/hcth/cong-van-den/lich-su/:id', app.permission.check('staff:login'), (req, res) => {
        app.model.hcthHistory.getAllFrom(parseInt(req.params.id), CONG_VAN_TYPE, (error, items) => res.send({ error, items: items?.rows || [] }));
    });


    const updateCongvanDen = (id, changes) => new Promise((resolve, reject) => {
        app.model.hcthCongVanDen.update({ id }, changes, (error, item) => {
            if (error)
                reject(error);
            else
                resolve(item);
        });
    });

    const getCongVanDen = (id) => new Promise((resolve, reject) => {
        app.model.hcthCongVanDen.get({ id }, (error, item) => {
            if (error)
                reject(error);
            else
                resolve(item);
        });
    });

    const statusToAction = (before, after) => {
        switch (after) {
            case trangThaiSwitcher.CHO_DUYET.id:
                return action.UPDATE;
            case trangThaiSwitcher.CHO_PHAN_PHOI.id:
                if (before == trangThaiSwitcher.TRA_LAI_HCTH)
                    return action.UPDATE;
                else
                    return action.APPROVE;
            case trangThaiSwitcher.TRA_LAI_HCTH.id:
            case trangThaiSwitcher.TRA_LAI_BGH.id:
                return action.RETURN;
            case trangThaiSwitcher.DA_PHAN_PHOI.id:
                return action.PUBLISH;
            default:
                return '';
        }
    };

    app.put('/api/hcth/cong-van-den/status', app.permission.orCheck('rectors:login', 'hcthCongVanDen:write'), async (req, res) => {
        try {
            let { id, trangThai } = req.body.data;
            trangThai = parseInt(trangThai);
            const congVan = await getCongVanDen(id);
            if (congVan.trangThai == trangThai || !trangThai) {
                res.send({ error: null, item: congVan });
            }
            else {
                const newCongVan = await updateCongvanDen(id, { trangThai });
                await app.model.hcthHistory.createHistory({
                    key: id, loai: CONG_VAN_TYPE, thoiGian: new Date().getTime(), shcc: req.session?.user?.shcc,
                    hanhDong: statusToAction(congVan.trangThai, trangThai),
                });
                res.send({ newCongVan });
            }
        } catch (error) {
            res.send({ error });
        }
    });


    app.get('/api/hcth/cong-van-den/phan-hoi/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const phanHoi = await app.model.hcthPhanHoi.getPhanHoi(id, CONG_VAN_TYPE);
            res.send({ error: null, items: phanHoi.items });
        }
        catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/hcth/cong-van-den/chi-dao/:id', app.permission.check('staff:login'), async (req, res) => {
        app.model.hcthChiDao.getCongVanChiDao(parseInt(req.params.id), CONG_VAN_TYPE, (error, items) => res.send({ error, items: items?.rows || [] }));
    });

    // Phân quyền cho các đơn vị ------------------------------------------------------------------------------------------------------------------------
    app.assignRoleHooks.addRoles('quanLyCongVan', { id: 'hcth:manage', text: 'Hành Chính Tổng Hợp: Quản lý Công Văn' });

    // app.assignRoleHooks.addHook('ttDoanhNghiep', (req, roles) => new Promise(resolve => {
    //     const userPermissions = req.session.user ? req.session.user.permissions : [];
    //     if (req.query.nhomRole && req.query.nhomRole == 'ttDoanhNghiep' && userPermissions.includes('manager:write')) {
    //         const assignRolesList = app.assignRoleHooks.get('ttDoanhNghiep').map(item => item.id);
    //         console.log(roles && roles.length && assignRolesList.contains(roles));
    //         resolve(roles && roles.length && assignRolesList.contains(roles));
    //     } else resolve(null);
    // }));

    app.assignRoleHooks.addHook('quanLyCongVan', async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole == 'quanLyCongVan' && userPermissions.includes('manager:write')) {
            const assignRolesList = app.assignRoleHooks.get('quanLyCongVan').map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('staff', 'checkRoleQuanLyCongVan', (user, staff) => new Promise(resolve => {
        if (staff.donViQuanLy && staff.donViQuanLy.length && staff.maDonVi == MA_HCTH) {
            app.permissionHooks.pushUserPermission(user, 'hcth:manage');
        }
        resolve();
    }));

    app.permissionHooks.add('assignRole', 'checkRoleQuanLyCongVan', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'quanLyCongVan');
        inScopeRoles.forEach(role => {
            if (role.tenRole == 'hcth:manage') {
                app.permissionHooks.pushUserPermission(user, 'hcth:manage');
            }
        });
        resolve();
    }));

};