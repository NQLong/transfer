module.exports = app => {
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/danh-gia/nhom-danh-gia-nhiem-vu/page/:pageNumber/:pageSize', app.permission.check('tccbDanhGiaNam:manage'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition || {};
        app.model.tccbNhomDanhGiaNhiemVu.getPage(pageNumber, pageSize, condition, '*', 'nam DESC, thuTu ASC', (error, page) => res.send({ error, page }));
    });

    app.get('/api/tccb/danh-gia/nhom-danh-gia-nhiem-vu/all', app.permission.orCheck('tccbDanhGiaNam:manage', 'president:login'), async (req, res) => {
        try {
            let _condition = req.query.condition || {};
            const condition = {
                statement: 'lower(ten) LIKE :searchText AND nam = :nam',
                parameter: {
                    searchText: `%${_condition.searchText || ''}%`,
                    nam: _condition.nam
                }
            };
            const items = await app.model.tccbNhomDanhGiaNhiemVu.getAll(condition, '*', 'nam DESC, thuTu ASC');
            if (_condition.searchText === undefined || 'Chưa đăng ký'.toLowerCase().includes(_condition.searchText.toLowerCase())) {
                items.unshift({ id: -2, ten: 'Chưa đăng ký' });
            }
            if (_condition.searchText === undefined || 'Tất cả'.toLowerCase().includes(_condition.searchText.toLowerCase())) {
                items.unshift({ id: -1, ten: 'Tất cả' });
            }
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }

    });

    app.get('/api/tccb/danh-gia/nhom-danh-gia-nhiem-vu/item/:id', app.permission.orCheck('tccbDanhGiaNam:manage', 'president:login'), (req, res) => {
        app.model.tccbNhomDanhGiaNhiemVu.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tccb/danh-gia/nhom-danh-gia-nhiem-vu', app.permission.check('tccbDanhGiaNam:write'), async (req, res) => {
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

    app.put('/api/tccb/danh-gia/nhom-danh-gia-nhiem-vu', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        app.model.tccbNhomDanhGiaNhiemVu.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/tccb/danh-gia/nhom-danh-gia-nhiem-vu', app.permission.check('tccbDanhGiaNam:delete'), async (req, res) => {
        try {
            const id = req.body.id;
            let count = await app.model.tccbDanhGiaCaNhanDangKy.count({ idNhomDangKy: id, dangKy: 1 });
            count = count.rows[0]['COUNT(*)'];
            if (count > 0) {
                res.send({ error: 'Nhóm đã có thông tin đăng ký, không thể xoá' });
            } else {
                await Promise.all([
                    app.model.tccbDanhGiaCaNhanDangKy.delete({ idNhomDangKy: id, dangKy: 0 }),
                    app.model.tccbDinhMucCongViecGvVaNcv.delete({ idNhom: id }),
                    app.model.tccbNhomDanhGiaNhiemVu.delete({ id }),
                ]);
                res.end();
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/tccb/danh-gia/nhom-danh-gia-nhiem-vu/thu-tu', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
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