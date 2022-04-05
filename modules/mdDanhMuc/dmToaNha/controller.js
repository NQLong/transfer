module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4072: { title: 'Dãy nhà', link: '/user/danh-muc/day-nha' },
        },
    };
    app.permission.add(
        { name: 'dmToaNha:read', menu },
        { name: 'dmToaNha:write' },
        { name: 'dmToaNha:delete' },
    );
    app.get('/user/danh-muc/day-nha', app.permission.check('dmToaNha:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/day-nha/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmToaNha.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/day-nha/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        Object.keys(condition).forEach(key => { condition[key] === '' ? condition[key] = null : ''; });
        app.model.dmToaNha.getAll(condition, '*', 'ten ASC', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/day-nha/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmToaNha.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/day-nha', app.permission.check('dmToaNha:write'), (req, res) => {
        app.model.dmToaNha.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/day-nha', app.permission.check('dmToaNha:write'), (req, res) => {
        app.model.dmToaNha.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/day-nha', app.permission.check('dmToaNha:delete'), (req, res) => {
        app.model.dmToaNha.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};