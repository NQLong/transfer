module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3002: { title: 'Hợp đồng đơn vị trả lương - trách nhiệm', link: '/user/hopDongDvtlTn', icon: 'fa-table', backgroundColor: '#8bc34a', },
        },
    };
    app.permission.add(
        { name: 'staff:login', menu: { parentMenu: { index: 1000, title: 'Thông tin cá nhân', icon: 'fa-user', link: '/user' } }, },
        { name: 'tchcHopDongDvtlTn:read', menu },
        { name: 'tchcHopDongDvtlTn:write' },
        { name: 'tchcHopDongDvtlTn:delete' },
    );
    app.get('/user/hopDongDvtlTn/:ma', app.permission.check('tchcHopDongDvtlTn:read'), app.templates.admin);
    app.get('/user/hopDongDvtlTn', app.permission.check('tchcHopDongDvtlTn:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    const checkGetStaffPermission = (req, res, next) => app.isDebug ? next() : app.permission.check('staff:login')(req, res, next);

    app.get('/api/hopDongDvtlTn/page/:pageNumber/:pageSize', checkGetStaffPermission, (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.tchcHopDongDvtlTn.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/hopDongDvtlTn/all', checkGetStaffPermission, (req, res) => {
        app.model.tchcHopDongDvtlTn.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/hopDongDvtlTn/item/:ma', checkGetStaffPermission, (req, res) => {
        app.model.tchcHopDongDvtlTn.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.get('/api/hopDongDvtlTn/edit/item/:ma', checkGetStaffPermission, (req, res) => {
        app.model.tchcHopDongDvtlTn.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/hopDongDvtlTn', app.permission.check('tchcHopDongDvtlTn:write'), (req, res) => {
        app.model.tchcHopDongDvtlTn.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/hopDongDvtlTn', app.permission.check('tchcHopDongDvtlTn:write'), (req, res) => {
        app.model.tchcHopDongDvtlTn.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/hopDongDvtlTn', app.permission.check('tchcHopDongDvtlTn:delete'), (req, res) => {
        app.model.tchcHopDongDvtlTn.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });

    app.get('/user/hopDongDvtlTn/:ma/word', app.permission.check('staff:login'), (req, res) => {
        if (req.params && req.params.ma) {
            app.model.tchcHopDongDvtlTn.get({ ma: req.params.ma }, (error, item) => {
                if (error || item == null) {
                    res.send({ error });
                } else {
                    // const source = app.path.join(__dirname, 'resource', 'Mau-HD-DVTL.docx');
                }
            });
        }
    });
};