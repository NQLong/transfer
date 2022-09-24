module.exports = app => {
    app.get('/api/tccb/danh-gia-hoi-dong-don-vi/all', app.permission.check('tccbDanhGiaNam:manage'), (req, res) => {
        const nam = parseInt(req.query.nam);
        app.model.tccbDanhGiaHoiDongDonVi.getAllByYear(nam, '', (error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/danh-gia-hoi-dong-don-vi/item/:id', app.permission.check('tccbDanhGiaNam:manage'), (req, res) => {
        app.model.tccbDanhGiaHoiDongDonVi.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tccb/danh-gia-hoi-dong-don-vi', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        const newItem = req.body.item;
        app.model.tccbDanhGiaHoiDongDonVi.create(newItem, (error, item) => {
            res.send({ error, item });
        });
    });

    app.put('/api/tccb/danh-gia-hoi-dong-don-vi', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        app.model.tccbDanhGiaHoiDongDonVi.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/tccb/danh-gia-hoi-dong-don-vi', app.permission.check('tccbDanhGiaNam:delete'), (req, res) => {
        app.model.tccbDanhGiaHoiDongDonVi.delete({ id: req.body.id }, error => res.send({ error }));
    });
};