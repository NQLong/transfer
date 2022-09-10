module.exports = app => {
    // const FILE_TYPE = 'DI';

    const LOAI_VAN_BAN = 'DI';

    const { CONG_VAN_DI_TYPE, action, vanBanDi, MA_HCTH } = require('../constant');

    const staffMenu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            502: { title: 'Văn bản đi', link: '/user/hcth/van-ban-di', icon: 'fa-caret-square-o-right', backgroundColor: '#0B86AA' },
        },
    };

    const staffPermission = 'donViCongVanDi:edit',
        managerPermission = 'donViCongVanDi:manage';

    /**
     *  permission list*/
    app.permission.add(
        { name: 'hcthCongVanDi:read' },
        { name: 'hcthCongVanDi:write' },
        { name: 'hcthCongVanDi:delete' },
        { name: 'hcthCongVanDi:manage' },
        { name: managerPermission },
        { name: 'hcth:login', menu: staffMenu },
        // { name: 'staff:login', menu },
        { name: 'hcth:manage' }
    );

    app.permissionHooks.add('staff', 'addRolesHcthVanBanDi', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == MA_HCTH) {
            app.permissionHooks.pushUserPermission(user, 'dmm', 'hcthCongVanDi:read', 'hcthCongVanDi:write', 'hcthCongVanDi:delete', 'dmDonViGuiCv:read', 'dmDonViGuiCv:write');
            resolve();
        } else resolve();
    }));


    app.get('/user/van-ban-di', app.permission.orCheck('staff:login', 'developer:login'), app.templates.admin);
    app.get('/user/van-ban-di/:id', app.permission.orCheck('staff:login', 'developer:login'), app.templates.admin);
    app.get('/user/hcth/van-ban-di', app.permission.check('hcthCongVanDi:read'), app.templates.admin);
    app.get('/user/hcth/van-ban-di/:id', app.permission.check('hcthCongVanDi:read'), app.templates.admin);

    const getDonViQuanLy = (req) => req.session?.user?.staff?.donViQuanLy?.map(item => item.maDonVi) || [];
    const getDonVi = (req) => req.session?.user?.staff?.maDonVi;
    const getShcc = (req) => req.session.user?.shcc;
    const getCurrentPermissions = (req) => (req.session && req.session.user && req.session.user.permissions) || [];
    const getUserPermission = (req, prefix, listPermissions = ['read', 'write', 'delete']) => {
        const permission = {}, currentPermissions = getCurrentPermissions(req);
        listPermissions.forEach(item => permission[item] = currentPermissions.includes(`${prefix}:${item}`));
        return permission;
    };
    const getInstance = async (id) => {
        const instance = await app.model.hcthCongVanDi.get({ id });
        if (!instance) throw 'Văn bản đi không tồn tại';
        return instance;
    };

    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/hcth/van-ban-di/search/page/:pageNumber/:pageSize', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const
                // pageNumber = parseInt(req.params.pageNumber),
                // pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                permissions = req.session.user.permissions;
            let { donViGui, donViNhan, canBoNhan, loaiCongVan, loaiVanBan, donViNhanNgoai, status, timeType, fromTime, toTime, congVanYear } = req.query.filter || {};

            //status scheme
            let scope = { SELF: [], DEPARTMENT: [], GLOBAL: [], };

            scope.SELF = [vanBanDi.trangThai.DA_PHAT_HANH.id];

            if (permissions.includes(managerPermission))
                scope.DEPARTMENT = Object.values(vanBanDi.trangThai).filter(item => item.id != vanBanDi.trangThai.NHAP.id).map(item => item.id);
            if (permissions.includes('rectors:login') || permissions.includes('hcthCongVanDi:read'))
                scope.GLOBAL = Object.values(vanBanDi.trangThai).filter(item => item.id != vanBanDi.trangThai.NHAP.id).map(item => item.id);
            if (permissions.includes('developer:login'))
                scope.GLOBAL = Object.values(vanBanDi.trangThai).map(item => item.id);
            console.log(scope);
            Object.keys(scope).forEach(key => scope[key] = scope[key].toString());

            const userDepartments = new Set(getDonViQuanLy(req));
            console.log(userDepartments);
            if (getDonVi(req))
                userDepartments.add(getDonVi(req));

            const userShcc = getShcc(req);

            const filterData = { userShcc, userDepartments: [...userDepartments].toString(), donViGui, donViNhan, canBoNhan, loaiCongVan, loaiVanBan, donViNhanNgoai, status, timeType, fromTime, toTime };

            if (congVanYear && Number(congVanYear) > 1900) {
                filterData.timeType = 1;
                filterData.fromTime = new Date(`${congVanYear}-01-01`).getTime();
                filterData.toTime = new Date(`${Number(congVanYear) + 1}-01-01`).getTime();
            }
            // console.log(scope);
            console.log(filterData);
            const page = await app.model.hcthCongVanDi.searchPageAlternate(parseInt(req.params.pageNumber), parseInt(req.params.pageSize), '', app.utils.stringify(scope), app.utils.stringify(filterData));

            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });

        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });


    app.post('/api/hcth/van-ban-di', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { files = [], canBoNhan = [], donViNhan = [], donViNhanNgoai = [], banLuu = [], ...data } = req.body.data;
            const instance = await app.model.hcthCongVanDi.create({ ...data, nguoiTao: req.session.user.shcc, ngayTao: new Date().getTime(), trangThai: vanBanDi.trangThai.NHAP.id });
            const id = instance.id;
            try {

                //create vanBanDi instance

                //create don vi nhan from list
                await app.model.hcthDonViNhan.createFromList(donViNhan, instance.id, LOAI_VAN_BAN);

                //create don vi nhan ngoai from list
                await app.model.hcthDonViNhan.createFromList(donViNhanNgoai, instance.id, LOAI_VAN_BAN, { donViNhanNgoai: 1, });

                // create ban luu
                await app.model.hcthBanLuu.createFromList(banLuu, instance.id, LOAI_VAN_BAN,);

                //create can bo nhan from list
                await app.model.hcthCanBoNhan.listCreate(canBoNhan.map(shcc => ({ canBoNhan: shcc, ma: instance.id, loai: LOAI_VAN_BAN })));

                //handle list file
                app.fs.createFolder(app.path.join(app.assetPath, 'congVanDi', `${instance.id}`));
                await Promise.all(files.map(item => createFileVanBanDi(item, instance.id, req.session.user.shcc)));

                //create history
                await app.model.hcthHistory.create({ loai: 'DI', key: instance.id, shcc: req.session?.user?.shcc, hanhDong: 'CREATE', thoiGian: instance.ngayTao });
                res.send({});
            } catch (error) {
                console.error(error);
                deleteCongVan(id, () => res.send({ error }));
                // res.send({ error });
            }
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });


    app.put('/api/hcth/van-ban-di/ready/:id', app.permission.orCheck(staffPermission), async (req, res) => {
        try {
            const instance = await getInstance(req.params.id);

            //TODO: check permission in api level
            const currentStatus = instance.trangThai;
            let nextStatus;
            switch (currentStatus) {
                case vanBanDi.trangThai.NHAP.id:
                case vanBanDi.trangThai.TRA_LAI_NOI_DUNG.id:
                    nextStatus = vanBanDi.trangThai.KIEM_TRA_NOI_DUNG.id;
                    break;
                case vanBanDi.trangThai.TRA_LAI_THE_THUC.id:
                    nextStatus = vanBanDi.trangThai.KIEM_TRA_THE_THUC.id;
                    break;
                case vanBanDi.trangThai.TRA_LAI.id:
                    nextStatus = vanBanDi.trangThai.KIEM_TRA_NOI_DUNG.id;


                    break;
                default:
                    throw 'Trạng thái văn bản không hợp lệ';
            }

            //TODO: check status change condition
            const files = await getFiles(instance.id);
            files.forEach(vanBanDiFile => {
                if (!vanBanDiFile.phuLuc) {
                    const configs = vanBanDiFile.config;
                    configs.forEach(config => {
                        if ([vanBanDi.signType.NOI_DUNG.id, vanBanDi.signType.THE_THUC.id, vanBanDi.signType.KY_PHAT_HANH.id,].includes(config.signType)) {
                            if (!config.shcc) throw `${vanBanDi.signType[config.signType].text} ở tệp tin ${vanBanDiFile.file.ten} chưa được cấu hình cán bộ ký.`;
                        }
                    });
                }
            });

            await app.model.hcthCongVanDi.update({ id: instance.id }, { trangThai: nextStatus });
            await app.model.hcthHistory.create({ loai: 'DI', key: instance.id, shcc: req.session?.user?.shcc, hanhDong: action.UPDATE_STATUS, thoiGian: new Date().getTime() });
            //TODO: reuse send notification
            res.send({});

        } catch (error) {
            console.error(error);
            console.log(error.message);
            res.send({ error });
        }
    });


    /**
     * 
     * Handle files when creating van ban di
     * @param file: object {fileName, originalFileName, phuLuc}
     * @param vanBanDi: id van ban di moi tao
     * @param creator: shcc cua can bo tai len file
     * 
     */
    const createFileVanBanDi = async (file, vanBanDi, creator) => {
        let instance = await app.model.hcthVanBanDiFile.create({ vanBanDi, phuLuc: file.phuLuc }),
            currentPath = app.path.join(app.assetPath, `congVanDi/new/${file.fileName}`),
            fileStat = await app.fs.statSync(currentPath);

        app.fs.renameSync(currentPath, app.path.join(app.assetPath, `congVanDi/${vanBanDi}/${file.fileName}`));

        const newFile = await app.model.hcthFile.create({ ten: file.originalFilename, nguoiTao: creator, tenFile: file.fileName, kichThuoc: Math.round(fileStat.size / 1024 * 100) / 100, loai: 'FILE_VBD', ma: instance.id, ngayTao: new Date().getTime(), });

        instance = await app.model.hcthVanBanDiFile.update({ id: instance.id }, { fileId: newFile.id });

        return instance;
    };


    const deleteCongVan = async (id, done) => {
        try {
            await app.model.hcthVanBanDiFile.delete({ ma: id });
            await app.model.hcthCongVanDi.delete({ id });
            app.fs.deleteFolder(app.assetPath + '/congVanDi/' + id);
            done && done();
        } catch (error) {
            done && done(error);
        }
    };

    app.get('/api/hcth/van-ban-di/file/:id', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const { id } = req.params;
            const instance = await app.model.hcthVanBanDiFile.get({ id });
            const file = await app.model.hcthFile.get({ id: instance.fileId });

            if (!instance || !file) return res.status(404).send({ error: 'Tệp tin không tồn tại' });

            const buffer = app.fs.readFileSync(app.path.join(app.assetPath, `congVanDi/${instance.vanBanDi}`, file.tenFile), 'base64');
            // res.writeHead(200, [['Content-Type', 'application/pdf'], ['Content-Disposition', 'attachment;filename=' + `${file.ten}`]]);
            res.send({ data: buffer });
        } catch (error) {
            console.error(error);
            res.status(500).send(error);
        }
    });

    app.put('/api/hcth/van-ban-di/:id', app.permission.orCheck(staffPermission, 'hcthCongVanDi:read', 'developer:login'), async (req, res) => {
        try {
            //NOTE this api will not accept modification of status
            // eslint-disable-next-line no-unused-vars            
            const { canBoNhan = [], donViNhan = [], donViNhanNgoai = [], banLuu = [], trangThai, ...data } = req.body;
            const id = req.params.id;
            let instance = await getInstance(id);

            //TODO: check suitable status to update if not throw error

            instance = await app.model.hcthCongVanDi.update({ id }, data);

            //update don vi nhan
            // NOTE: this is just a quick solution
            //TODO: delete only deleted items and create only new item
            await app.model.hcthDonViNhan.delete({ ma: id, loai: LOAI_VAN_BAN });
            await app.model.hcthCanBoNhan.delete({ ma: id, loai: LOAI_VAN_BAN });
            await app.model.hcthBanLuu.delete({ ma: id, loai: LOAI_VAN_BAN });

            //create don vi nhan ngoai from list
            await app.model.hcthDonViNhan.createFromList(donViNhanNgoai, instance.id, LOAI_VAN_BAN, { donViNhanNgoai: 1, });
            await app.model.hcthDonViNhan.createFromList(donViNhan, instance.id, LOAI_VAN_BAN, { donViNhanNgoai: 0, });

            // create ban luu
            await app.model.hcthBanLuu.createFromList(banLuu, instance.id, LOAI_VAN_BAN,);

            //create can bo nhan from list
            await app.model.hcthCanBoNhan.listCreate(canBoNhan.map(shcc => ({ canBoNhan: shcc, ma: instance.id, loai: LOAI_VAN_BAN })));
            await app.model.hcthHistory.create({ key: id, loai: LOAI_VAN_BAN, hanhDong: action.UPDATE, thoiGian: new Date().getTime(), shcc: req.session?.user?.shcc });
            res.send({});
        } catch (error) {
            res.send({ error });
        }
    });


    app.delete('/api/hcth/van-ban-di', app.permission.check('hcthCongVanDi:delete'), (req, res) => {
        deleteCongVan(req.body.id, ({ error }) => res.send({ error }));
    });


    app.put('/api/hcth/van-ban-di/content/approve/:id', app.permission.check(managerPermission), async (req, res) => {
        try {
            const id = req.params.id;
            const instance = await getInstance(id);

            if (instance.trangThai != vanBanDi.trangThai.KIEM_TRA_NOI_DUNG.id)
                throw 'Trạng thái văn bản không hợp lệ';

            //TODO: check don vi quan ly
            if (instance.loaiCongVan == vanBanDi.loaiCongVan.TRUONG)
                await app.model.hcthCongVanDi.update({ id: instance.id }, { trangThai: vanBanDi.trangThai.KIEM_TRA_THE_THUC.id });
            else
                await app.model.hcthCongVanDi.update({ id: instance.id }, { trangThai: vanBanDi.trangThai.KY_PHAT_HANH.id });
            await app.model.hcthHistory.create({ key: id, loai: LOAI_VAN_BAN, hanhDong: action.UPDATE_STATUS, thoiGian: new Date().getTime(), shcc: req.session?.user?.shcc });

            res.send({});

        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/van-ban-di/formality/approve/:id', app.permission.check('hcthCongVanDi:manage'), async (req, res) => {
        try {
            const id = req.params.id;
            const instance = await getInstance(id);

            if (instance.trangThai != vanBanDi.trangThai.KIEM_TRA_THE_THUC.id)
                throw 'Trạng thái văn bản không hợp lệ';

            await app.model.hcthCongVanDi.update({ id: instance.id }, { trangThai: vanBanDi.trangThai.KY_THE_THUC.id });
            await app.model.hcthHistory.create({ key: id, loai: LOAI_VAN_BAN, hanhDong: action.UPDATE_STATUS, thoiGian: new Date().getTime(), shcc: req.session?.user?.shcc });

            res.send({});

        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/van-ban-di/return/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            const id = req.params.id;
            const instance = await getInstance(id);
            const current = instance.trangThai;
            let nextStatus;
            //TODO: check permission when return
            switch (current) {
                case vanBanDi.trangThai.KIEM_TRA_NOI_DUNG.id:
                    nextStatus = vanBanDi.trangThai.TRA_LAI_NOI_DUNG.id;
                    break;
                case vanBanDi.trangThai.KIEM_TRA_THE_THUC.id:
                    nextStatus = vanBanDi.trangThai.TRA_LAI_THE_THUC.id; break;
                case vanBanDi.trangThai.KY_PHAT_HANH.id:
                    nextStatus = vanBanDi.trangThai.TRA_LAI.id; break;
                default:
                    throw 'Trạng thái văn bản không hợp lệ';
            }
            await app.model.hcthCongVanDi.update({ id: instance.id }, { trangThai: nextStatus });
            await app.model.hcthHistory.create({ key: id, loai: LOAI_VAN_BAN, hanhDong: action.RETURN, thoiGian: new Date().getTime(), shcc: req.session?.user?.shcc });
            res.send({});
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
    // Upload API  -----------------------------------------------------------------------------------------------
    app.fs.createFolder(app.path.join(app.assetPath, '/congVanDi'));

    app.uploadHooks.add('hcthVanBanDiFileV2', (req, fields, files, params, done) =>
        app.permission.has(req, () => hcthVanBanDiFile(req, fields, files, params, done), done, 'staff:login'));

    const hcthVanBanDiFile = async (req, fields, files, params, done) => {
        try {
            const type = fields.userData?.length && fields.userData[0],
                data = fields.data && fields.data[0] && app.utils.parse(fields.data[0]);
            console.log({ data });
            if (type == 'hcthVanBanDiFileV2') {
                const
                    file = files.hcthVanBanDiFileV2[0],
                    { path, originalFilename } = file,
                    validFileType = ['.pdf'], //TODO: allow doc and docx
                    fileName = path.replace(/^.*[\\\/]/, ''),
                    extName = app.path.extname(fileName);
                if (!validFileType.includes(extName))
                    return done && done({ error: 'Định dạng file không hợp lệ' });
                if (!data.id) {
                    app.fs.renameSync(path, app.path.join(app.assetPath, 'congVanDi/new', fileName));
                    done && done({
                        fileName,
                        originalFilename,
                        phuLuc: data.phuLuc,
                        file: { ten: originalFilename, tenFile: fileName },
                    });
                }
                else {
                    //check if van ban di to add file existed
                    const vbd = await getInstance(data.id);
                    //get file stat
                    const fileStat = await app.fs.statSync(path);
                    //move file to van ban asset folder
                    app.fs.renameSync(path, app.path.join(app.assetPath, `congVanDi/${data.id}`, fileName));
                    // create van ban di file instance
                    let instance = await app.model.hcthVanBanDiFile.create({ vanBanDi: vbd.id, phuLuc: data.phuLuc });
                    // create physic file information
                    const newFile = await app.model.hcthFile.create({ ten: file.originalFilename, nguoiTao: req.session.user.shcc, tenFile: fileName, kichThuoc: Math.round((fileStat.size / 1024) * 100) / 100, loai: 'FILE_VBD', ma: instance.id, thoiGian: new Date().getTime(), });
                    // update the latest physic file of van ban di file
                    instance = await app.model.hcthVanBanDiFile.update({ id: instance.id }, { fileId: newFile.id });
                    done && done({
                        ...instance,
                        file: newFile
                    });
                }
            }

        } catch (error) {
            console.error(error);
            done && done({ error });
        }
    };

    app.uploadHooks.add('hcthKyDienTu', (req, fields, files, params, done) =>
        app.permission.has(req, () => hcthKyDienTu(req, fields, files, params, done), done, 'staff:login'));

    const hcthKyDienTu = async (req, fields, files, params, done) => {
        try {
            if (
                fields.userData &&
                fields.userData[0] &&
                fields.userData[0].startsWith('hcthKyDienTu') &&
                files.file &&
                files.file.length > 0) {
                const
                    srcPath = files.file[0].path,
                    validUploadFileType = ['.xls', '.xlsx', '.doc', '.docx', '.pdf', '.png', '.jpg', '.jpeg'],
                    baseNamePath = app.path.extname(srcPath),
                    originalFilename = files.file[0].originalFilename,
                    randomFilename = srcPath.substring(srcPath.lastIndexOf('/') + 1);

                // eslint-disable-next-line no-unused-vars
                const [rest, congVanId, fileId, signAt] = fields.userData[0].split(':');

                console.log(congVanId, fileId, signAt);

                if (!validUploadFileType.includes(baseNamePath.toLowerCase())) {
                    done({ error: 'Định dạng tập tin không hợp lệ!' });
                    app.fs.deleteFile(srcPath);
                } else {
                    const destPath = app.path.join(app.assetPath, 'congVanDi', congVanId);
                    await app.fs.createFolder(
                        destPath
                    );

                    app.fs.renameSync(srcPath, destPath + `/${randomFilename}`);

                    const item = await app.model.hcthFile.create({ ten: originalFilename, thoiGian: new Date().getTime(), loai: 'FILE_VBD', ma: fileId, tenFile: randomFilename });

                    await app.model.hcthSigningConfig.update({ vbdfId: fileId, shcc: req.session.user.shcc }, { signAt, status: 'DA_KY' });
                    // await ap
                    // await app.model.hcthCanBoKy.update({ nguoiKy: req.session.user.shcc, congVanTrinhKy: fileId }, { trangThai: 'DA_KY' });

                    done && done({ error: null, item });
                }
            }
        } catch (error) {
            console.log(error);
            done && done({ error });
        }
    };



    app.get('/api/hcth/van-ban-di/file-list/:id', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const instance = await getInstance(req.params.id);
            //TODO: check get permission
            res.send({ files: await getFiles(instance.id) });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    //TODO: delelte file

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
            else if (donViGui == maDonVi && (permissions.includes(managerPermission) || maDonViQuanLy.find(item => donViGui.includes(item.maDonVi)) || permissions.includes(staffPermission))) {
                return true;
            } else {
                let maDonViNhan = donViNhan.map((item) => item.donViNhan);
                return maDonViQuanLy.find(item => maDonViNhan.includes(item.maDonVi)) || (permissions.includes(managerPermission) && maDonViNhan.includes(Number(req.session.user.staff?.maDonVi)));
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


    app.get('/api/hcth/van-ban-di/:id', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw { status: 400, message: 'Invalid id' };
            }

            const congVan = await getInstance(id);

            // const donViNhan = await app.model.hcthDonViNhan.getAll({ ma: id, loai: 'DI' }, 'id, donViNhan, donViNhanNgoai', 'id');
            let donViNhan = await app.model.hcthDonViNhan.getAll({ ma: id, loai: LOAI_VAN_BAN, donViNhanNgoai: 0 }, 'donViNhan', 'id');
            let donViNhanNgoai = await app.model.hcthDonViNhan.getAll({ ma: id, loai: LOAI_VAN_BAN, donViNhanNgoai: 1 }, 'donViNhan', 'id');
            let canBoNhan = await app.model.hcthCanBoNhan.getAll({ ma: id, loai: LOAI_VAN_BAN });
            const banLuu = await app.model.hcthBanLuu.getAll({ ma: id, loai: LOAI_VAN_BAN }, 'donVi', 'id');
            if (!(req.session.user.permissions.includes('hcthCongVanDi:read') || await isRelated(congVan, donViNhan, req))) {
                throw { status: 401, message: 'permission denied' };
            }
            //TODO: use new state system
            else if (congVan.trangThai == vanBanDi.trangThai.DA_PHAT_HANH.id && req.session.user?.shcc) {
                await viewCongVan(id, req.session.user.shcc, congVan.nguoiTao);
            }
            // let files = await app.model.hcthFile.getAllFrom(id, 'DI');

            const files = await getFiles(id);

            const phanHoi = await app.model.hcthPhanHoi.getAllFrom(id, 'DI');
            const history = await app.model.hcthHistory.getAllFrom(id, 'DI', req.query.historySortType);

            let danhSachCanBoNhan = [],
                danhSachDonViNhan = [],
                danhSachDonViNhanNgoai = [];
            donViNhan = donViNhan.map((item) => item.donViNhan);
            donViNhanNgoai = donViNhanNgoai.map((item) => item.donViNhan);
            canBoNhan = canBoNhan.map((item) => item.canBoNhan);
            if (canBoNhan.length) {
                danhSachCanBoNhan = await app.model.canBo.getAll({
                    statement: 'SHCC IN (:danhSach)',
                    parameter: { danhSach: canBoNhan }
                }, 'shcc,ten,ho,email', 'ten');
            }
            console.log(donViNhan, donViNhanNgoai, canBoNhan);

            if (donViNhan?.length) {
                danhSachDonViNhan = await app.model.dmDonVi.getAll({
                    statement: `MA IN (${donViNhan.toString()})`,
                    parameter: {},
                }, 'ma, ten', 'ma');
            }

            if (donViNhanNgoai?.length) {
                danhSachDonViNhanNgoai = await app.model.dmDonViGuiCv.getAll({
                    statement: `ID IN (${donViNhanNgoai.toString()})`,
                    parameter: {},
                }, 'id, ten', 'id');
            }

            res.send({
                item: {
                    ...congVan,
                    donViNhan, donViNhanNgoai, canBoNhan, files,
                    danhSachCanBoNhan, danhSachDonViNhan, danhSachDonViNhanNgoai,
                    banLuu: banLuu.map(item => item.donVi),
                    phanHoi: phanHoi?.rows || [],
                    history: history?.rows || [],
                },
            });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });


    const getFiles = async (id) => {
        /**
         * TODO:
         *  there aren't many files in each van ban di, but we should use function in db just in case;
         */
        const
            files = await app.model.hcthVanBanDiFile.getAll({ vanBanDi: id }),
            result = files.map(async (item) => {
                const config = await app.model.hcthSigningConfig.getList(item.id),
                    file = await app.model.hcthFile.get({ id: item.fileId });
                return {
                    ...item,
                    file, //physic file info 
                    config: config.rows || [] //all signing config of van ban di file(signType, singer, ...)
                };
            });
        return await Promise.all(result);
    };

    app.post('/api/hcth/van-ban-di/phan-hoi', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            //TODO: check permission
            const { noiDung, key } = req.body.data;

            const newPhanHoi = {
                canBoGui: req.session.user.shcc,
                noiDung,
                key: Number(key),
                ngayTao: new Date().getTime(),
                loai: LOAI_VAN_BAN
            };

            await app.model.hcthPhanHoi.create(newPhanHoi);
        } catch (error) { console.error(error); res.send({ error }); }
    });

    app.get('/api/hcth/van-ban-di/lich-su/:id', app.permission.orCheck('staff:login', 'developer:login'), (req, res) => {
        app.model.hcthHistory.getAllFrom(parseInt(req.params.id), 'DI', req.query.historySortType, (error, item) => res.send({ error, item: item?.rows || [] }));
    });



    // Phân quyền Quản lý Văn bản đi trong đơn vị
    const quanLyCongVanDiRole = 'quanLyCongVanDiPhong';

    app.assignRoleHooks.addRoles(quanLyCongVanDiRole, { id: managerPermission, text: 'Quản lý văn bản đi trong đơn vị' });

    app.assignRoleHooks.addHook(quanLyCongVanDiRole, async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole === quanLyCongVanDiRole && userPermissions.includes('manager:write')) {
            const assignRolesList = app.assignRoleHooks.get(quanLyCongVanDiRole).map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('staff', 'checkRoleQuanLyDonVi', (user, staff) => new Promise(resolve => {
        if (staff.donViQuanLy && staff.donViQuanLy.length > 0) {
            app.permissionHooks.pushUserPermission(user, staffPermission, managerPermission, 'dmDonVi:read', 'dmDonViGuiCv:read', 'dmDonViGuiCv:write');
        }
        resolve();
    }));

    app.permissionHooks.add('assignRole', 'checkRoleQuanLyCongVanDiTrongDonVi', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole === quanLyCongVanDiRole);
        inScopeRoles.forEach(role => {
            if (role.tenRole == managerPermission) {
                app.permissionHooks.pushUserPermission(user, managerPermission, 'dmDonVi:read', 'dmDonViGuiCv:read');
            }
        });
        resolve();
    }));

    // Phân quyền hành chính tổng hợp - Quản lí văn bản đi

    const hcthQuanLyCongVanDiRole = 'hcthQuanLyCongVanDi';
    app.assignRoleHooks.addRoles(hcthQuanLyCongVanDiRole, { id: 'hcthCongVanDi:manage', text: 'Hành chính - Tổng hợp: Quản lý văn bản đi' });

    app.assignRoleHooks.addHook(hcthQuanLyCongVanDiRole, async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole == hcthQuanLyCongVanDiRole && userPermissions.includes('manager:write')) {
            const assignRolesList = app.assignRoleHooks.get(hcthQuanLyCongVanDiRole).map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('assignRole', 'checkRoleHcthQuanLyCongVanDi', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == hcthQuanLyCongVanDiRole);
        inScopeRoles.forEach(role => {
            if (role.tenRole === 'hcthCongVanDi:manage') {
                app.permissionHooks.pushUserPermission(user, 'hcth:login', 'hcthCongVanDi:manage', 'dmDonVi:read', 'dmDonViGuiCv:read', 'dmDonViGuiCv:write', 'dmDonViGuiCv:delete', 'hcthCongVanDi:read', 'hcthCongVanDi:write', 'hcthCongVanDi:delete');
            }
        });
        resolve();
    }));

    // Phân quyền soạn thảo văn bản đi trong đơn vị
    const soanThaoCongVanDiRole = 'soanThaoCongVanDi';

    app.assignRoleHooks.addRoles(soanThaoCongVanDiRole, { id: staffPermission, text: 'Soạn thảo văn bản đi trong đơn vị' });

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
            if (role.tenRole === staffPermission) {
                app.permissionHooks.pushUserPermission(user, staffPermission, 'dmDonVi:read', 'dmDonViGuiCv:read');
            }
        });
        resolve();
    }));


    app.get('/api/hcth/van-ban-di/selector/page/:pageNumber/:pageSize', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                permissions = req.session.user.permissions;
            const { ids = '', excludeIds = '', hasIds = 0, fromTime = null, toTime = null } = req.query.filter;

            const userDepartments = new Set(getDonViQuanLy(req));
            if (getDonVi(req))
                userDepartments.add(getDonVi(req));

            const userShcc = getShcc(req);

            //status scheme
            let scope = { SELF: [], DEPARTMENT: [], GLOBAL: [], };

            scope.SELF = [vanBanDi.trangThai.DA_PHAT_HANH.id];

            if (permissions.includes(managerPermission))
                scope.DEPARTMENT = Object.values(vanBanDi.trangThai).filter(item => item.id != vanBanDi.trangThai.NHAP.id).map(item => item.id);
            if (permissions.includes('rectors:login') || permissions.includes('hcthCongVanDi:read'))
                scope.GLOBAL = Object.values(vanBanDi.trangThai).filter(item => item.id != vanBanDi.trangThai.NHAP.id).map(item => item.id);
            if (permissions.includes('developer:login'))
                scope.GLOBAL = Object.values(vanBanDi.trangThai).map(item => item.id);

            Object.keys(scope).forEach(key => scope[key] = scope[key].toString());

            const filterParam = {
                ids, excludeIds, hasIds, fromTime, toTime,
                userShcc, userDepartments: [...userDepartments].toString()
            };

            const page = await app.model.hcthCongVanDi.searchSelector(parseInt(req.params.pageNumber), parseInt(req.params.pageSize), app.utils.stringify(filterParam), app.utils.stringify(scope), searchTerm);

            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;

            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });


    app.get('/api/hcth/van-ban-di/phan-hoi/:id', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const phanHoi = await app.model.hcthPhanHoi.getAllFrom(id, CONG_VAN_DI_TYPE);
            res.send({ error: null, item: phanHoi?.rows || [] });
        } catch (error) {
            res.send({ error });
        }
    });


    app.get('/api/hcth/van-ban-di/download-excel/:filter', app.permission.orCheck('staff:login', 'developer:login'), (req, res) => {
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
        donViXem = donViXem.map(item => item.maDonVi).toString() || permissions.includes(managerPermission) && req.session?.user?.staff?.maDonVi || '';
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
                        header: 'Số văn bản', width: 20, style: {
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

    app.post('/api/hcth/van-ban-di/file/config', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { id, config } = req.body;
            console.log({ config });
            const vanBanDiFile = await app.model.hcthVanBanDiFile.get({ id });
            const promises = config.map(async item => {
                const { id: itemId, ...data } = item;
                if (!itemId)
                    return await app.model.hcthSigningConfig.create({ vbdfId: vanBanDiFile.id, ...data });
                else
                    return await app.model.hcthSigningConfig.update({ id: itemId }, data);
            });
            await Promise.all(promises);
            await app.model.hcthHistory.create({ key: vanBanDiFile.vanBanDi, loai: LOAI_VAN_BAN, thoiGian: new Date().getTime(), shcc: req.session?.user?.shcc, hanhDong: action.UPDATE_SIGNING_CONFIG, });
            res.send({});
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });


    app.put('/api/hcth/van-ban-di/return/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            const id = req.params.id;
            const instance = await getInstance(id);
            const lyDo = req.body.lyDo;
            if (!lyDo) throw 'Vui lòng nhập lý do trả lại';
            switch (instance.trangThai) {
                case vanBanDi.trangThai.KIEM_TRA_NOI_DUNG.id:
                    await onContentReturn(req, instance);
                    break;
                case vanBanDi.trangThai.KIEM_TRA_THE_THUC.id:
                    await onFormailtyReturn(req, instance);
                    break;
                case vanBanDi.trangThai.KY_PHAT_HANH.id:
                    await onPublishReturn(req, instance);
                    break;
                default:
                    throw 'Trạng thái văn bản không hợp lệ';
            }
            await app.model.hcthPhanHoi.create({ canBoGui: req.session.user.shcc, noiDung: lyDo, key: id, ngayTao: new Date().getTime(), loai: LOAI_VAN_BAN });
            //TODO: send creator notification
            await app.model.hcthHistory.create({ key: instance.id, loai: LOAI_VAN_BAN, hanhDong: action.RETURN, thoiGian: new Date().getTime(), shcc: req.session?.user?.shcc });
            res.send({});
        } catch (error) {
            console.error(error);
            res.send(error);
        }
    });

    const onContentReturn = async (req, instance) => {
        const permissions = getCurrentPermissions(req);
        const donViQuanLy = getDonViQuanLy(req);
        const donVi = getDonVi(req);
        if (donVi && permissions.includes(managerPermission)) donViQuanLy.push(donVi);
        if (!donViQuanLy.includes(instance.donViGui)) throw 'Bạn không đủ quyền để trả lại văn bản này.';
        await app.model.hcthCongVanDi.update({ id: instance.id }, { trangThai: vanBanDi.trangThai.TRA_LAI_NOI_DUNG.id });
    };
    const onFormailtyReturn = async (req, instance) => {
        const permissions = getCurrentPermissions(req);
        if (!permissions.includes('hcthCongVanDi:manage')) throw 'Bạn không đủ quyền để trả lại văn bản này.';
        await app.model.hcthCongVanDi.update({ id: instance.id }, { trangThai: vanBanDi.trangThai.TRA_LAI_THE_THUC.id });
    };
    const onPublishReturn = async (req, instance) => {
        const permissions = getCurrentPermissions(req);
        if (!permissions.includes('rectors:login')) throw 'Bạn không đủ quyền để trả lại văn bản này.';
        await app.model.hcthCongVanDi.update({ id: instance.id }, { trangThai: vanBanDi.trangThai.TRA_LAI.id });
    };
};
