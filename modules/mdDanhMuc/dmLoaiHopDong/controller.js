module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            2023: { title: 'Loại hợp đồng', link: '/user/danh-muc/loai-hop-dong' },
        },
    };
    app.permission.add(
        { name: 'dmLoaiHopDong:read', menu },
        { name: 'dmLoaiHopDong:write' },
        { name: 'dmLoaiHopDong:delete' }
    );
    app.get('/user/danh-muc/loai-hop-dong', app.permission.check('dmLoaiHopDong:read'), app.templates.admin);

    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/loai-hop-dong/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmLoaiHopDong.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/danh-muc/loai-hop-dong/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmLoaiHopDong.getAll(condition, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/loai-hop-dong/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmLoaiHopDong.get(req.params.ma, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/loai-hop-dong', app.permission.check('dmLoaiHopDong:write'), (req, res) => {
        app.model.dmLoaiHopDong.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/loai-hop-dong', app.permission.check('dmLoaiHopDong:write'), (req, res) => {
        app.model.dmLoaiHopDong.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/loai-hop-dong', app.permission.check('dmLoaiHopDong:delete'), (req, res) => {
        app.model.dmLoaiHopDong.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};