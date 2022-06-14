module.exports = (app) => {
    const { trangThaiSwitcher, action, CONG_VAN_TYPE, MA_BAN_GIAM_HIEU, MA_HCTH, canBoType } = require('../constant');

    const staffMenu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            501: { title: 'Công văn đến', link: '/user/hcth/cong-van-den', icon: 'fa-caret-square-o-left', backgroundColor: '#00aa00' },
        },
    };
    const menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            1051: { title: 'Công văn đến', link: '/user/cong-van-den', icon: 'fa-caret-square-o-left', backgroundColor: '#00aa00', groupIndex: 5 },
        },
    };
    app.permission.add({ name: 'hcthCongVanDen:read', menu: staffMenu });
    app.permission.add({ name: 'staff:login', menu });
    app.permission.add({ name: 'hcthCongVanDen:write' });
    app.permission.add({ name: 'hcthCongVanDen:delete' });
    app.permission.add({ name: 'hcthCongVanDen:manage' });
    app.permission.add({ name: 'donViCongVanDen:read' });
    app.permission.add({ name: 'hcth:login' });
    app.permission.add({ name: 'hcth:manage' });

    app.get('/user/cong-van-den', app.permission.check('staff:login'), app.templates.admin);
    app.get('/user/cong-van-den/:id', app.permission.check('staff:login'), app.templates.admin);
    app.get('/user/hcth/cong-van-den', app.permission.check('hcthCongVanDen:read'), app.templates.admin);
    app.get('/user/hcth/cong-van-den/:id', app.permission.check('hcthCongVanDen:read'), app.templates.admin);

    //api
    app.get('/api/hcth/cong-van-den/all', app.permission.check('staff:login'), (req, res) => {
        app.model.hcthCongVanDen.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/hcth/cong-van-den/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
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

    const createCanBoNhanChiDao = (danhSachCanBo, nguoiTao, id) => {
        const promises = danhSachCanBo.map(canBo => new Promise((resolve, reject) => {
            app.model.hcthCanBoNhan.create({ canBoNhan: canBo, nguoiTao, ma: id, loai: 'DEN', vaiTro: 'DIRECT' }, (error, item) => {
                if (error) reject(error);
                else resolve(item);
            });
        }));
        return Promise.all(promises);
    };

    app.post('/api/hcth/cong-van-den', app.permission.check('hcthCongVanDen:write'), (req, res) => {
        const { fileList, chiDao, quyenChiDao, donViNhan, ...data } = req.body.data;
        const dsCanBoChiDao = quyenChiDao.length > 0 ? quyenChiDao.split(',') : [];

        app.model.hcthCongVanDen.create({ ...data, nguoiTao: req.session.user?.staff?.shcc }, (error, item) => {
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
                                else {
                                    createDonViNhanFromList(donViNhan, id, ({ error }) => {
                                        if (error)
                                            throw error;
                                        else {
                                            app.model.hcthHistory.create({ key: id, loai: CONG_VAN_TYPE, hanhDong: action.CREATE, thoiGian: new Date().getTime(), shcc: req.session?.user?.shcc }, async (error) => {
                                                if (error)
                                                    throw error;
                                                else {
                                                    if (dsCanBoChiDao.length > 0) {
                                                        await createCanBoNhanChiDao(dsCanBoChiDao, req.session.user?.staff?.shcc, id)
                                                            .catch((error) => { throw error; });
                                                    }
                                                    res.send({ error: null, item });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                    });
                }
                catch (error) {
                    deleteCongVan(id, () => res.send({ error }));
                }
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
                        app.model.hcthFile.update({ id }, { ...changes, ma: congVanId }, (error) => {
                            if (error)
                                done && done({ error });
                            else updateListFile(listFile, congVanId, done);
                        });
                });
            else
                app.model.hcthFile.update({ id }, { ...changes }, (error) => {
                    if (error)
                        done && done({ error });
                    else
                        updateListFile(listFile, congVanId, done);
                });
        } else
            done && done({});
    };

    const deleteCongVan = (id, done) => {
        app.model.hcthFile.delete({ ma: id }, (error) => {
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

    const createNotification = (emails, notification, done) => {
        const prmomises = [];
        emails.forEach(email => {
            prmomises.push(app.notification.send({
                toEmail: email,
                ...notification
            }));
        });
        Promise.all(prmomises).then(() => done(null)).catch(error => done(error));
    };

    app.put('/api/hcth/cong-van-den', app.permission.check('hcthCongVanDen:read'), async(req, res) => {
        const { fileList, chiDao, donViNhan, ...changes } = req.body.changes;
        try {
            app.model.hcthCongVanDen.get({ id: req.body.id }, async (error, congVan) => {
                if (error) throw error;
                else {
                    app.model.hcthCongVanDen.update({ id: req.body.id }, changes, async (errors, item) => {
                        if (errors)
                            res.send({ errors, item });
                        else {
                            const canBoNhanChiDao = await app.model.hcthCanBoNhan.getAllCanBoNhanFrom(req.body.id, CONG_VAN_TYPE);
                            const listCanBoChiDaoShcc = canBoNhanChiDao?.rows.length > 0 ? canBoNhanChiDao.rows.map(canBo => canBo.shccCanBoNhan) : [];
                            const newCanBoNhanChiDao = changes.quyenChiDao !== '' ? changes.quyenChiDao.split(',') : [];
                            if (newCanBoNhanChiDao.length > listCanBoChiDaoShcc.length) {
                                const listNewCanBoChiDao = newCanBoNhanChiDao.filter(canBo => !listCanBoChiDaoShcc.includes(canBo));
                                await createCanBoNhanChiDao(listNewCanBoChiDao, req.session.user?.staff?.shcc, req.body.id);
                            } else {
                                const listDeleteCanBoNhan = canBoNhanChiDao?.rows.filter(canBo => !newCanBoNhanChiDao.includes(canBo.shccCanBoNhan)) || [];
                                listDeleteCanBoNhan.forEach(item => {
                                    app.model.hcthCanBoNhan.delete({ id: item.id }, (error) => {
                                        if (error) throw error;
                                    });
                                });
                            }
                        }
                        createChiDaoFromList(chiDao, req.body.id, () => {
                            app.model.hcthDonViNhan.delete({ ma: req.body.id, loai: CONG_VAN_TYPE }, () => createDonViNhanFromList(donViNhan, req.body.id, () => {
                                updateListFile(fileList, req.body.id, () => app.model.hcthHistory.create({ key: req.body.id, loai: CONG_VAN_TYPE, hanhDong: action.UPDATE, thoiGian: new Date().getTime(), shcc: req.session?.user?.shcc }, (error) => {
                                    const trangThaiBefore = congVan.trangThai;
                                    const trangThaiAfter = item.trangThai;
                                    onStatusChange(item, trangThaiBefore, trangThaiAfter);
                                    res.send({ error, item });
                                }));
                            })
                            );
                        });
                    });
                }
            });
        } catch (error) {
            res.send({ error });
        }


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
            app.model.hcthDonViNhan.create({ donViNhan, ma: congVanId, loai: CONG_VAN_TYPE }, (error) => {
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
            donViCanBo = donViCanBo.map(item => item.maDonVi).toString() || (permissions.includes('president:login') && MA_BAN_GIAM_HIEU) || permissions.includes('donViCongVanDen:read') && req.session?.user?.staff?.maDonVi || '';
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
                        app.model.hcthFile.create({ ten: originalFilename, thoiGian: new Date().getTime(), loai: CONG_VAN_TYPE, ma: id === 'new' ? null : id }, (error, item) => done && done({ error, item }));
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
        app.model.hcthFile.delete({ id: fileId, ma: congVan, loai: CONG_VAN_TYPE }, (error) => {
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

    app.get('/api/hcth/cong-van-den/download/:id/:fileName', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { id, fileName } = req.params;
            const congVan = await app.model.hcthCongVanDen.getCVD({ id });
            const donViNhan = await app.model.hcthDonViNhan.getAllDVN({ ma: id, loai: CONG_VAN_TYPE }, 'donViNhan', 'id');
            if (!await isRelated(congVan, donViNhan, req)) {
                throw { status: 401, message: 'Bạn không có quyền xem tập tin này!' };
            } else {
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
                throw { status: 404, message: 'Không tìm thấy tập tin!' };
            }
        } catch (error) {
            res.status(error.status || 400).send(error.message || 'Không tìm thấy tập tin');
        }
    });

    app.post('/api/hcth/cong-van-den/phan-hoi', app.permission.check('staff:login'), (req, res) => {
        app.model.hcthPhanHoi.create({ ...req.body.data, loai: CONG_VAN_TYPE }, (error, item) => res.send({ error, item }));
    });

    const isRelated = async (congVan, donViNhan, req) => {
        try {

            const permissions = req.session.user.permissions;
            if (permissions.includes('rectors:login') || permissions.includes('hcth:login')) {
                return true;
            }
            if (req.query.nhiemVu) {
                const count = (await app.model.hcthLienKet.asyncCount({
                    keyA: req.query.nhiemVu,
                    loaiA: 'NHIEM_VU',
                    loaiB: 'CONG_VAN_DEN',
                    keyB: req.params.id
                }));
                if (await app.hcthNhiemVu.checkNhiemVuPermission(req, null, req.query.nhiemVu)
                    && count && count.rows[0] && count.rows[0]['COUNT(*)'])
                    return true;
            }

            const canBoNhan = congVan.canBoNhan || '';
            if (canBoNhan.split(',').includes(req.session.user.shcc))
                return true;
            else {
                let maDonViNhan = donViNhan.map((item) => item.donViNhan);
                let maDonViQuanLy = req.session.user?.staff?.donViQuanLy || [];
                return maDonViQuanLy.find(item => maDonViNhan.includes(item.maDonVi)) || (permissions.includes('donViCongVanDen:read') && maDonViNhan.includes(Number(req.session.user.staff?.maDonVi)));
            }
        } catch {
            return false;
        }
    };

    const viewCongVanDen = async (congVanId, shccCanBo, creator) => {
        if (shccCanBo == creator) return;
        const lichSuDoc = await app.model.hcthHistory.asyncGet({ loai: 'DEN', key: congVanId, shcc: shccCanBo, hanhDong: action.VIEW });
        if (!lichSuDoc) {
            return await app.model.hcthHistory.asyncCreate({ loai: 'DEN', key: congVanId, shcc: shccCanBo, hanhDong: action.VIEW });
        }
        return lichSuDoc;
    };

    app.get('/api/hcth/cong-van-den/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id))
                throw { status: 400, message: 'Invalid id' };
            const congVan = await app.model.hcthCongVanDen.getCVD({ id });
            const donViNhan = await app.model.hcthDonViNhan.getAllDVN({ ma: id, loai: CONG_VAN_TYPE }, 'donViNhan', 'id');
            if (!await isRelated(congVan, donViNhan, req))
                throw { status: 401, message: 'permission denied' };
            else {
                await viewCongVanDen(id, req.session.user.shcc, congVan.nguoiTao);
            }
            const files = await app.model.hcthFile.getAllFile({ ma: id, loai: CONG_VAN_TYPE }, '*', 'thoiGian');
            const phanHoi = await app.model.hcthPhanHoi.getAllPhanHoiFrom(id, CONG_VAN_TYPE);
            const history = await app.model.hcthHistory.getAllHistoryFrom(id, CONG_VAN_TYPE);
            const canBoChiDao = await app.model.hcthCanBoNhan.getAllCanBoNhanFrom(id, CONG_VAN_TYPE);
            const quyenChiDao = canBoChiDao?.rows.map(cb => cb.shccCanBoNhan).join(',');
            const chiDao = await app.model.hcthChiDao.getAllChiDao(id, CONG_VAN_TYPE);
            res.send({
                item: {
                    ...congVan,
                    phanHoi: phanHoi || [],
                    donViNhan: (donViNhan ? donViNhan.map(item => item.donViNhan) : []).toString(),
                    listFile: files || [],
                    danhSachChiDao: chiDao?.rows || [],
                    history: history?.rows || [],
                    quyenChiDao
                }
            });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/hcth/cong-van-den/chi-dao', app.permission.orCheck('rectors:login', 'hcth:manage', 'hcth:login'), (req, res) => {
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
            const congVan = await app.model.hcthCongVanDen.getCVD({ id });
            if (congVan.trangThai == trangThai || !trangThai) {
                res.send({ error: null, item: congVan });
            }
            else {
                const newCongVan = await updateCongvanDen(id, { trangThai });
                await app.model.hcthHistory.asyncCreate({
                    key: id, loai: CONG_VAN_TYPE, thoiGian: new Date().getTime(), shcc: req.session?.user?.shcc,
                    hanhDong: statusToAction(congVan.trangThai, trangThai),
                });
                await onStatusChange(newCongVan, congVan.trangThai, trangThai);
                res.send({ newCongVan });
            }
        } catch (error) {
            res.send({ error });
        }
    });


    app.get('/api/hcth/cong-van-den/phan-hoi/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const phanHoi = await app.model.hcthPhanHoi.getAllPhanHoiFrom(id, CONG_VAN_TYPE);
            res.send({ error: null, items: phanHoi });
        }
        catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/hcth/cong-van-den/chi-dao/:id', app.permission.check('staff:login'), async (req, res) => {
        app.model.hcthChiDao.getCongVanChiDao(parseInt(req.params.id), CONG_VAN_TYPE, (error, items) => res.send({ error, items: items?.rows || [] }));
    });

    // Phân quyền cho các đơn vị ------------------------------------------------------------------------------------------------------------------------

    const docCongVanPhongRole = 'quanLyCongVanPhong';
    app.assignRoleHooks.addRoles(docCongVanPhongRole, { id: 'donViCongVanDen:read', text: 'Quản lý công văn đến đơn vị' });

    app.assignRoleHooks.addHook(docCongVanPhongRole, async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole == docCongVanPhongRole && userPermissions.includes('manager:write')) {
            const assignRolesList = app.assignRoleHooks.get(docCongVanPhongRole).map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('staff', 'checkRoleDocCongVanDenPhong', (user, staff) => new Promise(resolve => {
        if (staff.donViQuanLy && staff.donViQuanLy.length) {
            app.permissionHooks.pushUserPermission(user, 'donViCongVanDen:read');
        }
        resolve();
    }));


    app.permissionHooks.add('assignRole', 'checkRoleDocCongVanDenPhong', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == docCongVanPhongRole);
        inScopeRoles.forEach(role => {
            if (role.tenRole == 'donViCongVanDen:read') {
                app.permissionHooks.pushUserPermission(user, 'donViCongVanDen:read');
            }
        });
        resolve();
    }));

    const nhomRole = 'quanLyCongVanDen';
    app.assignRoleHooks.addRoles(nhomRole, { id: 'hcthCongVanDen:manage', text: 'Hành chính - Tổng hợp: Quản lý Công văn đến' });

    app.assignRoleHooks.addHook(nhomRole, async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole == nhomRole && userPermissions.includes('manager:write')) {
            const assignRolesList = app.assignRoleHooks.get(nhomRole).map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('staff', 'checkRoleQuanLyHcth', (user, staff) => new Promise(resolve => {
        if (staff.donViQuanLy && staff.donViQuanLy.length && staff.maDonVi == MA_HCTH) {
            app.permissionHooks.pushUserPermission(user, 'hcthCongVanDen:manage', 'hcth:manage', 'hcthCongVanDi:manage');
        }
        resolve();
    }));

    app.permissionHooks.add('assignRole', 'checkRoleQuanLyCongVanDen', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == nhomRole);
        inScopeRoles.forEach(role => {
            if (role.tenRole == 'hcthCongVanDen:manage') {
                app.permissionHooks.pushUserPermission(user, 'hcthCongVanDen:manage', 'hcth:login', 'dmDonVi:read', 'dmDonViGuiCv:read', 'dmDonViGuiCv:write', 'dmDonViGuiCv:delete', 'hcthCongVanDen:read', 'hcthCongVanDen:write', 'hcthCongVanDen:delete');
            }
        });
        resolve();
    }));

    const getMessage = (status) => {
        switch (status) {
            case trangThaiSwitcher.TRA_LAI_BGH.id:
            case trangThaiSwitcher.TRA_LAI_HCTH.id:
                return 'Bạn có công văn đến bị trả lại!';
            case trangThaiSwitcher.CHO_PHAN_PHOI.id:
                return 'Bạn có công văn chờ phân phối.';
            case trangThaiSwitcher.DA_PHAN_PHOI.id:
                return 'Bạn có công văn đến mới.';
            default:
                return '';

        }
    };

    const getIconColor = (status) => {
        switch (status) {
            case trangThaiSwitcher.TRA_LAI_BGH.id:
            case trangThaiSwitcher.TRA_LAI_HCTH.id:
                return 'danger';
            case trangThaiSwitcher.CHO_PHAN_PHOI.id:
                return 'info';
            default:
                return '';
        }
    };


    const createChiDaoNotification = (item, trangThaiChiDao = true) => new Promise((resolve, reject) => {
        const canBoChiDao = item.quyenChiDao?.split(',') || [];
        app.model.canBo.getAll({
            statement: 'shcc IN (:dsCanBo)',
            parameter: {
                dsCanBo: [...canBoChiDao, ''],
            }
        }, 'email', 'email', (error, canBos) => {
            if (error) reject(error);
            else {
                if (!trangThaiChiDao) {
                    createNotification(canBos.map(item => item.email), { title: 'Công văn đến', icon: 'fa-book', iconColor: 'danger', subTitle: `Bạn đã bị xoá quyền chỉ đạo ra khỏi công văn #${item.id}`, link: `/user/cong-van-den/${item.id}` }, (error) => {
                        if (error)
                            reject(error);
                        else resolve();
                    });
                } else {
                    createNotification(canBos.map(item => item.email), { title: 'Công văn đến', icon: 'fa-book', iconColor: 'info', subTitle: `Bạn được gán quyền chỉ đạo cho công văn #${item.id}`, link: `/user/cong-van-den/${item.id}` }, (error) => {
                        if (error)
                            reject(error);
                        else resolve();
                    });
                }
            }
        });
    });

    const createHcthStaffNotification = (item, status) => new Promise((resolve, reject) => {
        if (item.nguoiTao)
            app.model.fwUser.get({ shcc: item.nguoiTao }, 'email', 'email', (error, staff) => {
                if (error) reject(error);
                else if (staff && staff.email) {
                    const emails = [staff.email];
                    createNotification(emails, { title: 'Công văn đến', icon: 'fa-book', subTitle: getMessage(status), iconColor: getIconColor(status), link: `/user/hcth/cong-van-den/${item.id}` }, error => {
                        if (error) reject(error);
                        else resolve();
                    });
                }
                else resolve();
            });
        else resolve();
    });

    const createRelatedStaffNotification = (item, status) => new Promise((resolve, reject) => {
        app.model.hcthCongVanDen.getRelatedStaff(item.id, (error, staffs) => {
            if (error) reject(error);
            else {
                const emails = staffs.rows.map(item => item.email);
                createNotification(emails, { title: 'Công văn đến', icon: 'fa-book', subTitle: getMessage(status), iconColor: getIconColor(status), link: `/user/cong-van-den/${item.id}` }, error => {
                    error ? reject(error) : resolve();
                });
            }
        });
    });

    const sendChiDaoCongVanDenMailToRectors = (item) => {
        const canBoChiDao = item.quyenChiDao?.split(',') || [];
        app.model.canBo.getAll({
            statement: 'shcc IN (:dsCanBo)',
            parameter: {
                dsCanBo: [...canBoChiDao, ''],
            }
        }, 'email', 'email', async (error, canBos) => {
            if (error) throw(error);
            else {
                const { email: fromMail, emailPassword: fromMailPassword, chiDaoEmailDebug, chiDaoEmailTitle, chiDaoEmailEditorText, chiDaoEmailEditorHtml } = await app.model.hcthSetting.getValue('email', 'emailPassword', 'chiDaoEmailDebug', 'chiDaoEmailTitle', 'chiDaoEmailEditorText', 'chiDaoEmailEditorHtml');
                let mailTitle = chiDaoEmailTitle,
                mailText = chiDaoEmailEditorText.replaceAll('{id}', item.id),
                mailHtml = chiDaoEmailEditorHtml.replaceAll('{id}', item.id).replaceAll('{link}', `https://hcmussh.edu.vn/user/cong-van-den/${item.id}`);
                if (app.isDebug) {
                    app.email.normalSendEmail(fromMail, fromMailPassword, chiDaoEmailDebug, [], mailTitle, mailText, mailHtml, [], (error) => {
                        if (error) throw(error);
                    });
                } else {
                    canBos.map(canBo => new Promise(() => {
                        app.email.normalSendEmail(fromMail, fromMailPassword, canBo.email, [app.defaultAdminEmail], mailTitle, mailText, mailHtml, [], (error) => {
                            if (error) throw(error);
                        });
                    }));
                }
            }
        });
    };

    const onStatusChange = (item, before, after) => new Promise((resolve) => {
        try {
            if (before == after)
                resolve();
            if (after == trangThaiSwitcher.CHO_DUYET.id) {
                createChiDaoNotification(item).then(() => resolve()).catch(error => { throw error; });
                sendChiDaoCongVanDenMailToRectors(item);
            }
            else if ([trangThaiSwitcher.CHO_PHAN_PHOI.id, trangThaiSwitcher.TRA_LAI_BGH.id].includes(after)) {
                createHcthStaffNotification(item, after).then(() => resolve()).catch(error => { throw error; });
            }
            else if (after == trangThaiSwitcher.DA_PHAN_PHOI.id) {
                createRelatedStaffNotification(item, after).then(() => resolve()).catch(error => { throw error; });
            }
        } catch (error) {
            console.error('fail to send notification', error);
            resolve();
        }
    });

    app.hcthCongVanDen = {
        notifyExpired: () => {
            try {
                const today = new Date();
                const expireTime = new Date();
                expireTime.setDate(today.getDate() + 3);
                expireTime.setHours(0, 0, 0, 0);
                app.model.hcthCongVanDen.getNotification(expireTime.getTime(), (error, result) => {
                    if (error) throw error;
                    else if (result.rows && result.rows.length > 0) {
                        app.model.hcthCongVanDen.update(
                            {
                                statement: 'id in (:ids)',
                                parameter: { ids: result.rows.map(item => item.id) },
                            },
                            { nhacNho: 1 }, (error) => {
                                if (error) throw error;
                                else {
                                    app.model.hcthCongVanDen.getAuthorizedStaff((error, canBos) => {
                                        if (error) throw error;
                                        const emails = canBos.rows.map(canBo => canBo.email);
                                        const prmomises = [];
                                        result.rows.forEach(item => {
                                            prmomises.push(new Promise((resolve, reject) => {
                                                createNotification(emails, { title: 'Công văn đến sắp hết hạn', icon: 'fa-book', subTitle: 'Công văn đến sắp hết hạn. Bạn hãy kiểm tra lại các đơn vị liên quan đã có thao tác cần thiết đối với công văn.', iconColor: 'danger', link: `/user/hcth/cong-van-den/${item.id}` }, (error) => {
                                                    error ? reject(error) : resolve();
                                                });
                                            }));
                                        });
                                        Promise.all(prmomises).catch(error => { throw error; });
                                    });
                                }
                            }
                        );
                    }
                });
            } catch (error) {
                console.error('Gửi thông báo nhắc nhở công văn đến hết hạn lỗi', error);
            }
        }
    };


    app.get('/api/hcth/cong-van-den/selector/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const userPermissions = req.session.user?.permissions || [];
        const donViCanBo = (req.session?.user?.staff?.donViQuanly || []).map(item => item.maDonVi);
        const { status = '', ids = '', excludeIds = '', hasIds = 0, fromTime = null, toTime = null } = req.query.filter;
        const data = {
            staffType: userPermissions.includes('hcth:login') ? canBoType.HCTH : userPermissions.includes('rectors:login') ? canBoType.RECTOR : null,
            donViCanBo: donViCanBo.toString() || (userPermissions.includes('donViCongVanDen:read') ? req.session.user?.staff?.maDonVi : '') || '',
            shccCanBo: req.session.user?.shcc,
            fromTime, toTime, status, ids, hasIds, excludeIds
        };

        let filterParam;
        try {
            filterParam = JSON.stringify(data);
        } catch {
            res.send({ error: 'Dữ liệu lọc lỗi!' });
        }
        app.model.hcthCongVanDen.searchSelector(pageNumber, pageSize, filterParam, searchTerm, (error, page) => {
            if (error || !page) res.send({ error });
            else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    const deleteCanBoNhanChiDao = (danhSachCanBo, id, nguoiTao) => {
        const listShccCanBo = danhSachCanBo.split(',');
        const promises = listShccCanBo.map(canBoShcc => new Promise((resolve, reject) => {
            app.model.hcthCanBoNhan.delete({ canBoNhan: canBoShcc, loai: 'DEN', ma: id, vaiTro: 'DIRECT' }, async (error) => {
                if (error) reject(error);
                else {
                    try {
                        if (canBoShcc !== nguoiTao) {
                            await createChiDaoNotification({ id, quyenChiDao: canBoShcc, }, false);
                        }
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                }
            });
        }));
        return Promise.all(promises);
    };

    app.post('/api/hcth/cong-van-den/quyen-chi-dao', app.permission.check('rectors:login'), async (req, res) => {
        try {
            const { id, shcc, trangThaiCv, status } = req.body;
            let quyenChiDaoStatus = JSON.parse(status);
            if (quyenChiDaoStatus) {
                let listCanBo = [];
                listCanBo.push(shcc);
                await createCanBoNhanChiDao(listCanBo, req.session.user?.staff?.shcc, req.body.id);
                if (shcc !== req.session?.user?.staff.shcc) {
                    await createChiDaoNotification({
                        id,
                        quyenChiDao: shcc,
                    });
                    sendChiDaoCongVanDenMailToRectors({ id, quyenChiDao: shcc });
                }
                res.send({ error: null });
            } else {
                app.model.hcthCongVanDen.update({ id }, { trangThai: trangThaiCv }, async (error) => {
                    if (error) throw error;
                    else {
                        await deleteCanBoNhanChiDao(shcc, id, req.session?.user?.staff.shcc);
                        res.send({ error: null });
                    }
                });
            }
        }
        catch (error) {
            res.send({ error });
        }
    });
};