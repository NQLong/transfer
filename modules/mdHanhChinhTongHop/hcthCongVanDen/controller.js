module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            501: { title: 'Công văn đến', link: '/user/hcth/cong-van-den', icon: 'fa-caret-square-o-left', backgroundColor: '#00aa00' },
        },
    };
    app.permission.add({ name: 'staff:login', menu });
    app.permission.add({ name: 'hcthCongVanDen:read' });
    app.permission.add({ name: 'hcthCongVanDen:write' });
    app.permission.add({ name: 'hcthCongVanDen:delete' });
    app.get('/user/hcth/cong-van-den', app.permission.check('staff:login'), app.templates.admin);

    app.get('/api/hcth/cong-van-den/all', app.permission.check('staff:login'), (req, res) => {
        app.model.hcthCongVanDen.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/hcth/cong-van-den/page/:pageNumber/:pageSize', (req, res) => {
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

    app.get('/api/hcth/cong-van-den/page/:pageNumber/:pageSize', (req, res) => {
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

    app.post('/api/hcth/cong-van-den', app.permission.check('staff:login'), (req, res) => {
        console.log(req.body);
        app.model.hcthCongVanDen.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/hcth/cong-van-den', app.permission.check('hcthCongVanDen:write'), (req, res) => {
        app.model.hcthCongVanDen.update({ id: req.body.id }, req.body.changes, (errors, items) => res.send({ errors, items }));
    });

    app.delete('/api/hcth/cong-van-den', app.permission.check('hcthCongVanDen:delete'), (req, res) => {
        app.model.hcthCongVanDen.delete({ id: req.body.id }, errors => res.send({ errors }));
    });

    app.get('/api/hcth/cong-van-den/search/page/:pageNumber/:pageSize', app.permission.check('hcthCongVanDen:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        app.model.hcthCongVanDen.searchPage(pageNumber, pageSize, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });
};
