module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            531: { title: 'Công văn đi', link: '/user/hcth/cong-van-di', icon: 'fa-caret-square-o-left', backgroundColor: '#00aa00' },
        },
    };
    app.permission.add(
        { name: 'hcthCongVanDi:read', menu},
        { name: 'hcthCongVanDi:write'},
        { name: 'hcthCongVanDi:delete'},
        { name: 'staff:login'});
    app.get('/user/hcth/cong-van-di', app.permission.check('staff:login'), app.templates.admin);
    
    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/hcth/cong-van-di/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { donViGui, donViNhan} = (req.query.filter && req.query.filter != '%%%%%%') ? req.query.filter : { donViGui: null, donViNhan: null};
        app.model.hcthCongVanDi.searchPage(pageNumber, pageSize, donViGui, donViNhan, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });
    
    app.get('/api/hcth/cong-van-di/all', app.permission.check('staff:login'), (req, res) => {
        app.model.hcthCongVanDi.getAll((error, items) => res.send({ error, items }));
    });
    
    app.get('/api/hcth/cong-van-di/item/:id', app.permission.check('staff:login'), (req, res) => {
        app.model.hcthCongVanDi.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/hcth/cong-van-di', app.permission.check('staff:login'), (req, res) => {
        console.log(req.body);
        app.model.hcthCongVanDi.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/hcth/cong-van-di', app.permission.check('hcthCongVanDi:write'), (req, res) => {
        app.model.hcthCongVanDi.update({ id: req.body.id }, req.body.changes, (errors, items) => res.send({ errors, items }));
    });

    app.delete('/api/hcth/cong-van-di', app.permission.check('hcthCongVanDi:delete'), (req, res) => {
        app.model.hcthCongVanDi.delete({ id: req.body.id }, errors => res.send({ errors }));
    });
};    

