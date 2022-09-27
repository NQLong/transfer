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
            let danhGiaDonVis = await app.model.tccbKhungDanhGiaDonVi.getAll({ nam, isDelete: 0 }, '*', 'THU_TU ASC');
            let dangKys = await app.model.tccbDonViDangKyNhiemVu.getAll({ nam, maDonVi }, 'id,dangKyKpi,dienGiai,maKhungDanhGiaDonVi,maDonVi,nam');
            let items = danhGiaDonVis.filter(item => !item.parentId);
            danhGiaDonVis = danhGiaDonVis.filter(item => item.parentId).map(item => {
                const index = dangKys.findIndex(dangKy => dangKy.maKhungDanhGiaDonVi == item.id);
                if (index == -1) {
                    return {
                        noiDung: item.noiDung,
                        maKhungDanhGiaDonVi: item.id,
                        parentId: item.parentId,
                        maDonVi,
                        nam,
                    };
                }
                return {
                    parentId: item.parentId,
                    noiDung: item.noiDung,
                    ...dangKys[index]
                };
            });
            items = items.map(item => ({ ...item, submenus: danhGiaDonVis.filter(danhGia => danhGia.parentId == item.id) }));
            res.send({ items, donVi: donVi.ten });
        } catch (error) {
            res.send({ error });
        }
    });
};