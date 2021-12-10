module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3010: { title: 'Hợp đồng lao động', link: '/user/tchc/hop-dong-lao-dong', icon: 'fa-file-text-o', backgroundColor: '#524e4e', groupIndex: 1},
        },
    };
    app.permission.add(
        { name: 'staff:login', menu: { parentMenu: { index: 1000, title: 'Thông tin cá nhân', icon: 'fa-user', link: '/user' } }, },
        { name: 'tchcHopDongLaoDong:read', menu },
        { name: 'tchcHopDongLaoDong:write' },
        { name: 'tchcHopDongLaoDong:delete' },
    );
    app.get('/user/tchc/hop-dong-lao-dong/:ma', app.permission.check('tchcHopDongLaoDong:read'), app.templates.admin);
    app.get('/user/tchc/hop-dong-lao-dong', app.permission.check('tchcHopDongLaoDong:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    const checkGetStaffPermission = (req, res, next) => app.isDebug ? next() : app.permission.check('staff:login')(req, res, next);

    app.get('/api/tchc/hop-dong-lao-dong/page/:pageNumber/:pageSize', checkGetStaffPermission, (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.tchcHopDongLaoDong.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/tchc/hop-dong-lao-dong/all', checkGetStaffPermission, (req, res) => {
        app.model.tchcHopDongLaoDong.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/tchc/hop-dong-lao-dong/item/:ma', checkGetStaffPermission, (req, res) => {
        app.model.tchcHopDongLaoDong.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.get('/api/tchc/hop-dong-lao-dong/edit/item/:ma', checkGetStaffPermission, (req, res) => {
        app.model.tchcHopDongLaoDong.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tchc/hop-dong-lao-dong', app.permission.check('tchcHopDongLaoDong:write'), (req, res) => {
        app.model.tchcHopDongLaoDong.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/tchc/hop-dong-lao-dong', app.permission.check('tchcHopDongLaoDong:write'), (req, res) => {
        app.model.tchcHopDongLaoDong.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/tchc/hop-dong-lao-dong', app.permission.check('tchcHopDongLaoDong:delete'), (req, res) => {
        app.model.tchcHopDongLaoDong.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};