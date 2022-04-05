module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            2042: { title: 'Ngạch lương', link: '/user/danh-muc/ngach-luong' },
        },
    };
    app.permission.add({ name: 'dmNgachLuong:read', menu }, { name: 'dmNgachLuong:write' }, { name: 'dmNgachLuong:delete' },);
    app.get('/user/danh-muc/ngach-luong', app.permission.check('dmNgachLuong:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/ngach-luong/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmNgachLuong.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/ngach-luong/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmNgachCdnn.getAll({}, '*', 'ma', (error, items) => {
            if (items == null) items = [];
            const solve = (index) => {
                if (index < items.length) {
                    app.model.dmNgachLuong.getAll({ idNgach: items[index].id }, '*', 'bac', (error, luongs) => {
                        items[index].luongs = luongs || [];
                        solve(index + 1);
                    });
                } else {
                    res.send({ error, items });
                }
            };
            solve(0);
        });
    });

    app.get('/api/danh-muc/ngach-luong/item/:bac/:idNgach', app.permission.check('user:login'), (req, res) => {
        app.model.dmNgachLuong.get({ bac: req.params.bac, idNgach: req.params.idNgach }, (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/bac-luong/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        Object.keys(condition).forEach(key => condition[key] === '' ? (condition[key] = null) : '');
        app.model.dmNgachLuong.getAll({}, '*', 'bac', (error, items) => res.send({ error, items }));
    });
    app.get('/api/danh-muc/max-bac-luong/:idNgach', app.permission.check('user:login'), (req, res) => {
        const idNgach = req.params.idNgach;
        app.model.dmNgachLuong.getAll({ idNgach: idNgach }, '*', 'bac', (error, items) => {
            res.send({ error, item: items[items.length - 1] });
        });
    });

    app.get('/api/danh-muc/filter-bac-luong/:idNgach', app.permission.check('user:login'), (req, res) => {
        let idNgach = req.params.idNgach;
        const condition = req.query.condition || {
            statement: 'idNgach =:idNgach',
            parameter: { idNgach }
        };
        app.model.dmNgachLuong.getAll(condition, '*', 'bac', (error, items) => res.send({ error, items }));
    });

    app.post('/api/danh-muc/ngach-luong', app.permission.check('dmNgachLuong:write'), (req, res) => {
        app.model.dmNgachLuong.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/ngach-luong', app.permission.check('dmNgachLuong:write'), (req, res) => {
        const { idNgach, bac, changes } = req.body;
        app.model.dmNgachLuong.update({ idNgach, bac }, changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/ngach-luong', app.permission.check('dmNgachLuong:delete'), (req, res) => {
        const { idNgach, bac } = req.body;
        app.model.dmNgachLuong.delete({ idNgach, bac }, error => res.send({ error }));
    });
};