module.exports = app => {
    const staffMenu = {
        parentMenu: app.parentMenu.user,
        menus: {
            1058: { title: 'Hồ sơ', link: '/user/ho-so', icon: 'fa-file-text', backgroundColor: '#0B86AA', groupIndex: 5 },
        },
    };

    app.permission.add({ name: 'staff:login', menu: staffMenu });

    app.get('/user/ho-so', app.permission.check('staff:login'), app.templates.admin);
    app.get('/user/ho-so/:id', app.permission.check('staff:login'), app.templates.admin);

    // APIs ----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/hcth/ho-so/search/page/:pageNumber/:pageSize', app.permission.check('staff:login'), async (req, res) => {
        try {
            const pageNumber1 = parseInt(req.params.pageNumber),
                pageSize1 = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';

            const page = await app.model.hcthHoSo.searchPage(pageNumber1, pageSize1, searchTerm);

            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;

            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });

        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/hcth/ho-so', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { tieuDe, vanBan = [] } = req.body.data;

            const hoSo = await app.model.hcthHoSo.create({
                nguoiTao: req.session.user?.shcc,
                tieuDe: tieuDe,
                ngayTao: new Date().getTime(),
            });

            await app.model.hcthLienKet.createFromList(vanBan.map(item => ({
                loaiA: 'HO_SO', keyA: hoSo.id,
                loaiB: 'VAN_BAN_DI', keyB: item
            })));

            res.send({ error: null });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/ho-so/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            const id = req.params.id;

            const hoSo = await app.model.hcthHoSo.get({ id });

            const vanBan = await app.model.hcthLienKet.getAllFrom(id, 'HO_SO', null, null);

            res.send({
                item: {
                    ...hoSo,
                    vanBan: vanBan?.rows || [],
                }
            });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/hcth/ho-so/van-ban', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { vanBanId } = req.body;
            await app.model.hcthLienKet.delete({ id: vanBanId });
            res.send({ error: null });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/hcth/ho-so/add', app.permission.check('staff:login'), async (req, res) => {
        try {
            const id = parseInt(req.body.id);

            const { vanBan } = req.body.changes;

            const checkVanBan = await app.model.hcthLienKet.get({ loaiA: 'HO_SO', keyA: id, loaiB: 'VAN_BAN_DI', keyB: vanBan });

            if (checkVanBan) {
                throw { message: 'Văn bản đã được thêm vào hồ sơ này!' };
            } else {
                await app.model.hcthLienKet.create({ loaiA: 'HO_SO', keyA: id, loaiB: 'VAN_BAN_DI', keyB: vanBan });
            }
            res.send({ error: null });

        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/hcth/ho-so/add-van-ban', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { id, vanBan } = req.body;
            await app.model.hcthLienKet.createFromList(vanBan.map(item => ({
                loaiA: 'HO_SO', keyA: id,
                loaiB: 'VAN_BAN_DI', keyB: item
            })));

            res.send({ error: null });
        } catch (error) {
            res.send({ error });
        }
    });


    app.get('/api/hcth/ho-so/van-ban/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const vanBan = await app.model.hcthLienKet.getAllFrom(id, 'HO_SO', null, null);

            res.send({
                item: vanBan?.rows || [],
            });

        } catch (error) {
            res.send({ error });
        }
    });
};