module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.danhGia,
        menus: { 9001: { title: 'Cấu trúc khung đánh giá cán bộ', link: '/user/danh-gia/cau-truc-khung-danh-gia-can-bo' } },
    };
    app.permission.add(
        { name: 'tccbKhungDanhGiaCanBo:read', menu },
        { name: 'tccbKhungDanhGiaCanBo:write' },
        { name: 'tccbKhungDanhGiaCanBo:delete' }
    );
    app.get('/user/danh-gia/cau-truc-khung-danh-gia-can-bo', app.permission.check('tccbKhungDanhGiaCanBo:read'), app.templates.admin);
    app.get('/user/danh-gia/cau-truc-khung-danh-gia-can-bo/:id', app.permission.check('tccbKhungDanhGiaCanBo:write'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-gia/cau-truc-khung-danh-gia-can-bo/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition ? req.query.condition : {};
        app.model.tccbKhungDanhGiaCanBo.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-gia/cau-truc-khung-danh-gia-can-bo/all', app.permission.check('user:login'), (req, res) => {
        app.model.tccbKhungDanhGiaCanBo.getAll({}, '*', 'id', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-gia/cau-truc-khung-danh-gia-can-bo/item/:id', app.permission.check('user:login'), (req, res) => {
        app.model.tccbKhungDanhGiaCanBo.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-gia/cau-truc-khung-danh-gia-can-bo', app.permission.check('tccbKhungDanhGiaCanBo:write'), (req, res) => {
        const newItem = req.body.item;
        app.model.tccbKhungDanhGiaCanBo.create(newItem, (error, item) => {
            res.send({ error, item });
        });
    });

    app.put('/api/danh-gia/cau-truc-khung-danh-gia-can-bo', app.permission.check('tccbKhungDanhGiaCanBo:write'), (req, res) => {
        app.model.tccbKhungDanhGiaCanBo.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/danh-gia/cau-truc-khung-danh-gia-can-bo', app.permission.check('tccbKhungDanhGiaCanBo:delete'), (req, res) => {
        app.model.tccbKhungDanhGiaCanBo.delete({ id: req.body.id }, error => res.send({ error }));
    });
};