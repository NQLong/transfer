module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4099: { title: 'Tình trạng sinh viên', link: '/user/danh-muc/tinh-trang-sinh-vien' },
        },
    };
    app.permission.add(
        { name: 'dmTinhTrangSinhVien:read', menu },
        { name: 'dmTinhTrangSinhVien:write' },
        { name: 'dmTinhTrangSinhVien:delete' },
    );
    app.get('/user/danh-muc/tinh-trang-sinh-vien', app.permission.check('dmTinhTrangSinhVien:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/tinh-trang-sinh-vien/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        const statement = ['ma', 'ten'].map(i => `lower(${i}) LIKE :searchText`).join(' OR ');
        if (req.query.condition) {
            condition = {
                statement,
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmTinhTrangSinhVien.getPage(pageNumber, pageSize, condition, '*', 'ten', (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/tinh-trang-sinh-vien/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmTinhTrangSinhVien.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/tinh-trang-sinh-vien/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmTinhTrangSinhVien.get({ma: req.params.ma}, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/tinh-trang-sinh-vien', app.permission.check('dmTinhTrangSinhVien:write'), (req, res) => {
        app.model.dmTinhTrangSinhVien.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/tinh-trang-sinh-vien', app.permission.check('dmTinhTrangSinhVien:write'), (req, res) => {
        app.model.dmTinhTrangSinhVien.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/tinh-trang-sinh-vien', app.permission.check('dmTinhTrangSinhVien:delete'), (req, res) => {
        app.model.dmTinhTrangSinhVien.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};