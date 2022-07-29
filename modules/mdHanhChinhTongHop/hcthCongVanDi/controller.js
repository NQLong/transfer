module.exports = app => {
    const FILE_TYPE = 'DI';

    const { trangThaiCongVanDi, CONG_VAN_DI_TYPE, action, loaiCongVan } = require('../constant');

    const staffMenu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            502: { title: 'Công văn đi', link: '/user/hcth/cong-van-cac-phong', icon: 'fa-caret-square-o-right', backgroundColor: '#0B86AA' },
        },
    };

    const menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            1053: { title: 'Công văn đi', link: '/user/cong-van-cac-phong', icon: 'fa-caret-square-o-right', backgroundColor: '#0B86AA', groupIndex: 5 },
        },
    };
    app.permission.add(
        { name: 'hcthCongVanDi:read' },
        { name: 'hcthCongVanDi:write' },
        { name: 'hcthCongVanDi:delete' },
        { name: 'hcthCongVanDi:manage' },
        { name: 'donViCongVanDi:manage' },
        { name: 'hcth:login', menu: staffMenu },
        { name: 'staff:login', menu },
        { name: 'hcth:manage' }
    );

    app.get('/user/cong-van-cac-phong', app.permission.check('staff:login'), app.templates.admin);
    app.get('/user/cong-van-cac-phong/:id', app.permission.check('staff:login'), app.templates.admin);
    app.get('/user/hcth/cong-van-cac-phong', app.permission.check('hcthCongVanDi:read'), app.templates.admin);
    app.get('/user/hcth/cong-van-cac-phong/:id', app.permission.check('hcthCongVanDi:read'), app.templates.admin);

    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/hcth/cong-van-cac-phong/search/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        let { donViGui, donViNhan, canBoNhan, loaiCongVan, loaiVanBan, donViNhanNgoai, status, timeType, fromTime, toTime, congVanYear } = req.query.filter && req.query.filter != '%%%%%%' ? req.query.filter :
            { donViGui: null, donViNhan: null, canBoNhan: null, loaiCongVan: null, loaiVanBan: null, donViNhanNgoai: null, status: null, timeType: null, fromTime: null, toTime: null, congVanYear: null },
            donViXem = '',
            canBoXem = '';

        const rectorsPermission = getUserPermission(req, 'rectors', ['login']);
        const hcthPermission = getUserPermission(req, 'hcth', ['manage', 'login']),
            hcthManagePermission = getUserPermission(req, 'hcthCongVanDi', ['manage']);
        const user = req.session.user;
        const permissions = user.permissions;
        const roles = req.session.user.roles,
            admin = roles && roles.find(o => o.name == 'admin');

        donViXem = req.session?.user?.staff?.donViQuanLy || [];
        donViXem = donViXem.map(item => item.maDonVi).toString() ||
            // chuyên viên quản lý và chuyên viên soạn thảo
            ((permissions.includes('donViCongVanDi:manage') || permissions.includes('donViCongVanDi:edit')) && req.session?.user?.staff?.maDonVi)
            || '';
        canBoXem = req.session?.user?.shcc || '';

        let loaiCanBo = admin ? 4 :
            rectorsPermission.login ? 1 :
                (hcthManagePermission.manage || (permissions.includes('donViCongVanDi:manage') && hcthPermission.login)) ? 2 : // chuyên viên quản lý thuộc phòng hcth
                    (permissions.includes('donViCongVanDi:edit') && hcthPermission.login) ? 6 : //chuyên viên soạn thảo thuộc phòng hcth

                        permissions.includes('donViCongVanDi:edit') ? 5 :  // chuyên viên soạn thảo
                            (hcthPermission.login && !hcthManagePermission.manage) ? 3 : 0; // nhân viên phòng hcth

        if (!admin && (rectorsPermission.login || hcthPermission.manage || (!user.isStaff && !user.isStudent))) {
            donViXem = '';
            canBoXem = '';
        }

        if (congVanYear && Number(congVanYear) > 1900) {
            timeType = 1;
            fromTime = new Date(`${congVanYear}-01-01`).getTime();
            toTime = new Date(`${Number(congVanYear) + 1}-01-01`).getTime();
        }

        const dataFilter = { canBoNhan, donViGui, donViNhan, loaiCongVan, loaiVanBan, donViNhanNgoai, donViXem, canBoXem, loaiCanBo, status: status ? status.toString() : status };
        console.log(dataFilter);

        app.model.hcthCongVanDi.searchPage(pageNumber, pageSize, canBoNhan, donViGui, donViNhan, loaiCongVan, loaiVanBan, donViNhanNgoai, donViXem, canBoXem, loaiCanBo, status ? status.toString() : status, timeType, fromTime, toTime, searchTerm, (error, page) => {
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

    const createListDonViNhan = (listDonViNhan, congVanId, done) => {
        if (listDonViNhan && listDonViNhan.length > 0) {
            const promises = listDonViNhan.map((donViNhan) => new Promise((resolve, reject) => app.model.hcthDonViNhan.create(
                {
                    donViNhan: donViNhan.id,
                    ma: congVanId,
                    donViNhanNgoai: donViNhan.donViNhanNgoai,
                    loai: 'DI',
                },
                (error, item) => {
                    if (error) reject(error);
                    else resolve(item);
                }
            )));
            Promise.all(promises).then((result) => done && done(result)).catch((error) => done && done(error));
        } else {
            done && done({ error: null });
        }
    };

    app.post('/api/hcth/cong-van-cac-phong', (req, res) => {
        const { fileList, donViNhan, donViNhanNgoai, ...data } = req.body.data;
        app.model.hcthCongVanDi.create({ ...data, nguoiTao: req.session.user?.staff?.shcc }, (error, item) => {
            if (error) {
                res.send({ error, item });
            } else {
                let { id } = item;
                app.createFolder(app.path.join(app.assetPath, `/congVanDi/${id}`));
                try {
                    updateListFile(fileList, id, ({ error }) => {
                        if (error) {
                            throw error;
                        } else {
                            let listDonViNhan = [];
                            let listDonViNhanNgoai = [];
                            if (donViNhanNgoai && donViNhanNgoai.length > 0) {
                                listDonViNhanNgoai = donViNhanNgoai.map((id) => ({ id: id, donViNhanNgoai: 1 }));
                            }
                            if (donViNhan && donViNhan.length > 0) {
                                listDonViNhan = donViNhan.map((id) => ({ id: id, donViNhanNgoai: 0 }));
                            }

                            createListDonViNhan([...listDonViNhan, ...listDonViNhanNgoai], id, ({ error }) => {
                                if (error) {
                                    throw error;
                                } else {
                                    app.model.hcthHistory.create({ loai: 'DI', key: id, shcc: req.session?.user?.shcc, hanhDong: 'CREATE', thoiGian: new Date().getTime() }, (error) => {
                                        if (error) {
                                            throw error;
                                        } else {
                                            res.send({ error, item });
                                        }
                                    });
                                }
                            });
                        }
                    });
                } catch (error) {
                    deleteCongVan(id, () => res.send({ error }));
                }
            }
        });
    });

    const updateListFile = (listFile, congVanId, done) => {
        if (listFile && listFile.length > 0) {
            const [{ id, ...changes }] = listFile.splice(0, 1),
                sourcePath = app.path.join(app.assetPath, `/congVanDi/new/${changes.tenFile}`),
                destPath = app.path.join(app.assetPath, `/congVanDi/${congVanId}/${changes.tenFile}`);
            if (!changes.ma)
                app.fs.rename(sourcePath, destPath, error => {
                    if (error) done && done({ error });
                    else {
                        app.model.hcthFile.update({ id }, { ...changes, ma: congVanId }, (error) => {
                            if (error)
                                done && done({ error });
                            else {
                                updateListFile(listFile, congVanId, done);
                            }
                        });
                    }
                });
            else {
                app.model.hcthFile.update({ id }, { ...changes }, (error) => {
                    if (error)
                        done && done({ error });
                    else {
                        updateListFile(listFile, congVanId, done);
                    }
                });
            }
        } else {
            done && done({});
        }
    };

    const deleteCongVan = (id, done) => {
        app.model.hcthFile.delete({ ma: id }, (error) => {
            if (error) done && done({ error });
            else
                app.model.hcthCongVanDi.delete({ id }, (error) => {
                    app.deleteFolder(app.assetPath + '/congVanDi/' + id);
                    done && done({ error });
                });
        });
    };

    // Cần sửa lại
    app.put('/api/hcth/cong-van-cac-phong', app.permission.check('staff:login'), (req, res) => {
        const { fileList, donViNhan, donViNhanNgoai, ...changes } = req.body.changes;
        const { isSend = false } = changes;

        if (isSend) {
            const currentYear = new Date().getFullYear();
            const firstDayOfYear = new Date(currentYear, 0, 1);
            const nam = Date.parse(firstDayOfYear);
            let { id: ma, donViGui, trangThai } = changes;
            ma = parseInt(ma);
            donViGui = parseInt(donViGui);
            app.model.hcthCongVanDi.updateSoCongVanDi(ma, donViGui, nam, (errors, result) => {
                if (errors) {
                    res.send({ errors, result });
                } else {
                    app.model.hcthCongVanDi.update({ id: req.body.id }, { trangThai }, (errors, item) => {
                        if (errors)
                            res.send({ errors, item });
                        else {
                            let listDonViNhan = [];
                            let listDonViNhanNgoai = [];
                            if (donViNhanNgoai && donViNhanNgoai.length > 0) {
                                listDonViNhanNgoai = donViNhanNgoai.map((id) => ({ id: id, donViNhanNgoai: 1 }));
                            }
                            if (donViNhan && donViNhan.length > 0) {
                                listDonViNhan = donViNhan.map((id) => ({ id: id, donViNhanNgoai: 0 }));
                            }

                            app.model.hcthDonViNhan.delete({ ma: req.body.id, loai: CONG_VAN_DI_TYPE }, () =>
                                createListDonViNhan([...listDonViNhan, ...listDonViNhanNgoai], req.body.id,
                                    () => {
                                        updateListFile(fileList, req.body.id, () =>
                                            app.model.hcthHistory.create({ key: req.body.id, loai: CONG_VAN_DI_TYPE, hanhDong: action.APPROVE, thoiGian: new Date().getTime(), shcc: req.session?.user?.shcc }, (error) => {
                                                res.send({ error, item });
                                            })
                                        );
                                    })
                            );
                        }
                    });
                }
            });
        } else {
            app.model.hcthCongVanDi.get({ id: req.body.id }, (error, congVan) => {
                if (error)
                    res.send({ error, congVan });
                else {
                    app.model.hcthCongVanDi.update({ id: req.body.id }, changes, (errors, item) => {
                        if (errors)
                            res.send({ errors, item });
                        else {
                            let listDonViNhan = [];
                            let listDonViNhanNgoai = [];
                            if (donViNhanNgoai && donViNhanNgoai.length > 0) {
                                listDonViNhanNgoai = donViNhanNgoai.map((id) => ({ id: id, donViNhanNgoai: 1, }));
                            }
                            if (donViNhan && donViNhan.length > 0) {
                                listDonViNhan = donViNhan.map((id) => ({ id: id, donViNhanNgoai: 0 }));
                            }

                            app.model.hcthDonViNhan.delete(
                                { ma: req.body.id, loai: 'DI' },
                                () =>
                                    createListDonViNhan([...listDonViNhan, ...listDonViNhanNgoai], req.body.id, () => {
                                        updateListFile(fileList, req.body.id, () => {
                                            const trangThaiBefore = congVan.trangThai;
                                            const trangThaiAfter = item.trangThai;
                                            let hanhDong;
                                            // chỉnh lại
                                            if (trangThaiBefore == trangThaiCongVanDi.NHAP.id) {
                                                hanhDong = action.SEND;
                                            }

                                            if (trangThaiBefore == trangThaiAfter) {
                                                hanhDong = action.UPDATE;
                                            }
                                            if (trangThaiBefore == trangThaiCongVanDi.TRA_LAI_HCTH.id && trangThaiAfter == trangThaiCongVanDi.CHO_PHAN_PHOI.id) {
                                                hanhDong = action.SEND;
                                            }
                                            console.log('1' + trangThaiBefore);
                                            console.log('2' + trangThaiAfter);


                                            app.model.hcthHistory.create({
                                                key: req.body.id, loai: CONG_VAN_DI_TYPE, hanhDong: hanhDong, thoiGian: new Date().getTime(),
                                                shcc: req.session?.user?.shcc,
                                            },
                                                (error) => {
                                                    onStatusChange(item, trangThaiBefore, trangThaiAfter);
                                                    res.send({ error, item });
                                                }
                                            );
                                        });
                                    })
                            );
                        }
                    });
                }
            });
        }
    });

    app.delete('/api/hcth/cong-van-cac-phong', app.permission.check('hcthCongVanDi:delete'), (req, res) => {
        deleteCongVan(req.body.id, ({ error }) => res.send({ error }));
    });

    app.get('/api/hcth/cong-van-cac-phong/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        const statement = ['trichYeu', 'donViGui', 'soCongVan']
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

    app.uploadHooks.add('hcthCongVanDiUpdateFile', (req, fields, files, params, done) =>
        app.permission.has(req, () => hcthCongVanDiUpdateFile(req, fields, files, params, done), done, 'staff:login'));

    const hcthCongVanDiFile = async (req, fields, files, params, done) => {
        try {
            if (
                fields.userData &&
                fields.userData[0] &&
                fields.userData[0].startsWith('hcthCongVanDiFile') &&
                files.hcthCongVanDiFile &&
                files.hcthCongVanDiFile.length > 0) {
                const
                    srcPath = files.hcthCongVanDiFile[0].path,
                    generatedFileName = srcPath.substring(srcPath.lastIndexOf('/') + 1, srcPath.length),
                    isNew = fields.userData[0].substring(18) == 'new',
                    id = fields.userData[0].substring(18),
                    originalFilename = files.hcthCongVanDiFile[0].originalFilename,
                    filePath = (isNew ? '/new/' : `/${id}/`) + generatedFileName,
                    destPath = app.assetPath + '/congVanDi' + filePath,
                    validUploadFileType = ['.xls', '.xlsx', '.doc', '.docx', '.pdf', '.png', '.jpg'],
                    baseNamePath = app.path.extname(srcPath);

                if (!validUploadFileType.includes(baseNamePath.toLowerCase())) {
                    done && done({ error: 'Định dạng tập tin không hợp lệ!' });
                    app.deleteFile(srcPath);
                } else {
                    await app.createFolder(
                        app.path.join(app.assetPath, '/congVanDi/' + (isNew ? '/new' : '/' + id))
                    );
                    await app.fs.rename(srcPath, destPath);

                    const newFile = await app.model.hcthFile.create({ ten: originalFilename, thoiGian: new Date().getTime(), loai: FILE_TYPE, ma: id === 'new' ? null : id, tenFile: generatedFileName, nguoiTao: req.session.user.shcc });

                    const canBo = await app.model.canBo.get({ shcc: req.session.user.shcc });

                    done && done({ error: null, item: { ...newFile, hoNguoiTao: canBo.ho, tenNguoiTao: canBo.ten } });
                }
            }
        } catch (error) {
            done && done({ error });
        }
    };

    const hcthCongVanDiUpdateFile = async (req, fields, files, params, done) => {
        try {
            if (
                fields.userData &&
                fields.userData[0] &&
                fields.userData[0].startsWith('hcthCongVanDiUpdateFile') &&
                files.hcthCongVanDiUpdateFile &&
                files.hcthCongVanDiUpdateFile.length > 0) {

                const userDataArr = fields.userData[0].split(':');
                const
                    srcPath = files.hcthCongVanDiUpdateFile[0].path,
                    generatedFileName = srcPath.substring(srcPath.lastIndexOf('/') + 1, srcPath.length),
                    id = userDataArr[1],
                    originalFilename = files.hcthCongVanDiUpdateFile[0].originalFilename,
                    filePath = `/${id}/${generatedFileName}`,
                    destPath = app.assetPath + '/congVanDi' + filePath,
                    validUploadFileType = ['.xls', '.xlsx', '.doc', '.docx', '.pdf', '.png', '.jpg'],
                    baseNamePath = app.path.extname(srcPath);

                const originFileId = userDataArr[2];

                const updateFileId = userDataArr[3];

                if (!validUploadFileType.includes(baseNamePath.toLowerCase())) {
                    done && done({ error: 'Định dạng tập tin không hợp lệ!' });
                    app.deleteFile(srcPath);
                } else {
                    await app.fs.rename(srcPath, destPath);
                    const newFile = await app.model.hcthFile.create({ ten: originalFilename, thoiGian: new Date().getTime(), loai: FILE_TYPE, ma: id === 'new' ? null : id, tenFile: generatedFileName, capNhatFileId: originFileId, nguoiTao: req.session.user.shcc });
                    const canBo = await app.model.canBo.get({ shcc: req.session.user.shcc });
                    // update cong van trinh ki

                    const congVanTrinhKy = await await app.model.hcthCongVanTrinhKy.get({ fileCongVan: updateFileId, congVan: id });

                    if (congVanTrinhKy) {
                        await app.model.hcthCongVanTrinhKy.update({ fileCongVan: updateFileId, congVan: id }, { fileCongVan: newFile.id });
                    }
                    //await app.model.hcthCongVanTrinhKy.update({ fileCongVan: updateFileId }, { fileCongVan: newFile.id });
                    done && done({ error: null, item: { ...newFile, hoNguoiTao: canBo.ho, tenNguoiTao: canBo.ten } });
                }
            }
        } catch (error) {
            done && done({ error });
        }
    };



    //Delete file
    app.put('/api/hcth/cong-van-cac-phong/delete-file', app.permission.check('hcthCongVanDi:delete'), async (req, res) => {
        try {
            const
                id = req.body.id,
                fileId = req.body.fileId,
                updateFileId = req.body.updateFileId,
                file = req.body.file,
                congVan = id || null,
                path = app.assetPath + '/congVanDi/' + (id ? id + '/' : 'new/'),
                filePath = path + file;

            // xoa file goc

            await app.model.hcthFile.delete({ id: fileId, ma: congVan });

            const congVanTrinhKy = await app.model.hcthCongVanTrinhKy.get({ fileCongVan: fileId, congVan });

            if (congVanTrinhKy) {
                await app.model.hcthCongVanTrinhKy.delete({ fileCongVan: fileId, congVan });
                await app.model.hcthCanBoKy.delete({ congVanTrinhKy: congVanTrinhKy.id });
            }

            if (app.fs.existsSync(filePath))
                await app.deleteFile(filePath);

            // xoa cac file cap nhat
            const checkUpdateFile = await app.model.hcthFile.get({ ma: congVan, capNhatFileId: fileId });

            if (checkUpdateFile) {
                const listUpdateFile = await app.model.hcthFile.getAll({ ma: congVan, capNhatFileId: fileId });
                await app.model.hcthFile.delete({ ma: congVan, capNhatFileId: fileId });
                listUpdateFile.forEach(file => {
                    if (app.fs.existsSync(path + file)) app.deleteFile(path + file);
                });

                const congVanTrinhKy = await app.model.hcthCongVanTrinhKy.get({ fileCongVan: updateFileId, congVan });
                if (congVanTrinhKy) {
                    await app.model.hcthCongVanTrinhKy.delete({ fileCongVan: updateFileId, congVan });
                    await app.model.hcthCanBoKy.delete({ congVanTrinhKy: congVanTrinhKy.id });
                }
            }

            res.send({ error: null });

        } catch (error) {
            res.send({ error });
        }

    });

    app.get('/api/hcth/cong-van-cac-phong/download/:id/:fileName', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { id, fileName } = req.params;
            const congVan = await app.model.hcthCongVanDi.get({ id });
            const donViNhan = await app.model.hcthDonViNhan.getAll({ ma: id, loai: 'DI' }, 'donViNhan', 'id');
            if (!await isRelated(congVan, donViNhan, req)) {
                throw { status: 401, message: 'Bạn không có quyền xem tập tin này!' };
            } else {
                const dir = app.path.join(app.assetPath, `/congVanDi/${id}`);
                if (app.fs.existsSync(dir)) {
                    const serverFileNames = app.fs.readdirSync(dir).filter(v => app.fs.lstatSync(app.path.join(dir, v)).isFile());
                    for (const serverFileName of serverFileNames) {
                        const clientFileIndex = serverFileName.indexOf(fileName);
                        if (clientFileIndex !== -1 && serverFileName.slice(clientFileIndex) === fileName) {
                            const fileCongVan = await app.model.hcthFile.get({ ma: id, tenFile: serverFileName });
                            return res.download(app.path.join(dir, serverFileName), app.path.join(dir, fileCongVan.ten));
                        }
                    }
                }
            }
            throw { status: 404, message: 'Không tìm thấy tập tin!' };
        } catch (error) {
            res.status(error.status || 400).send(error.message || 'Không tìm thấy tập tin');
        }
    });

    // Cần sửa lại
    const isRelated = async (congVan, donViNhan, req) => {
        try {
            const permissions = req.session.user.permissions;
            const maDonVi = req.session.user.staff?.maDonVi;
            if (permissions.includes('rectors:login') || permissions.includes('hcth:login')) {
                return true;
            }
            if (req.query.nhiemVu) {
                const count = await app.model.hcthLienKet.count({
                    keyA: req.query.nhiemVu,
                    loaiA: 'NHIEM_VU',
                    loaiB: 'CONG_VAN_DI',
                    keyB: req.params.id
                });
                if (await app.hcthNhiemVu.checkNhiemVuPermission(req, null, req.query.nhiemVu)
                    && count && count.rows[0] && count.rows[0]['COUNT(*)'])
                    return true;
            }

            const canBoNhan = congVan.canBoNhan;
            const donViGui = congVan.donViGui;
            let maDonViQuanLy = req.session.user?.staff?.donViQuanLy || [];
            if (canBoNhan && canBoNhan.split(',').includes(req.session.user.shcc))
                return true;
            else if (donViGui == maDonVi && (permissions.includes('donViCongVanDi:manage') || maDonViQuanLy.find(item => donViGui.includes(item.maDonVi)) || permissions.includes('donViCongVanDi:edit'))) {
                return true;
            } else {
                let maDonViNhan = donViNhan.map((item) => item.donViNhan);
                return maDonViQuanLy.find(item => maDonViNhan.includes(item.maDonVi)) || (permissions.includes('donViCongVanDi:manage') && maDonViNhan.includes(Number(req.session.user.staff?.maDonVi)));
            }
        } catch {
            return false;
        }
    };
    const viewCongVan = async (congVanId, shcc, nguoiTao) => {
        if (!shcc || shcc == nguoiTao) return;
        const history = await app.model.hcthHistory.get({ loai: 'DI', key: congVanId, shcc: shcc, hanhDong: action.VIEW });
        if (!history) {
            return await app.model.hcthHistory.create({ loai: 'DI', key: congVanId, shcc: shcc, hanhDong: action.VIEW, thoiGian: new Date().getTime() });
        }
        return;
    };


    app.get('/api/hcth/cong-van-cac-phong/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw { status: 400, message: 'Invalid id' };
            }
            const congVan = await app.model.hcthCongVanDi.get({ id });
            const donViNhan = await app.model.hcthDonViNhan.getAll({ ma: id, loai: 'DI' }, 'id, donViNhan, donViNhanNgoai', 'id');
            if (!(req.session.user.permissions.includes('hcthCongVanDi:read') || await isRelated(congVan, donViNhan, req))) {
                throw { status: 401, message: 'permission denied' };
            }
            else if (congVan?.trangThai == trangThaiCongVanDi.DA_PHAN_PHOI.id && req.session.user?.shcc) {
                await viewCongVan(id, req.session.user.shcc, congVan.nguoiTao);
            }
            let files = await app.model.hcthFile.getAllFrom(id, 'DI');

            files = files.rows;

            const phanHoi = await app.model.hcthPhanHoi.getAllFrom(id, 'DI');
            const history = await app.model.hcthHistory.getAllFrom(id, 'DI', req.query.historySortType);
            const vanBanTrinhKy = await app.model.hcthCongVanTrinhKy.getAllFrom(id);

            const vanBanTrinhKyWithListCanBo = await Promise.all(vanBanTrinhKy.rows.map(async vanBan => {
                const listCanBoKy = await app.model.hcthCanBoKy.getAll({ congVanTrinhKy: vanBan.id });
                return { ...vanBan, listCanBoKy };
            }));

            res.send({
                item: {
                    ...congVan,
                    phanHoi: phanHoi?.rows || [],
                    donViNhan: (donViNhan ? donViNhan.filter((item) => item.donViNhanNgoai == 0).map((item) => item.donViNhan) : []).toString(),
                    donViNhanNgoai: (donViNhan ? donViNhan.filter((item) => item.donViNhanNgoai == 1).map((item) => item.donViNhan) : []
                    ).toString(),
                    yeuCauKy: vanBanTrinhKyWithListCanBo,
                    listFile: files || [],
                    history: history?.rows || [],
                },
            });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/hcth/cong-van-cac-phong/phan-hoi', app.permission.check('staff:login'), (req, res) => {
        const { canBoGui, noiDung, key, ngayTao, loai } = req.body.data;

        const newPhanHoi = {
            canBoGui,
            noiDung,
            key: Number(key),
            ngayTao: Number(ngayTao),
            loai
        };

        app.model.hcthPhanHoi.create(newPhanHoi, (error, item) => res.send({ error, item }));
    });

    // sửa lại
    const getMessage = (status) => {
        switch (status) {
            case '4':
                return 'Bạn có công văn đi bị trả lại';
            case '5':
                return 'Bạn đã nhận công văn đi mới';
            default:
                return '';
        }
    };

    const getIconColor = (status) => {
        switch (status) {
            case '4':
                return 'danger';
            case '2':
            case '3':
                return 'info';
            default:
                return '';
        }
    };



    app.get('/api/hcth/cong-van-cac-phong/lich-su/:id', app.permission.check('staff:login'), (req, res) => {
        app.model.hcthHistory.getAllFrom(parseInt(req.params.id), 'DI', req.query.historySortType, (error, item) => res.send({ error, item: item?.rows || [] }));
    });

    const createNotification = async (emails, notification) => {
        return await Promise.all(emails.map(async email => {
            await app.notification.send({
                toEmail: email,
                ...notification
            });
        }));
    };

    const createStaffNotification = async (item, status) => {
        const staff = await app.model.hcthCongVanDi.getAllStaff(item.id);

        const emails = staff.rows.map(item => item.email);

        await createNotification(emails, { title: 'Công văn đi', icon: 'fa-book', subTitle: getMessage(status), iconColor: getIconColor(status), link: `/user/cong-van-cac-phong/${item.id}` });
    };

    // Đang gửi cho phòng Hcth
    const createHcthStaffNotification = async (item, status) => {
        const hcthStaff = await app.model.hcthCongVanDi.getHcthStaff();
        const emails = hcthStaff.rows.map(item => item.email);
        await createNotification(emails, { title: 'Công văn đi', icon: 'fa-book', subTitle: 'Bạn có một công văn đi cần kiểm tra', iconColor: getIconColor(status), link: `/user/hcth/cong-van-cac-phong/${item.id}` });

    };

    // Đang gửi cho phòng chuyên viên quản lý hoặc trưởng phòng
    const createCanBoQuanLyNotification = async (item, status) => {
        let listEmail = [];

        const manageStaff = await app.model.canBo.get({ maDonVi: item.donViGui, chucVu: '003' }, 'shcc, email');
        if (manageStaff && manageStaff.shcc !== item.nguoiTao) listEmail.push(manageStaff.email);

        const manageCongVanDiStaff = await app.model.fwAssignRole.getAll({ nguoiGan: manageStaff.shcc, tenRole: 'donViCongVanDi:manage' }, 'nguoiDuocGan');

        if (manageCongVanDiStaff.length > 0) {
            const listShcc = manageCongVanDiStaff.map(staff => staff.nguoiDuocGan).filter(shcc => shcc !== item.nguoiTao);

            const canBos = await app.model.canBo.getAll({
                statement: 'shcc IN (:dsCanBo)',
                parameter: {
                    dsCanBo: [...listShcc, ''],
                }
            }, 'email, shcc', 'email');

            const listStaffEmail = canBos.map(canBo => canBo.email);
            listEmail = [...listEmail, ...listStaffEmail];
        }

        await createNotification(listEmail, { title: 'Công văn đi', icon: 'fa-book', subTitle: 'Bạn có một công văn cần xem xét', iconColor: getIconColor(status), link: `/user/cong-van-cac-phong/${item.id}` });

    };

    // Đang gửi cho hiệu trưởng
    const createSchoolAdministratorNotification = async (item, status) => {
        const principal = await app.model.canBo.get({ shcc: '001.0068' }, 'shcc, email');
        await createNotification([principal.email], { title: 'Công văn đi', icon: 'fa-book', subTitle: 'Bạn có một công văn cần duyệt', iconColor: getIconColor(status), link: `/user/cong-van-cac-phong/${item.id}` });
    };

    // Gửi cho người tạo
    const createAuthorNotification = async (id, shcc, status) => {
        const staff = await app.model.canBo.get({ shcc: shcc }, 'email');

        await createNotification([staff.email], { title: 'Công văn đi', icon: 'fa-book', subTitle: 'Bạn có một công văn bị trả lại', iconColor: getIconColor(status), link: `/user/cong-van-cac-phong/${id}` });
    };

    // Gửi cho cán bộ ký
    const createSignNotification = async (item, status) => {
        const signStaff = await app.model.hcthCongVanDi.getSignStaff(item.id);

        const emails = signStaff.rows.map(item => item.email);

        await createNotification(emails, { title: 'Công văn đi', icon: 'fa-book', subTitle: 'Bạn có một công văn chờ ký', iconColor: getIconColor(status), link: `/user/cong-van-cac-phong/${item.id}` });
    };

    // Phân quyền Quản lý công văn đi trong đơn vị
    const quanLyCongVanDiRole = 'quanLyCongVanDiPhong';

    app.assignRoleHooks.addRoles(quanLyCongVanDiRole, { id: 'donViCongVanDi:manage', text: 'Quản lý công văn đi trong đơn vị' });

    app.assignRoleHooks.addHook(quanLyCongVanDiRole, async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole === quanLyCongVanDiRole && userPermissions.includes('manager:write')) {
            const assignRolesList = app.assignRoleHooks.get(quanLyCongVanDiRole).map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('staff', 'checkRoleQuanLyDonVi', (user, staff) => new Promise(resolve => {
        if (staff.donViQuanLy && staff.donViQuanLy.length > 0) {
            app.permissionHooks.pushUserPermission(user, 'donViCongVanDi:manage', 'dmDonVi:read', 'dmDonViGuiCv:read', 'dmDonViGuiCv:write', 'hcthCongVanDi:read', 'hcthCongVanDi:write', 'hcthCongVanDi:delete');
        }
        resolve();
    }));

    app.permissionHooks.add('assignRole', 'checkRoleQuanLyCongVanDiTrongDonVi', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole === quanLyCongVanDiRole);
        inScopeRoles.forEach(role => {
            if (role.tenRole == 'donViCongVanDi:manage') {
                app.permissionHooks.pushUserPermission(user, 'donViCongVanDi:manage', 'dmDonVi:read', 'dmDonViGuiCv:read', 'hcthCongVanDi:read', 'hcthCongVanDi:write', 'hcthCongVanDi:delete');
            }
        });
        resolve();
    }));

    // Phân quyền hành chính tổng hợp - Quản lí công văn đi

    const hcthQuanLyCongVanDiRole = 'hcthQuanLyCongVanDi';
    app.assignRoleHooks.addRoles(hcthQuanLyCongVanDiRole, { id: 'hcthCongVanDi:manage', text: 'Hành chính - Tổng hợp: Quản lý Công văn đi' });

    app.assignRoleHooks.addHook(hcthQuanLyCongVanDiRole, async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole == hcthQuanLyCongVanDiRole && userPermissions.includes('manager:write')) {
            const assignRolesList = app.assignRoleHooks.get(hcthQuanLyCongVanDiRole).map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    // app.permissionHooks.add('staff', 'checkRoleQuanLyHcth', (user, staff) => new Promise(resolve => {
    //     if (staff.donViQuanLy && staff.donViQuanLy.length > 0 && staff.maDonVi == MA_HCTH) {
    //         app.permissionHooks.pushUserPermission(user, 'hcthCongVanDi:manage', 'hcth:manage');
    //     }
    //     resolve();
    // }));

    app.permissionHooks.add('assignRole', 'checkRoleHcthQuanLyCongVanDi', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == hcthQuanLyCongVanDiRole);
        inScopeRoles.forEach(role => {
            if (role.tenRole === 'hcthCongVanDi:manage') {
                app.permissionHooks.pushUserPermission(user, 'hcth:login', 'hcthCongVanDi:manage', 'dmDonVi:read', 'dmDonViGuiCv:read', 'dmDonViGuiCv:write', 'dmDonViGuiCv:delete', 'hcthCongVanDi:read', 'hcthCongVanDi:write', 'hcthCongVanDi:delete');
            }
        });
        resolve();
    }));

    // Phân quyền soạn thảo công văn đi trong đơn vị
    const soanThaoCongVanDiRole = 'soanThaoCongVanDi';

    app.assignRoleHooks.addRoles(soanThaoCongVanDiRole, { id: 'donViCongVanDi:edit', text: 'Soạn thảo công văn đi trong đơn vị' });

    app.assignRoleHooks.addHook(soanThaoCongVanDiRole, async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole === soanThaoCongVanDiRole && userPermissions.includes('manager:write')) {
            const assignRolesList = app.assignRoleHooks.get(soanThaoCongVanDiRole).map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('assignRole', 'checkRoleSoanThaoCongVanDi', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == soanThaoCongVanDiRole);
        inScopeRoles.forEach(role => {
            if (role.tenRole === 'donViCongVanDi:edit') {
                app.permissionHooks.pushUserPermission(user, 'donViCongVanDi:edit', 'dmDonVi:read', 'dmDonViGuiCv:read', 'hcthCongVanDi:read', 'hcthCongVanDi:write', 'hcthCongVanDi:delete');
            }
        });
        resolve();
    }));


    app.get('/api/hcth/cong-van-cac-phong/selector/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber);
        const pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { ids = '', excludeIds = '', hasIds = 0, fromTime = null, toTime = null } = req.query.filter;

        const donViCanBo = (req.session?.user?.staff?.donViQuanly || []).map(item => item.maDonVi);
        const userPermissions = req.session.user?.permissions || [];
        const rectorsPermission = getUserPermission(req, 'rectors', ['login']);
        const hcthPermission = getUserPermission(req, 'hcth', ['login']);
        const staffType = rectorsPermission.login ? 1 : hcthPermission.login ? 2 : 0;

        const data = {
            ids, excludeIds, hasIds, fromTime, toTime,
            shccCanBo: req.session.user?.shcc,
            donViCanBo: donViCanBo.toString() || (userPermissions.includes('donViCongVanDi:manage') ? req.session.user?.staff?.maDonVi : '') || '',
            staffType
        };
        let filterParam;
        try {
            filterParam = JSON.stringify(data);
        } catch {
            res.send('Lọc dữ liệu lỗi');
            return;
        } finally {
            app.model.hcthCongVanDi.searchSelector(pageNumber, pageSize, filterParam, searchTerm, (error, page) => {
                if (error || !page) res.send({ error });
                else {
                    const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                    const pageCondition = searchTerm;
                    res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
                }
            });
        }
    });

    const updateCongVanDi = (id, changes) => new Promise((resolve, reject) => {
        app.model.hcthCongVanDi.update({ id }, changes, (error, item) => {
            if (error) {
                reject(error);
            } else {
                resolve(item);
            }
        });
    });

    const statusToAction = (before, after) => {
        switch (before) {
            case trangThaiCongVanDi.NHAP.id:
            case trangThaiCongVanDi.TRA_LAI.id:
                if (before == after) {
                    return action.UPDATE;
                }
                return action.SEND;
            // Cần làm trả lại ở đây
            case trangThaiCongVanDi.XEM_XET.id:
                if (after == trangThaiCongVanDi.TRA_LAI_PHONG.id) {
                    return action.RETURN;
                }
                return action.SEND;
            case trangThaiCongVanDi.CHO_KIEM_TRA.id:
                if (after == trangThaiCongVanDi.TRA_LAI.id) return action.RETURN;
                else return action.ACCEPT;
            case trangThaiCongVanDi.CHO_DUYET.id:
                if (after == trangThaiCongVanDi.TRA_LAI.id) return action.RETURN;
                else return action.APPROVE;
            case trangThaiCongVanDi.DA_XEM_XET.id:
            case trangThaiCongVanDi.DA_DUYET.id:
                return action.WAIT_SIGN;
            //Từ chờ phân phối -> chờ ký hoặc đã phân phối
            case trangThaiCongVanDi.CHO_PHAN_PHOI.id:
                if (after == trangThaiCongVanDi.CHO_KY.id) return action.WAIT_SIGN;
                else if (after == trangThaiCongVanDi.TRA_LAI_HCTH.id) return action.RETURN;
                else return action.DISTRIBUTE;
            case trangThaiCongVanDi.TRA_LAI_HCTH.id:
                if (before == after) return action.UPDATE;
                else return action.SEND;
            default:
                return '';
        }
    };

    const createSoCongVan = (ma, donViGui) => new Promise((resolve, reject) => {
        const currentYear = new Date().getFullYear();
        const firstDayOfYear = new Date(currentYear, 0, 1);
        const nam = Date.parse(firstDayOfYear);
        app.model.hcthCongVanDi.updateSoCongVanDi(ma, donViGui, nam, (error) => {
            if (error) {
                return reject(error);
            } else {
                resolve();
            }
        });
    });

    app.put('/api/hcth/cong-van-cac-phong/status', app.permission.check('staff:login'), async (req, res) => {
        try {
            let { id, trangThai, donViGui } = req.body.data;
            const congVan = await app.model.hcthCongVanDi.get({ id });
            if (congVan.trangThai == trangThai || !trangThai) {
                res.send({ error: null, item: congVan });
            } else {
                if (trangThai == trangThaiCongVanDi.DA_XEM_XET.id) {
                    await createSoCongVan(id, donViGui);
                }
                if (trangThai == trangThaiCongVanDi.CHO_KY.id) {
                    const congVanTrinhKy = await app.model.hcthCongVanTrinhKy.get({ congVan: id });
                    console.log(congVanTrinhKy);
                    if (!congVanTrinhKy) {
                        console.log('ok');
                        trangThai = trangThaiCongVanDi.DA_PHAN_PHOI.id;
                    }
                }

                // const newCongVan = await updateCongVanDi(id, { trangThai });
                await app.model.hcthHistory.create({
                    key: id,
                    loai: CONG_VAN_DI_TYPE,
                    thoiGian: new Date().getTime(),
                    shcc: req.session?.user?.shcc,
                    hanhDong: statusToAction(congVan.trangThai, trangThai),
                });
                const canBoTao = congVan.nguoiTao;
                const newCongVan = await updateCongVanDi(id, { trangThai });
                if (canBoTao) {
                    await onStatusChange(congVan, congVan.trangThai, trangThai, canBoTao);
                }
                console.log(trangThai);
                res.send({ newCongVan });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/hcth/cong-van-cac-phong/read/:id', app.permission.check('staff:login'), async (req, res) => {
        const { id, shcc } = req.body.data;
        // check permission
        const check = await app.model.hcthHistory.get({ key: id, hanhDong: action.READ, loai: 'DI', shcc: shcc });

        try {
            if (check) {
                throw 400;
            }
            await app.model.hcthHistory.create({
                key: id,
                loai: CONG_VAN_DI_TYPE,
                thoiGian: new Date().getTime(),
                shcc: req.session?.user?.shcc,
                hanhDong: action.READ,
            });
            res.send({ error: null });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/hcth/cong-van-cac-phong/phan-hoi/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const phanHoi = await app.model.hcthPhanHoi.getAllFrom(id, CONG_VAN_DI_TYPE);
            res.send({ error: null, item: phanHoi?.rows || [] });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/hcth/cong-van-cac-phong/yeu-cau-ky/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);

            const vanBanTrinhKy = await app.model.hcthCongVanTrinhKy.getAllFrom(id);

            const vanBanTrinhKyWithListCanBo = await Promise.all(vanBanTrinhKy.rows.map(async vanBan => {
                const listCanBoKy = await app.model.hcthCanBoKy.getAll({ congVanTrinhKy: vanBan.id });
                return { ...vanBan, listCanBoKy };
            }));

            res.send({ error: null, item: vanBanTrinhKyWithListCanBo });

        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/hcth/cong-van-cac-phong/download-excel/:filter', app.permission.check('staff:login'), (req, res) => {
        let { donViGui, donViNhan, canBoNhan, loaiCongVan, loaiVanBan, donViNhanNgoai, status, timeType, fromTime, toTime, congVanYear } = req.params.filter ? JSON.parse(req.params.filter) : { donViGui: null, donViNhan: null, canBoNhan: null, loaiCongVan: null, loaiVanBan: null, donViNhanNgoai: null, status: null, timeType: null, fromTime: null, toTime: null, congVanYear: null };
        let donViXem = '', canBoXem = '';
        const searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';

        if (donViGui == 'null') donViGui = null;
        if (donViNhan == 'null') donViNhan = null;
        if (canBoNhan == 'null') canBoNhan = null;
        if (loaiCongVan == 'null') loaiCongVan = null;
        if (loaiVanBan == 'null') loaiVanBan = null;
        if (donViNhanNgoai == 'null') donViNhanNgoai = null;
        if (status == 'null') status = null;
        if (timeType == 'null') timeType = null;
        if (fromTime == 'null') fromTime = null;
        if (toTime == 'null') toTime = null;
        if (congVanYear == 'null') congVanYear = null;

        const rectorsPermission = getUserPermission(req, 'rectors', ['login']);
        const hcthPermission = getUserPermission(req, 'hcth', ['manage']),
            hcthManagePermission = getUserPermission(req, 'hcthCongVanDi', ['manage']);
        const user = req.session.user;
        const permissions = user.permissions;

        donViXem = req.session?.user?.staff?.donViQuanLy || [];
        donViXem = donViXem.map(item => item.maDonVi).toString() || permissions.includes('donViCongVanDi:manage') && req.session?.user?.staff?.maDonVi || '';
        canBoXem = req.session?.user?.shcc || '';

        let loaiCanBo = rectorsPermission.login ? 1 : hcthPermission.manage ? 2 : 0;

        if (rectorsPermission.login || hcthPermission.manage || (!user.isStaff && !user.isStudent) || hcthManagePermission.manage) {
            donViXem = '';
            canBoXem = '';
        }

        if (congVanYear && Number(congVanYear) > 1900) {
            timeType = 1;
            fromTime = new Date(`${congVanYear}-01-01`).getTime();
            toTime = new Date(`${Number(congVanYear) + 1}-01-01`).getTime();
        }

        app.model.hcthCongVanDi.downloadExcel(canBoNhan, donViGui, donViNhan, loaiCongVan, loaiVanBan, donViNhanNgoai, donViXem, canBoXem, loaiCanBo, status ? status.toString() : status, timeType, fromTime, toTime, searchTerm, (error, result) => {
            if (error || !result) {
                res.send({ error });
            } else {
                const workbook = app.excel.create(),
                    worksheet = workbook.addWorksheet('congvancacphong');
                const cells = [
                    {
                        header: 'STT', width: 10, style: {
                            border: {
                                top: { style: 'thin' },
                                left: { style: 'thin' },
                                bottom: { style: 'thin' },
                                right: { style: 'thin' }
                            }
                        }
                    },
                    {
                        header: 'Ngày gửi', width: 15, style: {
                            border: {
                                top: { style: 'thin' },
                                left: { style: 'thin' },
                                bottom: { style: 'thin' },
                                right: { style: 'thin' }
                            }
                        }
                    },
                    {
                        header: 'Ngày ký', width: 15, style: {
                            border: {
                                top: { style: 'thin' },
                                left: { style: 'thin' },
                                bottom: { style: 'thin' },
                                right: { style: 'thin' }
                            }
                        }
                    },
                    {
                        header: 'Trích yếu', width: 50, style: {
                            border: {
                                top: { style: 'thin' },
                                left: { style: 'thin' },
                                bottom: { style: 'thin' },
                                right: { style: 'thin' }
                            }
                        }
                    },
                    {
                        header: 'Số công văn', width: 20, style: {
                            border: {
                                top: { style: 'thin' },
                                left: { style: 'thin' },
                                bottom: { style: 'thin' },
                                right: { style: 'thin' }
                            }
                        }
                    },
                    {
                        header: 'Đơn vị gửi', width: 30, style: {
                            border: {
                                top: { style: 'thin' },
                                left: { style: 'thin' },
                                bottom: { style: 'thin' },
                                right: { style: 'thin' }
                            }
                        }
                    },
                    {
                        header: 'Đơn vị, cán bộ nhận', width: 45, style: {
                            border: {
                                top: { style: 'thin' },
                                left: { style: 'thin' },
                                bottom: { style: 'thin' },
                                right: { style: 'thin' }
                            }
                        }
                    }
                ];

                worksheet.columns = cells;
                worksheet.getRow(1).alignment = {
                    ...worksheet.getRow(1).alignment,
                    vertical: 'middle',
                    horizontal: 'center',
                    wrapText: true
                };
                worksheet.getRow(1).font = {
                    name: 'Times New Roman',
                    family: 4,
                    size: 12,
                    bold: true
                };

                worksheet.getRow(1).height = 40;
                result.rows.forEach((item, index) => {
                    worksheet.getRow(index + 2).alignment = {
                        ...worksheet.getRow(index + 2).alignment,
                        vertical: 'middle',
                        horizontal: 'center',
                        wrapText: true
                    };
                    worksheet.getRow(index + 2).font = {
                        name: 'Times New Roman',
                        size: 12
                    };
                    worksheet.getCell('A' + (index + 2)).value = index + 1;
                    worksheet.getCell('B' + (index + 2)).value = item.ngayGui ? app.date.dateTimeFormat(new Date(item.ngayGui), 'dd/mm/yyyy') : '';
                    worksheet.getCell('C' + (index + 2)).value = item.ngayKy ? app.date.dateTimeFormat(new Date(item.ngayKy), 'dd/mm/yyyy') : '';
                    worksheet.getCell('D' + (index + 2)).value = item.trichYeu;
                    worksheet.getCell('D' + (index + 2)).alignment = { ...worksheet.getRow(index + 2).alignment, horizontal: 'left' };
                    worksheet.getCell('E' + (index + 2)).value = item.soCongVan;
                    worksheet.getCell('F' + (index + 2)).value = item.tenDonViGui;
                    worksheet.getCell('F' + (index + 2)).alignment = { ...worksheet.getRow(index + 2).alignment, horizontal: 'left' };

                    const donViNhan = item.danhSachDonViNhan?.split(';').map(item => item + '\r\n').join('') || '';
                    const canBoNhan = item.danhSachCanBoNhan?.split(';').map(item => item + '\r\n').join('') || '';
                    const donViNhanNgoai = item.danhSachDonViNhanNgoai?.split(';').map(item => item + '\r\n').join('') || '';
                    worksheet.getCell('G' + (index + 2)).value = donViNhan != '' || donViNhanNgoai != '' || canBoNhan != '' ? donViNhan + donViNhanNgoai + canBoNhan : '';
                    worksheet.getCell('G' + (index + 2)).alignment = { ...worksheet.getRow(index + 2).alignment, horizontal: 'left' };
                });
                let fileName = 'congvancacphong.xlsx';
                app.excel.attachment(workbook, res, fileName);
            }
        });
    });

    const onStatusChange = async (item, before, after, shcc) => {
        if (trangThaiCongVanDi.XEM_XET.id == after) {
            await createCanBoQuanLyNotification(item, after);
        }
        else if ([trangThaiCongVanDi.CHO_KIEM_TRA.id, trangThaiCongVanDi.CHO_PHAN_PHOI.id].includes(after)) {
            await createHcthStaffNotification(item, after);
        } else if (after == trangThaiCongVanDi.CHO_DUYET.id) {
            await createSchoolAdministratorNotification(item, after);
        } else if (after == trangThaiCongVanDi.DA_PHAN_PHOI.id) {
            await createStaffNotification(item, after);
        } else if ([trangThaiCongVanDi.TRA_LAI_PHONG.id, trangThaiCongVanDi.TRA_LAI_HCTH.id, trangThaiCongVanDi.TRA_LAI.id].includes(after)) {
            await createAuthorNotification(item.id, shcc, after);
        } else if (after == trangThaiCongVanDi.CHO_KY.id) {
            await createSignNotification(item, after);
        }
    };


    //api chuyển từ giai đoạn soạn thảo sang phát hành
    app.put('/api/hcth/cong-van-cac-phong/publishing/:id', app.permission.check('staff:login'), async (req, res) => {
        // TODO: viết cho trường hợp có cán bộ ký
        try {
            const id = Number(req.params.id);
            const congVan = await app.model.hcthCongVanDi.get({ id });
            if (!congVan) throw 'Công văn không tồn tại';
            if (congVan.loaiCongVan == loaiCongVan.DON_VI.id) {
                // TODO: check quyền throw '...'
                if (congVan.trangThai != trangThaiCongVanDi.DA_XEM_XET.id) throw 'Trạng thái công văn không hợp lệ';
                const congVanTrinhKy = await app.model.hcthCongVanTrinhKy.getAll({ congVan: id });
                const trangThaiMoi = congVanTrinhKy.length ? trangThaiCongVanDi.CHO_KY.id : trangThaiCongVanDi.DA_PHAN_PHOI.id;
                if (!congVan.laySoTuDong) {
                    const currentYear = new Date().getFullYear();
                    const firstDayOfYear = new Date(currentYear, 0, 1);
                    const nam = Date.parse(firstDayOfYear);
                    try {
                        await app.model.hcthCongVanDi.validateSoCongVan(Number(id), congVan.donViGui, nam, trangThaiMoi);
                    } catch {
                        throw { message: 'Số công văn không hợp lệ' };
                    }
                } else await app.model.hcthCongVanDi.update({ id }, { trangThai: trangThaiMoi });
                // TODO: gửi thông báo nếu có công văn trình ký
                return res.send({});
            }
            else {
                //
                if (congVan.trangThai != trangThaiCongVanDi.DA_DUYET.id) {
                    throw 'Trạng thái công văn không hợp lệ';
                }
                // const congVanTrinhKy = await app.model.hcthCongVanTrinhKy.getAll({ congVan: id });
                const trangThaiMoi = trangThaiCongVanDi.CHO_PHAN_PHOI.id;
                await app.model.hcthCongVanDi.update({ id }, { trangThai: trangThaiMoi });
                return res.send({});
            }
        } catch (error) {
            console.error(error);
            return res.send({ error });
        }
    });
};
