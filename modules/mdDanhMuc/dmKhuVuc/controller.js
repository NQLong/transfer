module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: { 2005: { title: 'Khu vực', link: '/user/danh-muc/khu-vuc' } },
    };
    app.permission.add(
        { name: 'dmKhuVuc:read', menu },
        { name: 'dmKhuVuc:write' },
        { name: 'dmKhuVuc:delete' },
    );
    app.get('/user/danh-muc/khu-vuc', app.permission.check('dmKhuVuc:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/khu-vuc/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText OR lower(territory) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            }
        }
        app.model.dmKhuVuc.getPage(pageNumber, pageSize, condition, '*', 'ma', (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/khu-vuc/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmKhuVuc.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/khu-vuc/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmKhuVuc.get(req.params.ma, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/khu-vuc', app.permission.check('dmKhuVuc:write'), (req, res) =>
        app.model.dmKhuVuc.create(req.body.dmKhuVuc, (error, item) => res.send({ error, item })));

    app.put('/api/danh-muc/khu-vuc', app.permission.check('dmKhuVuc:write'), (req, res) =>
        app.model.dmKhuVuc.update(req.body.condition, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/danh-muc/khu-vuc', app.permission.check('dmKhuVuc:delete'), (req, res) =>
        app.model.dmKhuVuc.delete({ ma: req.body.ma }, error => res.send({ error })));
};