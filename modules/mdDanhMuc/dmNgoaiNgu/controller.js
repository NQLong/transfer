module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4055: { title: 'Ngoại ngữ', link: '/user/danh-muc/ngoai-ngu' },
        },
    };
    app.permission.add(
        { name: 'dmNgoaiNgu:read', menu },
        { name: 'dmNgoaiNgu:write' },
        { name: 'dmNgoaiNgu:delete' },
    );
    app.get('/user/danh-muc/ngoai-ngu', app.permission.check('dmNgoaiNgu:read'), app.templates.admin);
    app.get('/user/danh-muc/ngoai-ngu/upload', app.permission.check('dmNgoaiNgu:write'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/ngoai-ngu/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmNgoaiNgu.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/ngoai-ngu/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmNgoaiNgu.getAll(condition, '*', 'ma', (error, items) => {
            res.send({ error, items });
        });
    });

    app.get('/api/danh-muc/ngoai-ngu/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmNgoaiNgu.get({ ma: req.params.ma }, (error, item) => {
            res.send({ error, item });
        });
    });

    app.post('/api/danh-muc/ngoai-ngu', app.permission.check('dmNgoaiNgu:write'), (req, res) => {
        app.model.dmNgoaiNgu.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/ngoai-ngu', app.permission.check('dmNgoaiNgu:write'), (req, res) => {
        app.model.dmNgoaiNgu.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/ngoai-ngu', app.permission.check('dmNgoaiNgu:delete'), (req, res) => {
        app.model.dmNgoaiNgu.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};