module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: { 2015: { title: 'Loại viên chức', link: '/user/danh-muc/loai-vien-chuc' } },
    };
    app.permission.add(
        { name: 'dmLoaiVienChuc:read', menu },
        { name: 'dmLoaiVienChuc:write' },
        { name: 'dmLoaiVienChuc:delete' }
    );
    app.get('/user/danh-muc/loai-vien-chuc', app.permission.check('dmLoaiVienChuc:read'), app.templates.admin);
    app.get('/user/danh-muc/loai-vien-chuc/upload', app.permission.check('dmLoaiVienChuc:write'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/loai-vien-chuc/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition ? req.query.condition : {};
        app.model.dmLoaiVienChuc.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/loai-vien-chuc/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmLoaiVienChuc.getAll({}, '*', 'ma', (error, items) => res.send({ error, items }))
    })

    app.get('/api/danh-muc/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmLoaiVienChuc.get({ ma: req.body.ma }, (error, item) => res.send({ error, item }))
    });

    app.post('/api/danh-muc/loai-vien-chuc', app.permission.check('dmLoaiVienChuc:write'), (req, res) => {
        const newItem = req.body.item;
        app.model.dmLoaiVienChuc.get({ ma: newItem.ma }, (error, item) => {
            if (item) {
                res.send({ error: { exist: true, message: 'Loại viên chức ' + newItem.ma.toString() + ' đã tồn tại' } });
            } else if (error) {
                res.send({ error });
            } else {
                app.model.dmLoaiVienChuc.create(newItem, (error, item) => {
                    res.send({ error, item });
                });
            }
        });
    });

    app.put('/api/danh-muc/loai-vien-chuc', app.permission.check('dmLoaiVienChuc:write'), (req, res) => {
        app.model.dmLoaiVienChuc.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }))
    });

    app.delete('/api/danh-muc/loai-vien-chuc', app.permission.check('dmLoaiVienChuc:delete'), (req, res) => {
        app.model.dmLoaiVienChuc.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};