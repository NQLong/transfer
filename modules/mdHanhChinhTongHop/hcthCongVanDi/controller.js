module.exports = app => {
    const FILE_TYPE = 'DI';

    const { trangThaiCongVanDi, CONG_VAN_DI_TYPE, action, } = require('../constant');

    const staffMenu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            502: { title: 'Công văn các phòng', link: '/user/hcth/cong-van-cac-phong', icon: 'fa-caret-square-o-right', backgroundColor: '#0B86AA' },
        },
    };

    const menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            1053: { title: 'Công văn các phòng', link: '/user/cong-van-cac-phong', icon: 'fa-caret-square-o-right', backgroundColor: '#0B86AA', groupIndex: 5 },
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
        let { donViGui, donViNhan, canBoNhan, loaiCongVan, donViNhanNgoai, status } = req.query.filter && req.query.filter != '%%%%%%' ? req.query.filter :
            { donViGui: null, donViNhan: null, canBoNhan: null, loaiCongVan: null, donViNhanNgoai: null, status: null, },
            donViXem = '',
            canBoXem = '';

        const rectorsPermission = getUserPermission(req, 'rectors', ['login']);
        const hcthPermission = getUserPermission(req, 'hcth', ['login']);
        const user = req.session.user;
        const permissions = user.permissions;

        donViXem = req.session?.user?.staff?.donViQuanLy || [];
        donViXem = donViXem.map(item => item.maDonVi).toString() || permissions.includes('donViCongVanDi:manage') && req.session?.user?.staff?.maDonVi || '';
        canBoXem = req.session?.user?.shcc || '';

        let loaiCanBo = rectorsPermission.login ? 1 : hcthPermission.login ? 2 : 0;

        if (rectorsPermission.login || hcthPermission.login || (!user.isStaff && !user.isStudent)) {
            donViXem = '';
            canBoXem = '';
        }

        app.model.hcthCongVanDi.searchPage(pageNumber, pageSize, canBoNhan, donViGui, donViNhan, loaiCongVan, donViNhanNgoai, donViXem, canBoXem, loaiCanBo, status ? status.toString() : status, searchTerm, (error, page) => {
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
        app.model.hcthCongVanDi.create({ ...data }, (error, item) => {
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
                sourcePath = app.path.join(app.assetPath, `/congVanDi/new/${changes.ten}`),
                destPath = app.path.join(app.assetPath, `/congVanDi/${congVanId}/${changes.ten}`);
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
                                            if (trangThaiBefore == trangThaiCongVanDi.MOI.id && [trangThaiCongVanDi.CHO_KIEM_TRA.id, trangThaiCongVanDi.DA_GUI.id,].includes(trangThaiAfter)) {
                                                hanhDong = action.SEND;
                                            } else
                                                hanhDong = action.UPDATE;
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
                        app.model.hcthFile.create({ ten: originalFilename, thoiGian: new Date().getTime(), loai: FILE_TYPE, ma: id === 'new' ? null : id }, (error, item) => done && done({ error, item }));
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
        app.model.hcthFile.delete({ id: fileId, ma: congVan }, (error) => {
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

    app.get('/api/hcth/cong-van-cac-phong/download/:id/:fileName', app.permission.check('hcthCongVanDi:read'), async (req, res) => {
        try {
            const { id, fileName } = req.params;
            const congVan = await app.model.hcthCongVanDi.getCVD({ id });
            const donViNhan = await app.model.hcthDonViNhan.getAllDVN({ ma: id, loai: 'DI' }, 'donViNhan', 'id');
            if (!await isRelated(congVan, donViNhan, req)) {
                throw { status: 401, message: 'Bạn không có quyền xem tập tin này!' };
            } else {
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
            const maDonVi = req.session.user.staff.maDonVi;
            if (permissions.includes('rectors:login') || permissions.includes('hcth:login')) {
                return true;
            }
            if (req.query.nhiemVu) {
                const count = await app.model.hcthLienKet.asyncCount({
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
            else if (donViGui == maDonVi && (permissions.includes('donViCongVanDi:manage') || maDonViQuanLy.find(item => donViGui.includes(item.maDonVi)))) {
                return true;
            } else {
                let maDonViNhan = donViNhan.map((item) => item.donViNhan);
                return maDonViQuanLy.find(item => maDonViNhan.includes(item.maDonVi)) || (permissions.includes('donViCongVanDi:manage') && maDonViNhan.includes(Number(req.session.user.staff?.maDonVi)));
            }
        } catch {
            return false;
        }
    };

    app.get('/api/hcth/cong-van-cac-phong/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw { status: 400, message: 'Invalid id' };
            }
            const congVan = await app.model.hcthCongVanDi.getCVD({ id });
            const donViNhan = await app.model.hcthDonViNhan.getAllDVN({ ma: id, loai: 'DI' }, 'id, donViNhan, donViNhanNgoai', 'id');
            if (!(await isRelated(congVan, donViNhan, req))) {
                throw { status: 401, message: 'permission denied' };
            }
            const files = await app.model.hcthFile.getAllFile({ ma: id, loai: 'DI' }, '*', 'thoiGian');
            const phanHoi = await app.model.hcthPhanHoi.getAllPhanHoiFrom(id, 'DI');
            const history = await app.model.hcthHistory.getAllHistoryFrom(id, 'DI');

            res.send({
                item: {
                    ...congVan,
                    phanHoi: phanHoi || [],
                    donViNhan: (donViNhan ? donViNhan.filter((item) => item.donViNhanNgoai == 0).map((item) => item.donViNhan) : []).toString(),
                    donViNhanNgoai: (donViNhan ? donViNhan.filter((item) => item.donViNhanNgoai == 1).map((item) => item.donViNhan) : []
                    ).toString(),
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
        app.model.hcthHistory.getAllFrom(parseInt(req.params.id), 'DI', (error, item) => res.send({ error, item: item?.rows || [] }));
    });

    const createNotification = (emails, notification, done) => {
        const promises = [];
        emails.forEach(email => {
            promises.push(app.notification.send({
                toEmail: email,
                ...notification
            }));
        });
        Promise.all(promises).then(() => done(null)).catch((error) => done(error));
    };

    const createStaffNotification = (item, status) => new Promise((resolve, reject) => {
        app.model.hcthCongVanDi.getAllStaff(item.id, (error, staffs) => {
            if (error) return reject(error);
            else {
                const emails = staffs.rows.map(item => item.email);
                createNotification(emails, { title: 'Công văn đi', icon: 'fa-book', subTitle: getMessage(status), iconColor: getIconColor(status), link: `/user/cong-van-cac-phong/${item.id}` }, error => {
                    error ? reject(error) : resolve();
                });
            }
        });
    });

    // Đang gửi cho phòng Hcth
    const createHcthStaffNotification = (item, status) => new Promise((resolve, reject) => {
        app.model.hcthCongVanDi.getHcthStaff((error, staffs) => {
            if (error) reject(error);
            else {
                const emails = staffs.rows.map(item => item.email);
                createNotification(emails, { title: 'Công văn đi', icon: 'fa-book', subTitle: 'Bạn có một công văn đi cần kiểm tra', iconColor: getIconColor(status), link: `/user/hcth/cong-van-cac-phong/${item.id}` }, error => {
                    if (error) reject(error);
                    else resolve();
                }
                );
            }
        });
    });

    // Đang gửi cho cô Lan
    const createSchoolAdministratorNotification = (item, status) => new Promise((resolve, reject) => {
        app.model.canBo.get({ shcc: '001.0068' }, 'email', '', (error, staff) => {
            if (error) reject(error);
            else {
                app.notification.send({ toEmail: staff.email, title: 'Công văn đi', icon: 'fa-book', subTitle: 'Bạn có một công văn cần duyệt', iconColor: getIconColor(status), link: `/user/cong-van-cac-phong/${item.id}` });
                resolve();
            }
        });
    });

    // Đang gửi trả lại
    const createAuthorNotification = (id, shcc, status) => new Promise((resolve, reject) => {
        app.model.canBo.get({ shcc: shcc }, 'email', '', (error, staff) => {
            if (error) reject(error);
            else {
                app.notification.send({ toEmail: staff.email, title: 'Công văn đi', icon: 'fa-book', subTitle: 'Bạn có một công văn bị trả lại', iconColor: getIconColor(status), link: `/user/cong-van-cac-phong/${id}` });
                resolve();
            }
        });
    });

    // Phân quyền Quản lý công văn đi trong đơn vị
    const quanLyCongVanDiRole = 'quanLyCongVanDiPhong';

    app.assignRoleHooks.addRoles(quanLyCongVanDiRole, { id: 'donViCongVanDi:manage', text: 'Quản lý công văn các phòng trong đơn vị' });

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
    app.assignRoleHooks.addRoles(hcthQuanLyCongVanDiRole, { id: 'hcthCongVanDi:manage', text: 'Hành chính - Tổng hợp: Quản lý Công văn các phòng' });

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
            case trangThaiCongVanDi.MOI.id:
            case trangThaiCongVanDi.TRA_LAI.id:
                if (before == after) {
                    return action.UPDATE;
                }
                return action.SEND;
            case trangThaiCongVanDi.CHO_KIEM_TRA.id:
                if (after == trangThaiCongVanDi.TRA_LAI.id) return action.RETURN;
                else return action.ACCEPT;
            case trangThaiCongVanDi.CHO_DUYET.id:
                if (after == trangThaiCongVanDi.TRA_LAI.id) return action.RETURN;
                else return action.APPROVE;
            case trangThaiCongVanDi.DA_GUI.id:
                return action.READ;
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
            const congVan = await app.model.hcthCongVanDi.getCVD({ id });
            if (congVan.trangThai == trangThai || !trangThai) {
                res.send({ error: null, item: congVan });
            } else {
                if (trangThai == trangThaiCongVanDi.DA_GUI.id) {
                    await createSoCongVan(id, donViGui);
                }
                const newCongVan = await updateCongVanDi(id, { trangThai });
                await app.model.hcthHistory.asyncCreate({
                    key: id,
                    loai: CONG_VAN_DI_TYPE,
                    thoiGian: new Date().getTime(),
                    shcc: req.session?.user?.shcc,
                    hanhDong: statusToAction(congVan.trangThai, trangThai),
                });
                const canBoGui = await app.model.hcthHistory.getStaff({ key: id, hanhDong: 'CREATE' }, 'shcc', '');
                await onStatusChange(newCongVan, congVan.trangThai, trangThai, canBoGui.shcc);
                res.send({ newCongVan });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/hcth/cong-van-cac-phong/read/:id', app.permission.check('staff:login'), async (req, res) => {
        const { id, shcc } = req.body.data;
        // check permission
        const check = await app.model.hcthHistory.asyncGet({ key: id, hanhDong: action.READ, loai: 'DI', shcc: shcc });

        // console.log(check);
        // console.log(shcc);
        try {
            if (check) {
                throw 400;
            }
            // console.log(id);
            await app.model.hcthHistory.asyncCreate({
                key: id,
                loai: CONG_VAN_DI_TYPE,
                thoiGian: new Date().getTime(),
                shcc: req.session?.user?.shcc,
                hanhDong: action.READ,
            });
            res.send({ error: null });
        } catch (error) {
            if (res.error == 400) {
                res.send({ error: 400 });
            } else {
                res.send({ error });
            }
        }
    });

    app.get('/api/hcth/cong-van-cac-phong/phan-hoi/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const phanHoi = await app.model.hcthPhanHoi.getAllPhanHoiFrom(id, CONG_VAN_DI_TYPE);
            res.send({ error: null, item: phanHoi });
        } catch (error) {
            res.send({ error });
        }
    }
    );

    const onStatusChange = (item, before, after, shcc) =>
        new Promise((resolve) => {
            try {
                if (before == after) resolve();
                else if (after == trangThaiCongVanDi.CHO_KIEM_TRA.id) {
                    createHcthStaffNotification(item, after).then(() => resolve()).catch((error) => {
                        throw error;
                    });
                } else if (after == trangThaiCongVanDi.CHO_DUYET.id) {
                    createSchoolAdministratorNotification(item, after).then(() => resolve()).catch((error) => {
                        throw error;
                    });
                } else if (after == trangThaiCongVanDi.DA_GUI.id) {
                    createStaffNotification(item, after).then(() => resolve()).catch((error) => {
                        throw error;
                    });
                } else if (after == trangThaiCongVanDi.TRA_LAI.id) {
                    createAuthorNotification(item.id, shcc, after).then(() => resolve()).catch((error) => {
                        throw error;
                    });
                }
            } catch (error) {
                console.error(error);
                resolve();
            }
        });
};
