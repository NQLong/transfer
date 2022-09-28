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

    app.put('/api/tccb/danh-gia-form-chuyen-vien-parent', app.permission.check('tccbDanhGiaNam:write'), async (req, res) => {
        try {
            const id = req.body.id, changes = req.body.changes;
            const listChild = await app.model.tccbDanhGiaFormChuyenVienChild.getAll({ parentId: id });
            if (listChild.length > 0 && changes.loaiCongViec == 1) {
                throw 'Đã có thông tin, không thể đổi loại công việc';
            }
            let sum = listChild.reduce((prev, cur) => Number(prev) + Number(cur.diemLonNhat), 0);
            if (sum > changes.diemLonNhat) {
                throw 'Điểm tiêu chí đánh giá phải lớn hơn tổng điểm các nội dung';
            }
            let item = await app.model.tccbDanhGiaFormChuyenVienParent.update({ id }, changes, (error, item) => res.send({ error, item }));
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
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

    app.post('/api/tccb/danh-gia-form-chuyen-vien-child', app.permission.check('tccbDanhGiaNam:write'), async (req, res) => {
        try {
            const newItem = req.body.item;
            const [parentItem, listChild] = await Promise.all([
                app.model.tccbDanhGiaFormChuyenVienParent.get({ id: newItem.parentId }),
                app.model.tccbDanhGiaFormChuyenVienChild.getAll({ parentId: newItem.parentId })
            ]);
            if (!parentItem) {
                //Tránh không có parent mà đã tạo child
                throw 'Lỗi không xác định';
            }
            let sum = listChild.reduce((prev, cur) => Number(prev) + Number(cur.diemLonNhat), 0);
            if (parentItem.loaiCongViec == 0 && parentItem.diemLonNhat < sum + Number(newItem.diemLonNhat)) {
                throw 'Tổng điểm các nội dung không được lớn hơn tiêu chí đánh giá';
            }
            const item = await app.model.tccbDanhGiaFormChuyenVienChild.create(newItem);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }

    });

    app.put('/api/tccb/danh-gia-form-chuyen-vien-child', app.permission.check('tccbDanhGiaNam:write'), async (req, res) => {
        try {
            const id = req.body.id, changes = req.body.changes;
            let item = await app.model.tccbDanhGiaFormChuyenVienChild.get({ id });
            let [parentItem, listChild] = await Promise.all([
                app.model.tccbDanhGiaFormChuyenVienParent.get({ id: item.parentId }),
                app.model.tccbDanhGiaFormChuyenVienChild.getAll({ parentId: item.parentId })
            ]);
            if (!parentItem) {
                //Tránh không có parent mà đã sửa child
                throw 'Lỗi không xác định';
            }
            listChild = listChild.filter(item => item.id != id);
            let sum = listChild.reduce((prev, cur) => Number(prev) + Number(cur.diemLonNhat), 0);
            if (parentItem.loaiCongViec == 0 && parentItem.diemLonNhat < sum + Number(changes.diemLonNhat)) {
                throw 'Tổng điểm các nội dung không được lớn hơn tiêu chí đánh giá';
            }
            item = await app.model.tccbDanhGiaFormChuyenVienChild.update({ id }, changes);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/tccb/danh-gia-form-chuyen-vien-child', app.permission.check('tccbDanhGiaNam:delete'), (req, res) => {
        app.model.tccbDanhGiaFormChuyenVienChild.delete({ id: req.body.id }, error => res.send({ error }));
    });
};