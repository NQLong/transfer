module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            2: { title: 'Tăng Bảo hiểm xã hội', link: '/user/danh-muc/tang-bao-hiem-xa-hoi'},
        },
    };
    app.permission.add(
        { name: 'dmTangBhxh:read', menu },
        { name: 'dmTangBhxh:write' },
        { name: 'dmTangBhxh:delete' },
    );
    app.get('/user/danh-muc/tang-bao-hiem-xa-hoi', app.permission.check('dmTangBhxh:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/tang-bao-hiem-xa-hoi/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmTangBhxh.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/tang-bao-hiem-xa-hoi/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmTangBhxh.getAll({}, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/tang-bao-hiem-xa-hoi/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmTangBhxh.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/tang-bao-hiem-xa-hoi', app.permission.check('dmTangBhxh:write'), (req, res) => {
        app.model.dmTangBhxh.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/tang-bao-hiem-xa-hoi', app.permission.check('dmTangBhxh:write'), (req, res) => {
        app.model.dmTangBhxh.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/tang-bao-hiem-xa-hoi', app.permission.check('dmTangBhxh:delete'), (req, res) => {
        app.model.dmTangBhxh.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};