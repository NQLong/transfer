module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.danhGia,
        menus: { 9002: { title: 'Cấu trúc khung đánh giá đơn vị', link: '/user/danh-gia/cau-truc-khung-danh-gia-don-vi' } },
    };
    app.permission.add(
        { name: 'tccbKhungDanhGiaDonVi:canBo:write' },
        { name: 'tccbKhungDanhGiaDonVi:read', menu },
        { name: 'tccbKhungDanhGiaDonVi:write' },
        { name: 'tccbKhungDanhGiaDonVi:delete' }
    );
    app.get('/user/danh-gia/cau-truc-khung-danh-gia-don-vi', app.permission.check('tccbKhungDanhGiaDonVi:read'), app.templates.admin);
    app.get('/user/danh-gia/cau-truc-khung-danh-gia-don-vi/:id', app.permission.check('tccbKhungDanhGiaDonVi:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-gia/cau-truc-khung-danh-gia-don-vi/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition ? req.query.condition : {};
        app.model.tccbKhungDanhGiaDonVi.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-gia/cau-truc-khung-danh-gia-don-vi/all', app.permission.check('user:login'), (req, res) => {
        app.model.tccbKhungDanhGiaDonVi.getAll({}, '*', 'id', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-gia/cau-truc-khung-danh-gia-don-vi/item/:id', app.permission.check('user:login'), (req, res) => {
        app.model.tccbKhungDanhGiaDonVi.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-gia/cau-truc-khung-danh-gia-don-vi', app.permission.check('tccbKhungDanhGiaDonVi:write'), (req, res) => {
        const newItem = req.body.item;
        app.model.tccbKhungDanhGiaDonVi.create(newItem, (error, item) => {
            res.send({ error, item });
        });
    });

    app.put('/api/danh-gia/cau-truc-khung-danh-gia-don-vi', app.permission.orCheck('tccbKhungDanhGiaDonVi:write', 'tccbKhungDanhGiaDonVi:canBo:write'), (req, res) => {
        app.model.tccbKhungDanhGiaDonVi.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/danh-gia/cau-truc-khung-danh-gia-don-vi', app.permission.check('tccbKhungDanhGiaDonVi:delete'), (req, res) => {
        app.model.tccbKhungDanhGiaDonVi.delete({ id: req.body.id }, error => res.send({ error }));
    });
};