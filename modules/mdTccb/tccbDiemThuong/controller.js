module.exports = app => {
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // app.get('/api/tccb/diem-thuong/page/:pageNumber/:pageSize', app.permission.check('tccbDanhGiaNam:manage'), (req, res) => {
    //     const pageNumber = parseInt(req.params.pageNumber),
    //         pageSize = parseInt(req.params.pageSize),
    //         condition = req.query.condition || {};
    //     app.model.tccbDiemThuong.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    // });

    app.get('/api/tccb/diem-thuong/all', app.permission.check('tccbDanhGiaNam:manage'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.tccbDiemThuong.getAll(condition, '*', 'id', (error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/diem-thuong/item/:id', app.permission.check('tccbDanhGiaNam:manage'), (req, res) => {
        app.model.tccbDiemThuong.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tccb/diem-thuong', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        const newItem = req.body.item;
        app.model.tccbDiemThuong.create(newItem, (error, item) => {
            res.send({ error, item });
        });
    });

    app.put('/api/tccb/diem-thuong', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        app.model.tccbDiemThuong.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/tccb/diem-thuong', app.permission.check('tccbDanhGiaNam:delete'), (req, res) => {
        app.model.tccbDiemThuong.delete({ id: req.body.id }, error => res.send({ error }));
    });
};