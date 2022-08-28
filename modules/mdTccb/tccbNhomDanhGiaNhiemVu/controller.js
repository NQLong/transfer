module.exports = app => {
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/nhom-danh-gia-nhiem-vu/page/:pageNumber/:pageSize', app.permission.check('tccbDanhGiaNam:manage'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition || {};
        app.model.tccbNhomDanhGiaNhiemVu.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/tccb/nhom-danh-gia-nhiem-vu/all', app.permission.check('tccbDanhGiaNam:manage'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.tccbNhomDanhGiaNhiemVu.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/nhom-danh-gia-nhiem-vu/item/:id', app.permission.check('tccbDanhGiaNam:manage'), (req, res) => {
        app.model.tccbNhomDanhGiaNhiemVu.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tccb/nhom-danh-gia-nhiem-vu', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        const newItem = req.body.item;
        app.model.tccbNhomDanhGiaNhiemVu.create(newItem, (error, item) => {
            res.send({ error, item });
        });
    });

    app.put('/api/tccb/nhom-danh-gia-nhiem-vu', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        app.model.tccbNhomDanhGiaNhiemVu.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/tccb/nhom-danh-gia-nhiem-vu', app.permission.check('tccbDanhGiaNam:delete'), (req, res) => {
        app.model.tccbNhomDanhGiaNhiemVu.delete({ id: req.body.id }, error => res.send({ error }));
    });
};