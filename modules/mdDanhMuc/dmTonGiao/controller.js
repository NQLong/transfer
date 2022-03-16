module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: { 4073: { title: 'Tôn giáo', link: '/user/danh-muc/ton-giao' } },
    };
    app.permission.add(
        { name: 'dmTonGiao:read', menu },
        { name: 'dmTonGiao:write' },
        { name: 'dmTonGiao:delete' },
    );

    app.get('/user/danh-muc/ton-giao', app.permission.check('dmTonGiao:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/ton-giao/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmTonGiao.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/ton-giao/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmTonGiao.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.post('/api/danh-muc/ton-giao', app.permission.check('dmTonGiao:write'), (req, res) => {
        const newItem = req.body.dmTonGiao;
        app.model.dmTonGiao.get({ ma: newItem.ma }, (error, item) => {
            if (item) {
                res.send({ error: { exist: true, message: 'Tôn giáo ' + newItem.ma.toString() + ' đã tồn tại' } });
            } else if (error) {
                res.send({ error });
            } else {
                app.model.dmTonGiao.create(newItem, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/danh-muc/ton-giao', app.permission.check('dmTonGiao:write'), (req, res) => {
        app.model.dmTonGiao.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.get('/api/danh-muc/ton-giao/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmTonGiao.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/danh-muc/ton-giao', app.permission.check('dmTonGiao:delete'), (req, res) => {
        app.model.dmTonGiao.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};