module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: { 2006: { title: 'Châu', link: '/user/danh-muc/chau' } },
    };
    app.permission.add(
        { name: 'dmChau:read', menu },
        { name: 'dmChau:write' },
        { name: 'dmChau:delete' },
    );

    app.get('/user/danh-muc/chau', app.permission.check('dmChau:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/chau/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText OR lower(territory) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            }
        }
        app.model.dmChau.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/chau/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmChau.getAll({}, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/chau/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmChau.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/chau', app.permission.check('dmChau:write'), (req, res) => {
        const newItem = req.body.dmChau;
        app.model.dmChau.get({ ma: newItem.ma }, (error, item) => {
            if (item) {
                res.send({ error: { exist: true, message: 'Châu ' + newItem.ma.toString() + ' đã tồn tại' } });
            } else if (error) {
                res.send({ error });
            } else {
                app.model.dmChau.create(newItem, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/danh-muc/chau', app.permission.check('dmChau:write'), (req, res) => {
        app.model.dmChau.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }))
    });

    app.delete('/api/danh-muc/chau', app.permission.check('dmChau:delete'), (req, res) => {
        app.model.dmChau.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};