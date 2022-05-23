module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            9013: { title: 'Tổ hợp thi', groupIndex: 2, link: '/user/danh-muc/dao-tao/to-hop-thi' },
        },
    };
    app.permission.add(
        { name: 'dmSvToHopTs:read', menu },
        { name: 'dmSvToHopTs:write' },
        { name: 'dmSvToHopTs:delete' },
    );
    app.get('/user/danh-muc/dao-tao/to-hop-thi', app.permission.check('dmSvToHopTs:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/dao-tao/to-hop-thi/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        app.model.dmSvToHopTs.searchPage(pageNumber, pageSize, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/danh-muc/dao-tao/to-hop-thi/item/:id', app.permission.check('user:login'), (req, res) => {
        app.model.dmSvToHopTs.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/dao-tao/to-hop-thi', app.permission.check('dmSvToHopTs:write'), (req, res) => {
        app.model.dmSvToHopTs.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/dao-tao/to-hop-thi', app.permission.check('dmSvToHopTs:write'), (req, res) => {
        const changes = req.body.changes || {};
        app.model.dmSvToHopTs.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/danh-muc/dao-tao/to-hop-thi', app.permission.check('dmSvToHopTs:delete'), (req, res) => {
        app.model.dmSvToHopTs.delete({ id: req.body.id }, errors => res.send({ errors }));
    });
};