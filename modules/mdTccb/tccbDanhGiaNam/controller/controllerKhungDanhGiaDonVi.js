module.exports = app => {
    app.permission.add(
        { name: 'tccbKhungDanhGiaDonVi:read' },
        { name: 'tccbKhungDanhGiaDonVi:write' },
        { name: 'tccbKhungDanhGiaDonVi:delete' }
    );

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/danh-gia/cau-truc-khung-danh-gia-don-vi/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition ? req.query.condition : {};
        app.model.tccbKhungDanhGiaDonVi.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/tccb/danh-gia/cau-truc-khung-danh-gia-don-vi/all', app.permission.check('user:login'), (req, res) => {
        app.model.tccbKhungDanhGiaDonVi.getAll({}, '*', 'id', (error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/danh-gia/cau-truc-khung-danh-gia-don-vi/item/:id', app.permission.check('user:login'), (req, res) => {
        app.model.tccbKhungDanhGiaDonVi.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tccb/danh-gia/cau-truc-khung-danh-gia-don-vi', app.permission.check('tccbKhungDanhGiaDonVi:write'), (req, res) => {
        const newItem = req.body.item;
        app.model.tccbKhungDanhGiaDonVi.create(newItem, (error, item) => {
            res.send({ error, item });
        });
    });

    app.put('/api/tccb/danh-gia/cau-truc-khung-danh-gia-don-vi', app.permission.orCheck('tccbKhungDanhGiaDonVi:write', 'tccbKhungDanhGiaDonVi:canBo:write'), (req, res) => {
        app.model.tccbKhungDanhGiaDonVi.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/tccb/danh-gia/cau-truc-khung-danh-gia-don-vi', app.permission.check('tccbKhungDanhGiaDonVi:delete'), (req, res) => {
        app.model.tccbKhungDanhGiaDonVi.delete({ id: req.body.id }, error => res.send({ error }));
    });
};