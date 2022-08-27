module.exports = app => {
   // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/danh-gia/cau-truc-khung-danh-gia-don-vi/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition ? req.query.condition : {};
        app.model.tccbKhungDanhGiaDonVi.getPage(pageNumber, pageSize, condition, '*', 'THU_TU ASC', (error, page) => res.send({ error, page }));
    });

    app.get('/api/tccb/danh-gia/cau-truc-khung-danh-gia-don-vi/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.tccbKhungDanhGiaDonVi.getAll(condition, '*', 'THU_TU ASC', (error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/danh-gia/cau-truc-khung-danh-gia-don-vi/item/:id', app.permission.check('user:login'), (req, res) => {
        app.model.tccbKhungDanhGiaDonVi.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tccb/danh-gia/cau-truc-khung-danh-gia-don-vi', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        const newItem = req.body.item;
        app.model.tccbKhungDanhGiaDonVi.create(newItem, (error, item) => {
            res.send({ error, item });
        });
    });

    app.put('/api/tccb/danh-gia/cau-truc-khung-danh-gia-don-vi', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        app.model.tccbKhungDanhGiaDonVi.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/tccb/danh-gia/cau-truc-khung-danh-gia-don-vi', app.permission.check('tccbDanhGiaNam:delete'), (req, res) => {
        const id = req.body.id;
        app.model.tccbKhungDanhGiaDonVi.delete({ parentId: id }, error => {
            if (error) {
                res.send({ error });
            } else {
                app.model.tccbKhungDanhGiaDonVi.delete({ id }, error => res.send({ error }));
            }
        });
    });

    app.put('/api/tccb/danh-gia/cau-truc-khung-danh-gia-don-vi/thu-tu', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        let error = null;
        const changes = req.body.changes,
            updateOneChange = (index) => {
                if (index < changes.length) {
                    const item = changes[index];
                    if (item) {
                        app.model.tccbKhungDanhGiaDonVi.update({ id: item.id }, { thuTu: item.thuTu }, err => {
                            if (err) error = err;
                            updateOneChange(index + 1);
                        });
                    }
                } else {
                    res.send({ error });
                }
            };
        updateOneChange(0);
    });

};