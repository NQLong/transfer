module.exports = (app) => {

    const { canBoType, handleResult, trangThaiNhiemVu } = require('../constant');

    const menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            1054: { title: 'Nhiệm vụ', link: '/user/nhiem-vu', icon: 'fa-list-alt', backgroundColor: '#de602f', groupIndex: 4 },
        },
    };

    const hcthMenu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            503: { title: 'Nhiệm vụ', link: '/user/hcth/nhiem-vu', icon: 'fa-list-alt', backgroundColor: '#de602f' },
        },
    };
    app.permission.add(
        { name: 'hcthGiaoNhiemVu:read' },
        { name: 'hcthGiaoNhiemVu:write' },
        { name: 'hcthGiaoNhiemVu:delete' },
        { name: 'hcth:login', menu: hcthMenu },
        { name: 'hcth:manage' },
        { name: 'staff:login', menu },
    );

    app.get('/user/hcth/nhiem-vu', app.permission.check('hcth:login'), app.templates.admin);
    app.get('/user/hcth/nhiem-vu/:id', app.permission.check('hcth:login'), app.templates.admin);

    app.get('/user/nhiem-vu', app.permission.check('staff:login'), app.templates.admin);
    app.get('/user/nhiem-vu/:id', app.permission.check('staff:login'), app.templates.admin);

    //api

    const updateListFile = (listFile, nhiemVuId) => {
        const promises = listFile.map(file => new Promise((resolve, reject) => {
            const
                { id, ...changes } = file,
                sourcePath = app.path.join(app.assetPath, `/nhiemVu/new/${changes.ten}`),
                destPath = app.path.join(app.assetPath, `/nhiemVu/${nhiemVuId}/${changes.ten}`);
            if (!changes.ma)
                app.fs.rename(sourcePath, destPath, error => {
                    if (error) reject(error);
                    else
                        app.model.hcthFile.update({ id }, { ...changes, ma: nhiemVuId }, (error) => {
                            if (error) reject(error);
                            else resolve();
                        });
                });
            else
                app.model.hcthFile.update({ id }, { ...changes }, (error) => {
                    if (error) reject(error);
                    else resolve();
                });
        }));
        return Promise.all(promises);
    };


    const updateDonViNhan = async (current, change, ma) => {
        const diff = change.filter(maDonVi => !current.some(currentItem => currentItem.donViNhan == maDonVi));
        const deleteList = current.filter(currentItem => !change.includes(currentItem.donViNhan.toString())).map(currentItem => currentItem.id);
        if (deleteList.length > 0)
            await app.model.hcthDonViNhan.asyncDelete({ statement: 'id in (:ids)', parameter: { ids: deleteList } });
        if (diff.length > 0)
            await app.model.hcthDonViNhan.createFromList(diff, ma, 'NHIEM_VU');
    };

    // const deleteNhiemVu = (id, done) => {
    //     app.model.hcthFile.delete({ ma: id, loai: 'NHIEM_VU' }, (error) => {
    //         if (error) done && done({ error });
    //         else
    //             app.model.hcthNhiemVu.delete({ id }, error => {
    //                 app.deleteFolder(app.assetPath + '/nhiemVu/' + id);
    //                 done && done({ error });
    //             });
    //     });
    // };


    const createCanBoNhan = (danhSachCanBo, nguoiTao, vaiTro, id) => {
        const promises = danhSachCanBo.map(canBo => new Promise((resolve, reject) => {
            app.model.hcthCanBoNhan.create({ canBoNhan: canBo, nguoiTao, ma: id, loai: 'NHIEM_VU', vaiTro }, (error, item) => {
                if (error) reject(error); else resolve(item);
            });
        }));
        return Promise.all(promises);
    };


    const updateCanBoNhan = (ids, ma) => new Promise((resolve, reject) => {
        if (!ids || ids.length == 0)
            resolve();
        app.model.hcthCanBoNhan.update({ statement: 'id in (:ids)', parameter: { ids: ids.map(item => Number(item)) } }, { ma }, error => {
            if (error) reject(error); else resolve(ids);
        });
    });


    app.post('/api/hcth/nhiem-vu', app.permission.orCheck('manager:write', 'htch:manage', 'rectors:login'), async (req, res) => {
        try {
            const { canBoNhan = [], fileList = [], donViNhan = [], ...data } = req.body;
            const nhiemVu = await app.model.hcthNhiemVu.asyncCreate({ ...data, trangThai: trangThaiNhiemVu.MOI.id });
            await app.model.hcthDonViNhan.createFromList(donViNhan, nhiemVu.id, 'NHIEM_VU');
            await updateCanBoNhan(canBoNhan, nhiemVu.id);
            app.createFolder(app.path.join(app.assetPath, `/nhiemVu/${nhiemVu.id}`));
            await updateListFile(fileList, nhiemVu.id);
            res.send({ error: null });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/hcth/nhiem-vu', app.permission.orCheck('manager:write', 'rectors:login', 'hcth:manage', 'president:login'), async (req, res) => {
        try {
            const
                { id, changes } = req.body,
                { fileList = [], donViNhan = [], ...data } = changes;
            const nhiemVu = app.model.hcthNhiemVu.asyncUpdate({ id }, data);
            await updateDonViNhan(await app.model.hcthDonViNhan.getAllDVN({ ma: id, loai: 'NHIEM_VU' }, '*', ''), donViNhan, id);
            await updateListFile(fileList, id);
            res.send({ error: null, item: nhiemVu });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.delete('/api/hcth/nhiem-vu', app.permission.check('hcthGiaoNhiemVu:delete'), (req, res) => {
        app.model.hcthNhiemVu.delete({ id: req.body.id }, errors => {
            app.deleteFolder(app.assetPath + '/congVanDen/' + req.body.id);
            res.send({ errors });
        });
    });

    app.get('/api/hcth/nhiem-vu/search/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        let { donViNhan, canBoNhan } = (req.query.filter && req.query.filter != '%%%%%%') ? req.query.filter :
            { donViNhan: null, canBoNhan: null, ngayHetHan: null };
        donViNhan = donViNhan || null;
        canBoNhan = canBoNhan || null;
        const user = req.session.user;
        const permissions = user.permissions;
        let shccCanBo = user.shcc;
        const donViCanBo = ((user.staff?.donViQuanLy || []).map(item => item.maDonVi)).toString();
        let _canBoType;
        if (permissions.includes('hcth:manage'))
            _canBoType = canBoType.HCTH;
        else if (permissions.includes('president:login')) {
            _canBoType = canBoType.RECTOR;
        }

        const data = { donViNhan, canBoNhan, shccCanBo, donViCanBo, canBoType: _canBoType || null };
        let filterParam;
        try {
            filterParam = JSON.stringify(data);
        } catch (error) {
            filterParam = '{}';
        }

        app.model.hcthNhiemVu.searchPage(pageNumber, pageSize, filterParam, searchTerm, (error, page) => {
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


    app.uploadHooks.add('hcthNhiemVuFile', (req, fields, files, params, done) =>
        app.permission.has(req, () => hcthNhiemVuFile(req, fields, files, params, done), done, 'staff:login'));

    const hcthNhiemVuFile = (req, fields, files, params, done) => {
        if (
            fields.userData &&
            fields.userData[0] &&
            fields.userData[0].startsWith('hcthNhiemVuFile') &&
            files.hcthNhiemVuFile &&
            files.hcthNhiemVuFile.length > 0) {
            const
                srcPath = files.hcthNhiemVuFile[0].path,
                isNew = fields.userData[0].substring(16) == 'new',
                id = fields.userData[0].substring(16),
                originalFilename = files.hcthNhiemVuFile[0].originalFilename,
                filePath = (isNew ? '/new/' : `/${id}/`) + files.hcthNhiemVuFile[0].originalFilename,
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
                        app.model.hcthFile.create({ ten: originalFilename, thoiGian: new Date().getTime(), loai: 'NHIEM_VU', ma: id === 'new' ? null : id }, (error, item) => {
                            done && done({ error, item });
                        });
                    }
                });
            }
        }
    };

    app.get('/api/hcth/nhiem-vu/download/:id/:fileName', app.permission.check('staff:login'), (req, res) => {
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

    app.get('/api/hcth/nhiem-vu/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            const id = req.params.id;
            const nhiemVu = await app.model.hcthNhiemVu.asyncGet({ id });
            const phanHoi = await app.model.hcthPhanHoi.getAllPhanHoiFrom(id, 'NHIEM_VU');
            const canBoNhan = await app.model.hcthCanBoNhan.getAllCanBoNhanFrom(id, 'NHIEM_VU');
            const listFile = await app.model.hcthFile.getAllFile({ ma: id, loai: 'NHIEM_VU' }, '*', 'thoiGian');
            const lienKet = await app.model.hcthLienKet.getAllLienKet(id, 'NHIEM_VU', null, null);
            const donViNhan = await app.model.hcthDonViNhan.getAllDVN({ ma: id, loai: 'NHIEM_VU' }, '*', 'id');

            res.send({
                error: null, item: {
                    ...nhiemVu,
                    phanHoi: phanHoi || [],
                    listFile: listFile || [],
                    canBoNhan: canBoNhan?.rows || [],
                    lienKet: lienKet?.rows || [],
                    donViNhan: donViNhan || []
                }
            });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/hcth/nhiem-vu/phan-hoi', app.permission.check('staff:login'), (req, res) => {
        app.model.hcthPhanHoi.create({ ...req.body.data, loai: 'NHIEM_VU' }, (error, item) => {
            res.send({ error, item });
        });
    });

    app.get('/api/hcth/nhiem-vu/phan-hoi/:id', app.permission.check('staff:login'), async (req, res) => {

        const id = parseInt(req.params.id);
        app.model.hcthPhanHoi.getAllFrom(id, 'NHIEM_VU', (error, items) => {
            res.send({ error, items: items.rows });
        });

    });

    // cán bộ nhận nhiệm vụ API
    const isCanBoNhanExists = (canBoNhan, id) => new Promise((resolve, reject) => {
        app.model.hcthCanBoNhan.get({ statement: 'CAN_BO_NHAN in (:shccs) and LOAI = :loai and ma = :ma', parameter: { shccs: canBoNhan, loai: 'NHIEM_VU', ma: id } }, (error, item) => {
            if (error) {
                reject(error);
            }
            else if (item) {
                resolve(item);
            }
            else resolve(false);
        });
    });


    app.post('/api/hcth/nhiem-vu/can-bo-nhan', app.permission.orCheck('manager:write', 'rectors:login', 'staff:login'), async (req, res) => {
        const { ma, canBoNhan, vaiTro } = req.body;
        try {
            const canBo = await isCanBoNhanExists(canBoNhan, ma);
            if (canBo) {
                res.send({ error: `Cán bộ (${canBo.canBoNhan}) đã tồn tại` });
            } else {
                const canBos = await createCanBoNhan(canBoNhan, req.session.user?.shcc, vaiTro, ma);
                res.send({ error: null, items: canBos });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/hcth/nhiem-vu/can-bo-nhan', app.permission.check('staff:login'), async (req, res) => {
        const { id, vaiTroMoi } = req.body;
        app.model.hcthCanBoNhan.update({ id }, { vaiTro: vaiTroMoi }, (error, item) => {
            res.send({ error, item });
        });
    });


    app.delete('/api/hcth/nhiem-vu/can-bo-nhan', app.permission.check('staff:login'), (req, res) => {
        const { id } = req.body;
        app.model.hcthCanBoNhan.delete({ id }, (error, item) => {
            res.send({ error, item });
        });
    });


    app.post('/api/hcth/nhiem-vu/can-bo-nhan/list', app.permission.check('staff:login'), async (req, res) => {
        const { ids, ma } = req.body;
        app.model.hcthCanBoNhan.getAllFrom(ma || null, 'NHIEM_VU', (ids || []).toString(), (error, result) => {

            res.send({ error: error, items: result?.rows });
        });
    });


    // liên kết API
    const createListLienKet = (lienKet, loaiLienKet, ma, loai) => {
        const promises = lienKet.map(key => new Promise((resolve, reject) => app.model.hcthLienKet.create({
            keyA: ma, loaiA: loai,
            loaiB: loaiLienKet, keyB: key
        }, (error, item) => handleResult(resolve, reject, item, error))
        ));
        return Promise.all(promises);
    };

    app.post('/api/hcth/nhiem-vu/lien-ket', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { id, lienKet, loaiLienKet } = req.body;
            await createListLienKet(lienKet, loaiLienKet, id, 'NHIEM_VU');
            res.send({ error: null });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/hcth/nhiem-vu/lien-ket/:id', app.permission.check('staff:login'), async (req, res) => {
        const id = parseInt(req.params.id);
        app.model.hcthLienKet.getAllFrom(id, 'NHIEM_VU', null, null, (error, result) => {
            res.send({ error: error, items: result?.rows });
        });
    });

    app.delete('/api/hcth/nhiem-vu/lien-ket', app.permission.check('staff:login'), (req, res) => {
        const { id } = req.body;
        app.model.hcthLienKet.delete({ id }, (error) => {
            res.send({ error });
        });
    });

    app.put('/api/hcth/nhiem-vu/delete-file', app.permission.check('staff:login'), (req, res) => {
        const
            id = req.body.id,
            fileId = req.body.fileId,
            file = req.body.file,
            nhiemVu = id || null,
            filePath = app.assetPath + '/nhiemVu/' + (id ? id + '/' : 'new/') + file;
        app.model.hcthFile.delete({ id: fileId, ma: nhiemVu, loai: 'NHIEM_VU' }, (error) => {
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
};
