module.exports = app => {
    const { action } = require('../constant');
    const userMenu = {
        parentMenu: app.parentMenu.user,
        menus: {
            1056: { title: 'Công văn trình ký', link: '/user/cong-van-trinh-ky', icon: 'fa-pencil-square-o', backgroundColor: '#00aa00', groupIndex: 5 },
        },
    };
    app.permission.add({ name: 'staff:login', menu: userMenu });

    app.get('/user/cong-van-trinh-ky', app.permission.check('staff:login'), app.templates.admin);
    app.get('/user/cong-van-trinh-ky/:id', app.permission.check('staff:login'), app.templates.admin);



    app.post('/api/hcth/cong-van-trinh-ky', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { tenFile, congVan, fileCongVan, canBoKy = [] } = req.body;

            const congVanTrinhKy = await app.model.hcthCongVanTrinhKy.get({ fileCongVan });

            if (congVanTrinhKy) {
                res.send({ error: 'Văn bản này đã được gửi yêu cầu kí. ' });
            } else {
                const congVanTrinhKy = await app.model.hcthCongVanTrinhKy.create({
                    nguoiTao: req.session.user?.shcc,
                    fileCongVan,
                    congVan,
                    thoiGian: new Date().getTime(),
                });
                await app.model.hcthCanBoKy.createFromList(canBoKy.map(shcc => ({
                    nguoiTao: req.session.user?.shcc,
                    nguoiKy: shcc,
                    congVanTrinhKy: congVanTrinhKy.id,
                    trangThai: 'CHO_KY'
                })));

                await app.model.hcthHistory.create({
                    loai: 'DI',
                    key: congVan,
                    shcc: req.session.user?.staff?.shcc || '',
                    hanhDong: action.ADD_SIGN_REQUEST,
                    ghiChu: JSON.stringify({
                        tenFile: tenFile
                    }),
                    thoiGian: Date.now()
                });
                res.send({ error: null });
            }
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/cong-van-trinh-ky/search/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';

        const user = req.session.user;
        const permissions = user.permissions;
        let shccCanBo = user?.shcc || '';

        if (permissions.includes('rectors:login') || (!user.isStaff && !user.isStudent)) {
            shccCanBo = '';
        }

        const data = { shccCanBo };
        let filterParam;
        try {
            filterParam = JSON.stringify(data);
        } catch (error) {
            filterParam = '{}';
        }

        app.model.hcthCongVanTrinhKy.searchPage(pageNumber, pageSize, shccCanBo, filterParam, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/hcth/cong-van-trinh-ky/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            const id = req.params.id;
            const congVanTrinhKy = await app.model.hcthCongVanTrinhKy.get({ id });
            const files = await app.model.hcthFile.get({ id: congVanTrinhKy.fileCongVan });
            let [congVanKy, canBoKy] = await Promise.all([
                app.model.hcthCongVanDi.get({ id: files.ma }),
                app.model.hcthCanBoKy.getList(congVanTrinhKy.id)
            ]);

            canBoKy = canBoKy.rows || [];
            res.send({
                item: {
                    ...congVanTrinhKy,
                    congVanKy,
                    canBoKy,
                    fileKy: [files] || []
                }
            });
        } catch (error) {
            req.send({ error });
        }
    });

    app.put('/api/hcth/cong-van-trinh-ky', app.permission.check('staff:login'), async (req, res) => {
        try {
            const id = parseInt(req.body.id);

            const { tenFile, canBoKy = [], congVanId } = req.body.changes;

            const canBoKyAfter = canBoKy;

            const canBoKyBeforeLst = await app.model.hcthCanBoKy.getAll({ congVanTrinhKy: id });

            const canBoKyBefore = canBoKyBeforeLst.map(canBo => canBo.nguoiKy);

            const newCanBoKy = canBoKyAfter.filter(canBo => !canBoKyBefore.includes(canBo));

            const delCanBoKy = canBoKyBefore.filter(canBo => !canBoKyAfter.includes(canBo));

            delCanBoKy.length > 0 && await Promise.all(delCanBoKy.map(async (shcc) => {
                await app.model.hcthCanBoKy.delete({ nguoiKy: shcc, nguoiTao: req.session.user?.shcc, congVanTrinhKy: id });
            }));

            newCanBoKy.length > 0 && await app.model.hcthCanBoKy.createFromList(newCanBoKy.map(shcc => ({
                nguoiTao: req.session.user?.shcc,
                nguoiKy: shcc,
                congVanTrinhKy: id
            })));


            await app.model.hcthHistory.create({
                loai: 'DI',
                key: congVanId,
                shcc: req.session.user?.staff?.shcc || '',
                hanhDong: action.UPDATE_SIGN_REQUEST,
                ghiChu: JSON.stringify({
                    tenFile: tenFile
                }),
                thoiGian: Date.now()
            });

            res.send({ error: null });

        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/hcth/cong-van-trinh-ky', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { id, congVanId, tenFile } = req.body;

            await app.model.hcthCongVanTrinhKy.delete({ id });

            await app.model.hcthCanBoKy.delete({ congVanTrinhKy: id });

            await app.model.hcthHistory.create({
                loai: 'DI',
                key: congVanId,
                shcc: req.session.user?.staff?.shcc || '',
                hanhDong: action.REMOVE_SIGN_REQUEST,
                ghiChu: JSON.stringify({
                    tenFile: tenFile
                }),
                thoiGian: Date.now()
            });

            res.send({ error: null });
        } catch (error) {
            res.send({ error });
        }
    });
};