module.exports = app => {
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/diem-tru/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition || {};
        app.model.tccbDiemTru.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/tccb/diem-tru/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.tccbDiemTru.getAll(condition, '*', 'id', (error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/diem-tru/item/:id', app.permission.check('user:login'), (req, res) => {
        app.model.tccbDiemTru.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tccb/diem-tru', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        const newItem = req.body.item;
        app.model.tccbDiemTru.create(newItem, (error, item) => {
            res.send({ error, item });
        });
    });

    app.put('/api/tccb/diem-tru', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        app.model.tccbDiemTru.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/tccb/diem-tru', app.permission.check('tccbDanhGiaNam:delete'), (req, res) => {
        app.model.tccbDiemTru.delete({ id: req.body.id }, error => res.send({ error }));
    });
};