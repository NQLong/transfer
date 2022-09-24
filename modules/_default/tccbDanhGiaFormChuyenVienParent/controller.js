module.exports = app => {
    app.get('/api/tccb/danh-gia-form-chuyen-vien/all-by-year', app.permission.check('tccbDanhGiaNam:manage'), async (req, res) => {
        try {
            const nam = req.query.nam || '';
            const items = await app.model.tccbDanhGiaFormChuyenVienParent.getAllByYear(nam);
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/tccb/danh-gia-form-chuyen-vien-parent', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        const newItem = req.body.item;
        app.model.tccbDanhGiaFormChuyenVienParent.create(newItem, (error, item) => {
            res.send({ error, item });
        });
    });

    app.put('/api/tccb/danh-gia-form-chuyen-vien-parent', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        app.model.tccbDanhGiaFormChuyenVienParent.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/tccb/danh-gia-form-chuyen-vien-parent', app.permission.check('tccbDanhGiaNam:delete'), async (req, res) => {
        try {
            await Promise.all([
                app.model.tccbDanhGiaFormChuyenVienParent.delete({ id: req.body.id }),
                app.model.tccbDanhGiaFormChuyenVienChild.delete({ parentId: req.body.id })
            ]);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/tccb/danh-gia-form-chuyen-vien-parent/thu-tu', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        let id = parseInt(req.body.id),
            thuTu = parseInt(req.body.thuTu),
            nam = parseInt(req.body.nam);
        if (id && thuTu) {
            app.model.tccbDanhGiaFormChuyenVienParent.get({ id }, (error, item) => {
                if (item) {
                    const isUp = item.thuTu > thuTu ? 1 : 0;
                    app.model.tccbDanhGiaFormChuyenVienParent.ganThuTu(id, thuTu, isUp, nam, error => res.send({ error }));
                } else {
                    res.send({ error });
                }
            });
        } else {
            res.send({ error: 'Invalid parameters!' });
        }
    });

    app.post('/api/tccb/danh-gia-form-chuyen-vien-child', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        const newItem = req.body.item;
        app.model.tccbDanhGiaFormChuyenVienChild.create(newItem, (error, item) => {
            res.send({ error, item });
        });
    });

    app.put('/api/tccb/danh-gia-form-chuyen-vien-child', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        app.model.tccbDanhGiaFormChuyenVienChild.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/tccb/danh-gia-form-chuyen-vien-child', app.permission.check('tccbDanhGiaNam:delete'), (req, res) => {
        app.model.tccbDanhGiaFormChuyenVienChild.delete({ id: req.body.id }, error => res.send({ error }));
    });
};