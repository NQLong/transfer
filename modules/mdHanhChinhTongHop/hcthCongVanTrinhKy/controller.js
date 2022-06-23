module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            505: { title: 'Công văn trình ký', link: '/user/hcth/cong-van-trinh-ky', icon: 'fa-pencil-square-o', backgroundColor: '#00aa00' },
        },
    };
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
        console.log('hello');
        try {
            console.log('hello');
            const { fileCongVan, canBoKy = [] } = req.body;
            const congVanTrinhKy = await app.model.hcthCongVanTrinhKy.create({
                nguoiTao: req.session.user?.shcc,
                fileCongVan,
                thoiGian: new Date().getTime(),
            });
            await app.model.hcthCanBoKy.createFromList(canBoKy.map(shcc => ({
                nguoiTao: req.session.user?.shcc,
                nguoiKy: shcc,
                congVanTrinhKy: congVanTrinhKy.id
            })));
            res.send({ error: null });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/cong-van-trinh-ky/search/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        let { } = (req.query.filter && req.query.filter != '%%%%%%') ? req.query.filter :
            {};

        const shccCanBo = req.session.user?.shcc;

        const data = { shccCanBo };
        let filterParam;
        try {
            filterParam = JSON.stringify(data);
        } catch (error) {
            filterParam = '{}';
        }

        app.model.hcthCongVanTrinhKy.searchPage(pageNumber, pageSize, filterParam, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });;

    app.get('/api/hcth/cong-van-trinh-ky/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            const id = req.params.id;
            const congVanTrinhKy = await app.model.hcthCongVanTrinhKy.get({ id });
            let [congVanKy, canBoKy] = await Promise.all([
                app.model.hcthCongVanDi.get({ id: congVanTrinhKy.congVan }),
                app.model.hcthCanBoKy.getList(congVanTrinhKy.id)
            ]);
            canBoKy = canBoKy.rows || [];
            console.log(congVanKy);
            res.send({
                item: {
                    ...congVanTrinhKy,
                    congVanKy,
                    canBoKy
                }
            });
        } catch (error) {
            req.send({ error });
        }
    })
}