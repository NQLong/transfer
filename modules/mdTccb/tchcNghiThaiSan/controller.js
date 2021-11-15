module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3015: { title: 'Nghỉ thai sản', link: '/user/nghiThaiSan', icon: 'fa-table', backgroundColor: '#8bc34a', },
        },
    };
    app.permission.add(
        { name: 'staff:login', menu: { parentMenu: { index: 1000, title: 'Thông tin cá nhân', icon: 'fa-user', link: '/user' } }, },
        { name: 'tchcNghiThaiSan:read', menu },
        { name: 'tchcNghiThaiSan:write' },
        { name: 'tchcNghiThaiSan:delete' },
    );
    app.get('/user/nghiThaiSan/:ma', app.permission.check('tchcNghiThaiSan:read'), app.templates.admin);
    app.get('/user/nghiThaiSan', app.permission.check('tchcNghiThaiSan:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    const checkGetStaffPermission = (req, res, next) => app.isDebug ? next() : app.permission.check('staff:login')(req, res, next);

    app.get('/api/nghiThaiSan/page/:pageNumber/:pageSize', checkGetStaffPermission, (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.tchcNghiThaiSan.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/nghiThaiSan/all', checkGetStaffPermission, (req, res) => {
        app.model.tchcNghiThaiSan.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/nghiThaiSan/item/:ma', checkGetStaffPermission, (req, res) => {
        app.model.tchcNghiThaiSan.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.get('/api/nghiThaiSan/edit/item/:ma', checkGetStaffPermission, (req, res) => {
        app.model.tchcNghiThaiSan.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/nghiThaiSan', app.permission.check('tchcNghiThaiSan:write'), (req, res) => {
        app.model.tchcNghiThaiSan.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/nghiThaiSan', app.permission.check('tchcNghiThaiSan:write'), (req, res) => {
        app.model.tchcNghiThaiSan.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/nghiThaiSan', app.permission.check('tchcNghiThaiSan:delete'), (req, res) => {
        app.model.tchcNghiThaiSan.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};