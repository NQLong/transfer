module.exports = app => {
    app.get('/user/tccb/danh-gia-ca-nhan/:nam', app.permission.check('tccbDanhGiaNam:manage'), app.templates.admin);

    app.get('/api/tccb/danh-gia-ca-nhan/page/:pageNumber/:pageSize', app.permission.check('tccbDanhGiaNam:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                nam = parseInt(req.query.nam);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = await app.model.tccbDanhGiaCaNhanDangKy.searchPageDangKy(_pageNumber, _pageSize, searchTerm, nam);
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            res.send({ error });
        }
    });
};