module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4044: { title: 'Loại tài sản cố định', link: '/user/danh-muc/loai-tai-san-co-dinh' },
        },
    };
    app.permission.add(
        { name: 'dmLoaiTaiSanCoDinh:read', menu },
        { name: 'dmLoaiTaiSanCoDinh:write' },
        { name: 'dmLoaiTaiSanCoDinh:delete' }
    );
    app.get('/user/danh-muc/loai-tai-san-co-dinh', app.permission.check('dmLoaiTaiSanCoDinh:read'), app.templates.admin);

    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/loai-tai-san-co-dinh/page/:pageNumber/:pageSize', app.permission.check('dmLoaiTaiSanCoDinh:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        const statement = ['ma', 'ten', 'donViTinh', 'maNhom', 'maHieu', 'maTaiKhoan']
            .map((i) => `lower(${i}) LIKE :searchText`)
            .join(' OR ');
        if (req.query.condition) {
            condition = {
                statement,
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmLoaiTaiSanCoDinh.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/danh-muc/loai-tai-san-co-dinh/all', app.permission.check('dmLoaiTaiSanCoDinh:read'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmLoaiTaiSanCoDinh.getAll(condition, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/loai-tai-san-co-dinh/item/:ma', app.permission.check('dmLoaiTaiSanCoDinh:read'), (req, res) => {
        app.model.dmLoaiTaiSanCoDinh.get(req.params.ma, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/loai-tai-san-co-dinh', app.permission.check('dmLoaiTaiSanCoDinh:write'), (req, res) => {
        app.model.dmLoaiTaiSanCoDinh.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/loai-tai-san-co-dinh', app.permission.check('dmLoaiTaiSanCoDinh:write'), (req, res) => {
        app.model.dmLoaiTaiSanCoDinh.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/loai-tai-san-co-dinh', app.permission.check('dmLoaiTaiSanCoDinh:delete'), (req, res) => {
        app.model.dmLoaiTaiSanCoDinh.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};