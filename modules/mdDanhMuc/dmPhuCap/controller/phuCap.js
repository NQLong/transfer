module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            2020: { title: 'Phụ cấp', link: '/user/danh-muc/phu-cap' },
        },
    };
    app.permission.add(
        { name: 'dmPhuCap:read', menu },
        { name: 'dmPhuCap:write' },
        { name: 'dmPhuCap:delete' },
    );
    app.get('/user/danh-muc/phu-cap', app.permission.check('dmPhuCap:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/phu-cap/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmPhuCap.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/phu-cap/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmPhuCap.getAll({}, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/phu-cap/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmPhuCap.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/phu-cap', app.permission.check('dmPhuCap:write'), (req, res) => {
        app.model.dmPhuCap.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/phu-cap', app.permission.check('dmPhuCap:write'), (req, res) => {
        app.model.dmPhuCap.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/phu-cap', app.permission.check('dmPhuCap:delete'), (req, res) => {
        app.model.dmPhuCap.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};