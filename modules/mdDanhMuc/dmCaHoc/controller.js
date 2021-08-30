module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            2004: { title: 'Giờ học', link: '/user/danh-muc/ca-hoc' },
        },
    };
    app.permission.add(
        { name: 'dmCaHoc:read', menu },
        { name: 'dmCaHoc:write' },
        { name: 'dmCaHoc:delete' },
    );
    app.get('/user/danh-muc/ca-hoc', app.permission.check('dmCaHoc:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/ca-hoc/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.caHoc.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/danh-muc/ca-hoc/all', app.permission.check('user:login'), (req, res) => {
        app.model.caHoc.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/ca-hoc/item/:_id', app.permission.check('user:login'), (req, res) => {
        app.model.caHoc.get(req.params._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/ca-hoc', app.permission.check('dmCaHoc:write'), (req, res) => {
        app.model.caHoc.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/ca-hoc', app.permission.check('dmCaHoc:write'), (req, res) => {
        let changes = app.clone(req.body.changes);
        app.model.caHoc.update({ ma: req.body._id }, changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/ca-hoc', app.permission.check('dmCaHoc:delete'), (req, res) => {
        app.model.caHoc.delete({ ma: req.body._id }, error => res.send({ error }));
    });
};