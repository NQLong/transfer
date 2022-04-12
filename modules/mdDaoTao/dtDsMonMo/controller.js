
module.exports = app => {
    // const menu = {
    //   parentMenu: app.parentMenu.daoTao,
    //   menus: {
    //     7002: { title: 'Danh sách môn học mở trong học kỳ', link: '/user/dao-tao/danh-sach-mon-mo', icon: 'fa-calendar', backgroundColor: '#1ca474' },
    //   },
    // };
    // app.permission.add(
    //   { name: 'dtDsMonMo:read', menu },
    //   { name: 'dtDsMonMo:readAll', menu },
    //   { name: 'manager:read', menu },
    //   { name: 'dtDsMonMo:write' },
    //   { name: 'dtDsMonMo:delete' },
    // );

    app.get('/user/dao-tao/danh-sach-mon-mo', app.permission.orCheck('dtDsMonMo:read', 'dtDsMonMo:readAll', 'manager:read'), app.templates.admin);
    app.get('/user/dao-tao/danh-sach-mon-mo/:id', app.permission.orCheck('dtDsMonMo:read', 'dtDsMonMo:readAll', 'manager:read'), app.templates.admin);

    //APIs-----------------------------------------------------------------------------------------------------------------------------------------------------
    const checkDaoTaoPermission = (req, res, next) => app.isDebug ? next() : app.permission.orCheck('dtDsMonMo:read', 'dtDsMonMo:readAll', 'manager:read')(req, res, next);

    app.get('/api/dao-tao/danh-sach-mon-mo/page/:pageNumber/:pageSize', checkDaoTaoPermission, (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const filter = JSON.stringify(req.query.filter || {}),
            donVi = req.query.donVi || 'all';

        app.model.dtDsMonMo.searchPage(pageNumber, pageSize, donVi, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/dao-tao/danh-sach-mon-mo/:donVi/:id', checkDaoTaoPermission, (req, res) => {
        let donVi = parseInt(req.params.donVi),
            id = parseInt(req.params.id);
        app.model.dmMonHoc.getAll({ boMon: donVi }, (error, items) => {
            if (error || !items) res.send({ error });
            else {
                let result = [];
                items.forEach((subject, index, list) => {
                    app.model.dtDsMonMo.get({ monHoc: subject.ma, id }, (error, monDk) => {
                        if (!error && monDk) {
                            subject.isOpen = 1;
                        }
                        result.push(subject);
                        if (index === list.length - 1) {
                            res.send({ items: result });
                        }
                    });
                });
            }
        });
    });
};