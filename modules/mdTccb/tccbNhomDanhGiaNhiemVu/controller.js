module.exports = app => {
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/nhom-danh-gia-nhiem-vu/page/:pageNumber/:pageSize', app.permission.check('tccbDanhGiaNam:manage'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition || {};
        app.model.tccbNhomDanhGiaNhiemVu.getPage(pageNumber, pageSize, condition, '*', 'nam DESC, thuTu ASC', (error, page) => res.send({ error, page }));
    });

    app.get('/api/tccb/nhom-danh-gia-nhiem-vu/all', app.permission.check('tccbDanhGiaNam:manage'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.tccbNhomDanhGiaNhiemVu.getAll(condition, '*', 'nam DESC, thuTu ASC', (error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/nhom-danh-gia-nhiem-vu/item/:id', app.permission.check('tccbDanhGiaNam:manage'), (req, res) => {
        app.model.tccbNhomDanhGiaNhiemVu.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tccb/nhom-danh-gia-nhiem-vu', app.permission.check('tccbDanhGiaNam:write'), async (req, res) => {
        try {
            const newItem = req.body.item;
            const items = await app.model.tccbNhomDanhGiaNhiemVu.getAll({ nam: Number(newItem.nam) });
            const thuTu = items.length != 0 ? Math.max(...items.map(item => item.thuTu)) : 0;
            const item = await app.model.tccbNhomDanhGiaNhiemVu.create({ ...newItem, thuTu: thuTu + 1 });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }

    });

    app.put('/api/tccb/nhom-danh-gia-nhiem-vu', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        app.model.tccbNhomDanhGiaNhiemVu.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/tccb/nhom-danh-gia-nhiem-vu', app.permission.check('tccbDanhGiaNam:delete'), async (req, res) => {
        try {
            const id = req.body.id;
            await Promise.all([
                app.model.tccbDinhMucCongViecGvVaNcv.delete({ idNhom: id }),
                app.model.tccbNhomDanhGiaNhiemVu.delete({ id }),
            ]);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/tccb/nhom-danh-gia-nhiem-vu/thu-tu', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        let id = Number(req.body.id),
            thuTu = Number(req.body.thuTu),
            nam = Number(req.body.nam);
        if (id && thuTu) {
            app.model.tccbNhomDanhGiaNhiemVu.get({ id }, (error, item) => {
                if (item) {
                    const isUp = item.thuTu > thuTu ? 1 : 0;
                    app.model.tccbNhomDanhGiaNhiemVu.updateThuTu(id, thuTu, isUp, nam, error => res.send({ error }));
                } else {
                    res.send({ error });
                }
            });
        } else {
            res.send({ error: 'Invalid parameters!' });
        }
    });
};