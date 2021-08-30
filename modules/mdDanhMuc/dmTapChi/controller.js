module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            2106: { title: 'Tạp chí', link: '/user/danh-muc/tap-chi' },
        },
    };
    app.permission.add(
        { name: 'dmTapChi:read', menu },
        { name: 'dmTapChi:write' },
        { name: 'dmTapChi:delete' },
    );
    app.get('/user/danh-muc/tap-chi', app.permission.check('dmTapChi:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/tap-chi/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmTapChi.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/tap-chi/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmTapChi.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/tap-chi/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmTapChi.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/tap-chi', app.permission.check('dmTapChi:write'), (req, res) => {
        app.model.dmTapChi.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/tap-chi', app.permission.check('dmTapChi:write'), (req, res) => {
        app.model.dmTapChi.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/tap-chi', app.permission.check('dmTapChi:delete'), (req, res) => {
        app.model.dmTapChi.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};