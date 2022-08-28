module.exports = app => {
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // app.get('/api/tccb/dinh-muc-cong-viec-gv-va-ncv/page/:pageNumber/:pageSize', app.permission.check('tccbDanhGiaNam:manage'), (req, res) => {
    //     const pageNumber = parseInt(req.params.pageNumber),
    //         pageSize = parseInt(req.params.pageSize),
    //         condition = req.query.condition || {};
    //     app.model.tccbDiemTru.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    // });

    app.get('/api/tccb/dinh-muc-cong-viec-gv-va-ncv/all', app.permission.check('tccbDanhGiaNam:manage'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.tccbDinhMucCongViecGvVaNcv.getAll(condition, '*', 'id', (error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/dinh-muc-cong-viec-gv-va-ncv/allByYear', app.permission.check('tccbDanhGiaNam:manage'), async (req, res) => {
        try {
            const nam = req.query.nam || '';
            const items = await app.model.tccbDinhMucCongViecGvVaNcv.getAllByYear(nam);
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/dinh-muc-cong-viec-gv-va-ncv/item/:id', app.permission.check('tccbDanhGiaNam:manage'), (req, res) => {
        app.model.tccbDinhMucCongViecGvVaNcv.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tccb/dinh-muc-cong-viec-gv-va-ncv', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        const newItem = req.body.item;
        app.model.tccbDinhMucCongViecGvVaNcv.create(newItem, (error, item) => {
            res.send({ error, item });
        });
    });

    app.put('/api/tccb/dinh-muc-cong-viec-gv-va-ncv', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        app.model.tccbDinhMucCongViecGvVaNcv.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/tccb/dinh-muc-cong-viec-gv-va-ncv', app.permission.check('tccbDanhGiaNam:delete'), (req, res) => {
        app.model.tccbDinhMucCongViecGvVaNcv.delete({ id: req.body.id }, error => res.send({ error }));
    });

    app.get('/api/tccb/ngach-cdnn-va-chuc-danh-khoa-hoc/all', app.permission.check('tccbDanhGiaNam:manage'), async (req, res) => {
        try {
            let items = await Promise.all([
                app.model.dmChucDanhKhoaHoc.getAll(),
                app.model.dmNgachCdnn.getAll(),
            ]);
            items = items.reduce((prev, curr) => prev.concat(curr));
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });
};