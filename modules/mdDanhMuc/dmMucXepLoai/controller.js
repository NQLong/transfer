module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: { 4091: { title: 'Mức xếp loại', link: '/user/danh-muc/muc-xep-loai' } },
    };
    app.permission.add(
        { name: 'dmMucXepLoai:read', menu },
        { name: 'dmMucXepLoai:write' },
        { name: 'dmMucXepLoai:delete' }
    );
    app.get('/user/danh-muc/muc-xep-loai', app.permission.check('dmMucXepLoai:read'), app.templates.admin);
    app.get('/user/danh-muc/muc-xep-loai/upload', app.permission.check('dmMucXepLoai:write'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/muc-xep-loai/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition ? req.query.condition : {};
        app.model.dmMucXepLoai.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/muc-xep-loai/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmMucXepLoai.getAll({}, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmMucXepLoai.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/muc-xep-loai', app.permission.check('dmMucXepLoai:write'), (req, res) => {
        const newItem = req.body.item;
        app.model.dmMucXepLoai.get({ ma: newItem.ma }, (error, item) => {
            if (item) {
                res.send({ error: { exist: true, message: 'Mức xếp loại ' + newItem.ma.toString() + ' đã tồn tại' } });
            } else if (error) {
                res.send({ error });
            } else {
                app.model.dmMucXepLoai.create(newItem, (error, item) => {
                    res.send({ error, item });
                });
            }
        });
    });

    app.put('/api/danh-muc/muc-xep-loai', app.permission.check('dmMucXepLoai:write'), (req, res) => {
        app.model.dmMucXepLoai.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/danh-muc/muc-xep-loai', app.permission.check('dmMucXepLoai:delete'), (req, res) => {
        app.model.dmMucXepLoai.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};