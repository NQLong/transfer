module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: { 4025: { title: 'Giới tính', link: '/user/danh-muc/gioi-tinh' } },
    };
    app.permission.add(
        { name: 'dmGioiTinh:read', menu },
        { name: 'dmGioiTinh:write' },
        { name: 'dmGioiTinh:delete' },
    );
    app.get('/user/danh-muc/gioi-tinh', app.permission.check('dmGioiTinh:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/gioi-tinh/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition ? req.query.condition : {};
        app.model.dmGioiTinh.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/gioi-tinh/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmGioiTinh.getAll({}, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/gioi-tinh/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmGioiTinh.get({ma: req.params.ma}, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/gioi-tinh', app.permission.check('dmGioiTinh:write'), (req, res) => {
        const newItem = req.body.dmGioiTinh;
        app.model.dmGioiTinh.get({ ma: newItem.ma }, (error, item) => {
            if (item) {
                res.send({ error: { exist: true, message: 'Trình độ ' + newItem.ma + ' đã tồn tại' } });
            } else if (error) {
                res.send({ error });
            } else {
                app.model.dmGioiTinh.create(newItem, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/danh-muc/gioi-tinh', app.permission.check('dmGioiTinh:write'), (req, res) => {
        app.model.dmGioiTinh.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/danh-muc/gioi-tinh', app.permission.check('dmGioiTinh:delete'), (req, res) => {
        app.model.dmGioiTinh.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};