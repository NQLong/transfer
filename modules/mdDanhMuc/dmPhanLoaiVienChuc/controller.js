module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: { 2169: { title: 'Phân loại viên chức', link: '/user/danh-muc/phan-loai-vien-chuc' } },
    };
    app.permission.add(
        { name: 'dmPhanLoaiVienChuc:read', menu },
        { name: 'dmPhanLoaiVienChuc:write' },
        { name: 'dmPhanLoaiVienChuc:delete' },
    );
    app.get('/user/danh-muc/phan-loai-vien-chuc', app.permission.check('dmPhanLoaiVienChuc:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/phan-loai-vien-chuc/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition ? req.query.condition : {};
        app.model.dmPhanLoaiVienChuc.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.post('/api/danh-muc/phan-loai-vien-chuc', app.permission.check('dmPhanLoaiVienChuc:write'), (req, res) => {
        const newItem = req.body.dmPhanLoaiVienChuc;
        app.model.dmPhanLoaiVienChuc.get({ ma: newItem.ma }, (error, item) => {
            if (item) {
                res.send({ error: { exist: true, message: 'Phân loại viên chức ' + newItem.ma.toString() + ' đã tồn tại' } });
            } else if (error) {
                res.send({ error });
            } else {
                app.model.dmPhanLoaiVienChuc.create(newItem, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/danh-muc/phan-loai-vien-chuc', app.permission.check('dmPhanLoaiVienChuc:write'), (req, res) => {
        app.model.dmPhanLoaiVienChuc.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }))
    });

    app.delete('/api/danh-muc/phan-loai-vien-chuc', app.permission.check('dmPhanLoaiVienChuc:delete'), (req, res) => {
        app.model.dmPhanLoaiVienChuc.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};