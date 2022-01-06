module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            56: { title: 'Nguồn Vốn', link: '/user/danh-muc/nguon-von' },
        },
    };
    app.permission.add(
        { name: 'dmNguonVon:read', menu },
        { name: 'dmNguonVon:write' },
        { name: 'dmNguonVon:delete' }
    );
    app.get('/user/danh-muc/nguon-von', app.permission.check('dmNguonVon:read'), app.templates.admin);

    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/nguon-von/page/:pageNumber/:pageSize', app.permission.check('dmNguonVon:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        const statement = ['ma', 'tenNguonVon'].map(i => `lower(${i}) LIKE :searchText`).join(' OR ');
        if (req.query.condition) {
            condition = {
                statement,
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmNguonVon.getPage(pageNumber, pageSize, condition, '*', 'ma', (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/danh-muc/nguon-von/all', app.permission.check('dmNguonVon:read'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmNguonVon.getAll(condition, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/nguon-von/item/:ma', app.permission.check('dmNguonVon:read'), (req, res) => {
        app.model.dmNguonVon.get(req.params.ma, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/nguon-von', app.permission.check('dmNguonVon:write'), (req, res) => {
        app.model.dmNguonVon.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/nguon-von', app.permission.check('dmNguonVon:write'), (req, res) => {
        app.model.dmNguonVon.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/nguon-von', app.permission.check('dmNguonVon:delete'), (req, res) => {
        app.model.dmNguonVon.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};