module.exports = app => {
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // app.get('/api/tccb/danh-gia/cau-truc-khung-danh-gia-don-vi/page/:pageNumber/:pageSize', app.permission.check('tccbDanhGiaNam:manage'), (req, res) => {
    //     const pageNumber = parseInt(req.params.pageNumber),
    //         pageSize = parseInt(req.params.pageSize),
    //         condition = req.query.condition ? req.query.condition : {};
    //     app.model.tccbKhungDanhGiaDonVi.getPage(pageNumber, pageSize, condition, '*', 'THU_TU ASC', (error, page) => res.send({ error, page }));
    // });

    app.get('/api/tccb/danh-gia/cau-truc-khung-danh-gia-don-vi/all', app.permission.check('tccbDanhGiaNam:manage'), (req, res) => {
        const condition = req.query.condition || {};
        condition.isDelete = 0;
        app.model.tccbKhungDanhGiaDonVi.getAll(condition, 'id,nam,parentId,noiDung,thuTu', 'THU_TU ASC', (error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/danh-gia/cau-truc-khung-danh-gia-don-vi/item/:id', app.permission.check('tccbDanhGiaNam:manage'), (req, res) => {
        app.model.tccbKhungDanhGiaDonVi.get({ id: req.params.id, isDelete: 0 }, 'id,nam,parentId,noiDung,thuTu', null, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tccb/danh-gia/cau-truc-khung-danh-gia-don-vi', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        const newItem = req.body.item;
        app.model.tccbKhungDanhGiaDonVi.create(newItem, (error, item) => {
            delete item.isDelete;
            res.send({ error, item });
        });
    });

    app.put('/api/tccb/danh-gia/cau-truc-khung-danh-gia-don-vi', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        app.model.tccbKhungDanhGiaDonVi.update({ id: req.body.id, isDelete: 0 }, req.body.changes, (error, item) => {
            delete item.isDelete;
            res.send({ error, item });
        });
    });

    app.delete('/api/tccb/danh-gia/cau-truc-khung-danh-gia-don-vi', app.permission.check('tccbDanhGiaNam:delete'), async (req, res) => {
        try {
            const id = req.body.id;
            await Promise.all([
                app.model.tccbKhungDanhGiaDonVi.update({ parentId: id, isDelete: 0 }, { isDelete: 1 }),
                app.model.tccbKhungDanhGiaDonVi.update({ id, isDelete: 0 }, { isDelete: 1 })
            ]);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/tccb/danh-gia/cau-truc-khung-danh-gia-don-vi/thu-tu', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        let error = null;
        const changes = req.body.changes,
            updateOneChange = (index) => {
                if (index < changes.length) {
                    const item = changes[index];
                    if (item) {
                        app.model.tccbKhungDanhGiaDonVi.update({ id: item.id, isDelete: 0 }, { thuTu: item.thuTu }, err => {
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