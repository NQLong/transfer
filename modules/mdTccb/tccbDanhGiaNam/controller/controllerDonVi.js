module.exports = app => {
    app.get('/user/tccb/danh-gia/:nam/don-vi', app.permission.check('tccbDanhGiaNam:manage'), app.templates.admin);
    app.get('/user/tccb/danh-gia/:nam/don-vi/:ma', app.permission.check('tccbDanhGiaNam:manage'), app.templates.admin);

    app.get('/api/tccb/danh-gia/don-vi/page/:pageNumber/:pageSize', app.permission.check('tccbDanhGiaNam:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = await app.model.dmDonVi.searchPage(_pageNumber, _pageSize, searchTerm);
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list: list.filter(item => item.kichHoat == 1) } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/danh-gia/don-vi', app.permission.check('tccbDanhGiaNam:manage'), async (req, res) => {
        try {
            const nam = Number(req.query.nam), maDonVi = req.query.ma;
            const donVi = await app.model.dmDonVi.get({ ma: maDonVi });
            let danhGiaDonVis = await app.model.tccbKhungDanhGiaDonVi.getAll({ nam, isDelete: 0 });
            let dangKys = await app.model.tccbDonViDangKyNhiemVu.getAll({ nam, maDonVi });
            let items = danhGiaDonVis.filter(item => !item.parentId);
            items = items.map(item => danhGiaDonVis.filter(danhGia => danhGia.parentId == item.id));
            items = items.reduce((prev, cur) => prev.concat(cur));
            items = items.map(danhGiaDonVi => {
                const index = dangKys.findIndex(dangKy => dangKy.maKhungDanhGiaDonVi == danhGiaDonVi.id);
                if (index == -1) {
                    return {
                        noiDung: danhGiaDonVi.noiDung,
                        maKhungDanhGiaDonVi: danhGiaDonVi.id,
                        maDonVi,
                        nam,
                    };
                }
                return {
                    noiDung: danhGiaDonVi.noiDung,
                    ...dangKys[index]
                };
            });
            res.send({ items, donVi: donVi.ten });
        } catch (error) {
            res.send({ error });
        }
    });
};