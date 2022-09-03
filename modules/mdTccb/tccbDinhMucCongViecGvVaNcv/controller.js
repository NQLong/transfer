module.exports = app => {
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // app.get('/api/tccb/danh-gia/dinh-muc-cong-viec-gv-va-ncv/page/:pageNumber/:pageSize', app.permission.check('tccbDanhGiaNam:manage'), (req, res) => {
    //     const pageNumber = parseInt(req.params.pageNumber),
    //         pageSize = parseInt(req.params.pageSize),
    //         condition = req.query.condition || {};
    //     app.model.tccbDiemTru.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    // });

    app.get('/api/tccb/danh-gia/dinh-muc-cong-viec-gv-va-ncv/all', app.permission.check('tccbDanhGiaNam:manage'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.tccbDinhMucCongViecGvVaNcv.getAll(condition, '*', 'id', (error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/danh-gia/dinh-muc-cong-viec-gv-va-ncv/all-by-year', app.permission.check('tccbDanhGiaNam:manage'), async (req, res) => {
        try {
            const nam = req.query.nam || '';
            const items = await app.model.tccbDinhMucCongViecGvVaNcv.getAllByYear(nam);
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/danh-gia/dinh-muc-cong-viec-gv-va-ncv/item/:id', app.permission.check('tccbDanhGiaNam:manage'), (req, res) => {
        app.model.tccbDinhMucCongViecGvVaNcv.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tccb/danh-gia/dinh-muc-cong-viec-gv-va-ncv', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        const newItem = req.body.item;
        app.model.tccbDinhMucCongViecGvVaNcv.create(newItem, (error, item) => {
            res.send({ error, item });
        });
    });

    app.put('/api/tccb/danh-gia/dinh-muc-cong-viec-gv-va-ncv', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        app.model.tccbDinhMucCongViecGvVaNcv.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/tccb/danh-gia/dinh-muc-cong-viec-gv-va-ncv', app.permission.check('tccbDanhGiaNam:delete'), (req, res) => {
        app.model.tccbDinhMucCongViecGvVaNcv.delete({ id: req.body.id }, error => res.send({ error }));
    });

    app.get('/api/tccb/danh-gia/ngach-cdnn-va-chuc-danh-khoa-hoc/all', app.permission.check('tccbDanhGiaNam:manage'), async (req, res) => {
        try {
            const condition = req.query.condition;
            let items = await Promise.all([
                app.model.dmChucDanhKhoaHoc.getAll({ kichHoat: 1 }),
                app.model.dmNgachCdnn.getAll({ kichHoat: 1 }),
            ]);
            items = items.reduce((prev, curr) => prev.concat(curr));
            if (condition) {
                items = items.filter(item => item.ten.toLowerCase().includes(condition.toLowerCase()));
            }
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/danh-gia/ngach-cdnn-va-chuc-danh-khoa-hoc/item/:ma', app.permission.check('tccbDanhGiaNam:manage'), async (req, res) => {
        try {
            const ma = req.params.ma;
            let items = await Promise.all([
                app.model.dmChucDanhKhoaHoc.get({ ma, kichHoat: 1 }),
                app.model.dmNgachCdnn.get({ ma, kichHoat: 1 }),
            ]);
            let result = items[0] ? items[0] : items[1];
            res.send({ result });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/tccb/danh-gia/dinh-muc-cong-viec-gv-va-ncv/thu-tu', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        let id = parseInt(req.body.id),
            thuTu = parseInt(req.body.thuTu),
            idNhom = parseInt(req.body.idNhom);
        if (id && thuTu) {
            app.model.tccbDinhMucCongViecGvVaNcv.get({ id }, (error, item) => {
                if (item) {
                    const isUp = item.thuTu > thuTu ? 1 : 0;
                    app.model.tccbDinhMucCongViecGvVaNcv.updateThuTu(id, thuTu, isUp, idNhom, error => res.send({ error }));
                } else {
                    res.send({ error });
                }
            });
        } else {
            res.send({ error: 'Invalid parameters!' });
        }
    });
};