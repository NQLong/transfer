module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4050: { title: 'Ngạch chức danh nghề nghiệp', link: '/user/danh-muc/ngach-cdnn' },
        },
    };
    app.permission.add(
        { name: 'dmNgachCdnn:read', menu },
        { name: 'dmNgachCdnn:write' },
        { name: 'dmNgachCdnn:delete' },
    );
    app.get('/user/danh-muc/ngach-cdnn', app.permission.check('dmNgachCdnn:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/ngach-cdnn/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let searchTerm = { statement: null };
        if (req.query.condition) {
            searchTerm = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmNgachCdnn.getPage(pageNumber, pageSize, searchTerm, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/ngach-cdnn/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmNgachCdnn.getAll(condition, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/ngach-cdnn/item/:id', app.permission.check('user:login'), (req, res) => {
        app.model.dmNgachCdnn.get({ id: req.body.id }, (error, items) => res.send({ error, items }));
    });

    app.post('/api/danh-muc/ngach-cdnn', app.permission.check('dmNgachCdnn:write'), (req, res) => {
        app.model.dmNgachCdnn.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/ngach-cdnn', app.permission.check('dmNgachCdnn:write'), (req, res) => {
        app.model.dmNgachCdnn.update({ id: req.body.id }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/ngach-cdnn', app.permission.check('dmNgachCdnn:delete'), (req, res) => {
        app.model.dmNgachCdnn.delete({ id: req.body.id }, errors => res.send({ errors }));
    });
};