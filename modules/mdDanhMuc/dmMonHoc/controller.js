module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4073: { title: 'Môn Học', link: '/user/danh-muc/mon-hoc' },
        },
    };
    app.permission.add(
        { name: 'dmMonHoc:read', menu },
        { name: 'dmMonHoc:write' },
        { name: 'dmMonHoc:delete' },
    );
    app.get('/user/danh-muc/mon-hoc', app.permission.check('dmMonHoc:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/mon-hoc/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmMonHoc.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/mon-hoc/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        Object.keys(condition).forEach(key => { condition[key] === '' ? condition[key] = null : ''; });
        app.model.dmMonHoc.getAll(condition, '*', 'ten ASC', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/mon-hoc/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmMonHoc.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/mon-hoc', app.permission.check('dmMonHoc:write'), (req, res) => {
        app.model.dmMonHoc.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/mon-hoc', app.permission.check('dmMonHoc:write'), (req, res) => {
        app.model.dmMonHoc.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/mon-hoc', app.permission.check('dmMonHoc:delete'), (req, res) => {
        app.model.dmMonHoc.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};