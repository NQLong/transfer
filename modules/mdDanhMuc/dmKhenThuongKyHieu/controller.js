module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            2116: { title: 'Khen thưởng ký hiệu', link: '/user/danh-muc/khen-thuong-ky-hieu' },
        },
    };
    app.permission.add(
        { name: 'dmKhenThuongKyHieu:read', menu },
        { name: 'dmKhenThuongKyHieu:write' },
        { name: 'dmKhenThuongKyHieu:delete' },
    );
    app.get('/user/danh-muc/khen-thuong-ky-hieu', app.permission.check('dmKhenThuongKyHieu:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/khen-thuong-ky-hieu/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmKhenThuongKyHieu.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/khen-thuong-ky-hieu/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmKhenThuongKyHieu.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/khen-thuong-ky-hieu/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmKhenThuongKyHieu.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/khen-thuong-ky-hieu', app.permission.check('dmKhenThuongKyHieu:write'), (req, res) => {
        let newData = req.body.item;
        app.model.dmKhenThuongKyHieu.create(newData, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/khen-thuong-ky-hieu', app.permission.check('dmKhenThuongKyHieu:write'), (req, res) => {
        let changes = app.clone(req.body.changes);
        app.model.dmKhenThuongKyHieu.update({ ma: req.body.ma }, changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/khen-thuong-ky-hieu', app.permission.check('dmKhenThuongKyHieu:delete'), (req, res) => {
        app.model.dmKhenThuongKyHieu.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};