module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: { 4051: { title: 'Mức đánh giá', link: '/user/danh-muc/muc-danh-gia' } },
    };
    app.permission.add(
        { name: 'dmMucDanhGia:read', menu },
        { name: 'dmMucDanhGia:write' },
        { name: 'dmMucDanhGia:delete' }
    );
    app.get('/user/danh-muc/muc-danh-gia', app.permission.check('dmMucDanhGia:read'), app.templates.admin);
    app.get('/user/danh-muc/muc-danh-gia/upload', app.permission.check('dmMucDanhGia:write'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/muc-danh-gia/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition ? req.query.condition : {};
        app.model.dmMucDanhGia.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/muc-danh-gia/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmMucDanhGia.getAll({}, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmMucDanhGia.get({ ma: req.body.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/muc-danh-gia', app.permission.check('dmMucDanhGia:write'), (req, res) => {
        const newItem = req.body.item;
        app.model.dmMucDanhGia.get({ ma: newItem.ma }, (error, item) => {
            if (item) {
                res.send({ error: { exist: true, message: 'Mức đánh giá ' + newItem.ma.toString() + ' đã tồn tại' } });
            } else if (error) {
                res.send({ error });
            } else {
                app.model.dmMucDanhGia.create(newItem, (error, item) => {
                    res.send({ error, item });
                });
            }
        });
    });

    app.put('/api/danh-muc/muc-danh-gia', app.permission.check('dmMucDanhGia:write'), (req, res) => {
        app.model.dmMucDanhGia.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/danh-muc/muc-danh-gia', app.permission.check('dmMucDanhGia:delete'), (req, res) => {
        app.model.dmMucDanhGia.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};