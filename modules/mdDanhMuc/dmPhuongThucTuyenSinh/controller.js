module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4099: { title: 'Phương thức tuyển sinh', link: '/user/danh-muc/phuong-thuc-tuyen-sinh' },
        },
    };
    app.permission.add(
        { name: 'dmPhuongThucTuyenSinh:read', menu },
        { name: 'dmPhuongThucTuyenSinh:write' },
        { name: 'dmPhuongThucTuyenSinh:delete' },
    );
    app.get('/user/danh-muc/phuong-thuc-tuyen-sinh', app.permission.check('dmPhuongThucTuyenSinh:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/phuong-thuc-tuyen-sinh/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
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
        app.model.dmPhuongThucTuyenSinh.getPage(pageNumber, pageSize, condition, '*', 'ten', (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/phuong-thuc-tuyen-sinh/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmPhuongThucTuyenSinh.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/phuong-thuc-tuyen-sinh/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmPhuongThucTuyenSinh.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/phuong-thuc-tuyen-sinh', app.permission.check('dmPhuongThucTuyenSinh:write'), (req, res) => {
        app.model.dmPhuongThucTuyenSinh.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/phuong-thuc-tuyen-sinh', app.permission.check('dmPhuongThucTuyenSinh:write'), (req, res) => {
        app.model.dmPhuongThucTuyenSinh.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/phuong-thuc-tuyen-sinh', app.permission.check('dmPhuongThucTuyenSinh:delete'), (req, res) => {
        app.model.dmPhuongThucTuyenSinh.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};