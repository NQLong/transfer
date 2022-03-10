module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4099: { title: 'Loại sinh viên', link: '/user/danh-muc/loai-sinh-vien' },
        },
    };
    app.permission.add(
        { name: 'dmLoaiSinhVien:read', menu },
        { name: 'dmLoaiSinhVien:write' },
        { name: 'dmLoaiSinhVien:delete' },
    );
    app.get('/user/danh-muc/loai-sinh-vien', app.permission.check('dmLoaiSinhVien:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/loai-sinh-vien/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
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
        app.model.dmLoaiSinhVien.getPage(pageNumber, pageSize, condition, '*', 'ten', (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/loai-sinh-vien/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmLoaiSinhVien.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/loai-sinh-vien/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmLoaiSinhVien.get({ma: req.params.ma}, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/loai-sinh-vien', app.permission.check('dmLoaiSinhVien:write'), (req, res) => {
        app.model.dmLoaiSinhVien.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/loai-sinh-vien', app.permission.check('dmLoaiSinhVien:write'), (req, res) => {
        app.model.dmLoaiSinhVien.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/loai-sinh-vien', app.permission.check('dmLoaiSinhVien:delete'), (req, res) => {
        app.model.dmLoaiSinhVien.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};