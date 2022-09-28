module.exports = app => {
    app.get('/api/tccb/danh-gia-hoi-dong-don-vi/all-by-year', app.permission.check('tccbDanhGiaNam:manage'), (req, res) => {
        const nam = parseInt(req.query.nam);
        app.model.tccbDanhGiaHoiDongCapDonVi.getAllByYear(nam, '', (error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/danh-gia-hoi-dong-don-vi/item/:id', app.permission.check('tccbDanhGiaNam:manage'), (req, res) => {
        app.model.tccbDanhGiaHoiDongCapDonVi.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tccb/danh-gia-hoi-dong-don-vi', app.permission.check('tccbDanhGiaNam:write'), async (req, res) => {
        try {
            const newItem = req.body.item;
            let item = await app.model.tccbDanhGiaHoiDongCapDonVi.get({ shcc: newItem.shcc, nam: newItem.nam });
            if (item) {
                throw 'Thành viên đã tồn tại trong hội đồng';
            }
            item = await app.model.tccbDanhGiaHoiDongCapDonVi.create(newItem);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/tccb/danh-gia-hoi-dong-don-vi', app.permission.check('tccbDanhGiaNam:write'), async (req, res) => {
        try {
            const changes = req.body.changes;
            let item = await app.model.tccbDanhGiaHoiDongCapDonVi.get({ shcc: changes.shcc, nam: changes.nam });
            if (item && item.id != req.body.id) {
                throw 'Thành viên đã tồn tại trong hội đồng';
            }
            item = await app.model.tccbDanhGiaHoiDongCapDonVi.update({ id: req.body.id }, req.body.changes);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/tccb/danh-gia-hoi-dong-don-vi', app.permission.check('tccbDanhGiaNam:delete'), (req, res) => {
        app.model.tccbDanhGiaHoiDongCapDonVi.delete({ id: req.body.id }, error => res.send({ error }));
    });
};