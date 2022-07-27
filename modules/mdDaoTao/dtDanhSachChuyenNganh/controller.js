module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7005: {
                title: 'Danh sách chuyên ngành', groupIndex: 0,
                icon: 'fa-sitemap', backgroundColor: '#5C4732',
                link: '/user/dao-tao/danh-sach-chuyen-nganh'
            },
        },
    };

    app.permission.add(
        { name: 'dtDanhSachChuyenNganh:read', menu },
        { name: 'dtChuongTrinhDaoTao:manage', menu },
        { name: 'dtDanhSachChuyenNganh:write' },
        { name: 'dtDanhSachChuyenNganh:delete' },
    );

    app.get('/user/dao-tao/danh-sach-chuyen-nganh', app.permission.orCheck('dtDanhSachChuyenNganh:read', 'dtChuongTrinhDaoTao:manage'), app.templates.admin);

    const checkDaoTaoPermission = (req, res, next) => app.isDebug ? next() : app.permission.orCheck('dtDanhSachChuyenNganh:read', 'dtChuongTrinhDaoTao:manage')(req, res, next);

    //APIs -------------------------------------------------------------------------------------------------------
    app.get('/api/dao-tao/danh-sach-chuyen-nganh/page/:pageNumber/:pageSize', checkDaoTaoPermission, (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';

        let filter = req.query.filter || {},
            donVi = filter.donVi,
            idNamDaoTao = filter.idNamDaoTao;

        filter = app.stringify(app.clone(filter, { donVi, idNamDaoTao }));

        app.model.dtDanhSachChuyenNganh.searchPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });

    });

    app.get('/api/dao-tao/danh-sach-chuyen-nganh/item/:id', app.permission.orCheck('dtNganhDaoTao:read', 'dtChuongTrinhDaoTao:manage'), (req, res) => {
        app.model.dtDanhSachChuyenNganh.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/dao-tao/danh-sach-chuyen-nganh', app.permission.orCheck('dtNganhDaoTao:write', 'manager:write'), (req, res) => {
        app.model.dtDanhSachChuyenNganh.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/dao-tao/danh-sach-chuyen-nganh', app.permission.orCheck('dtNganhDaoTao:write', 'manager:write'), (req, res) => {
        const changes = req.body.changes || {};
        app.model.dtDanhSachChuyenNganh.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/dao-tao/danh-sach-chuyen-nganh', app.permission.orCheck('dtNganhDaoTao:delete', 'manager:write'), (req, res) => {
        app.model.dtDanhSachChuyenNganh.delete({ id: req.body.id }, errors => res.send({ errors }));
    });

};

