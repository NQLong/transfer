module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4034: { title: 'Khen thưởng', link: '/user/dm-khen-thuong' },
        },
    };
    app.permission.add(
        { name: 'dmKhenThuong:read', menu },
        { name: 'dmKhenThuong:write' },
        { name: 'dmKhenThuong:delete' },
    );
    app.get('/user/dm-khen-thuong', app.permission.check('dmKhenThuong:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dm-khen-thuong/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmKhenThuong.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/dm-khen-thuong/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmKhenThuong.getAll({}, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/dm-khen-thuong/item/:_id', app.permission.check('user:login'), (req, res) => {
        app.model.dmKhenThuong.get({ ma: req.params._id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/dm-khen-thuong', app.permission.check('dmKhenThuong:write'), (req, res) => {
        app.model.dmKhenThuong.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/dm-khen-thuong', app.permission.check('dmKhenThuong:write'), (req, res) => {
        app.model.dmKhenThuong.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/dm-khen-thuong', app.permission.check('dmKhenThuong:write'), (req, res) => {
        app.model.dmKhenThuong.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};