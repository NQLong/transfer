module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.students,
        menus: { 6106: { title: 'Diện đóng BHYT', link: '/user/students/dien-dong-bhyt' } },
    };
    app.permission.add(
        { name: 'dmDienDongBhyt:read', menu },
        { name: 'dmDienDongBhyt:write' },
        { name: 'dmDienDongBhyt:delete' },
    );

    app.get('/user/students/dien-dong-bhyt', app.permission.check('dmDienDongBhyt:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/students/dien-dong-bhyt/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText OR lower(moTa) LIKE :searchText OR lower(soTien) LIKE :searchText OR lower(namHoc) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.svDmDienDongBhyt.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/students/dien-dong-bhyt/all', app.permission.check('dmDienDongBhyt:read'), (req, res) => {
        app.model.svDmDienDongBhyt.getAll({}, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/students/dien-dong-bhyt/item/:ma', app.permission.check('dmDienDongBhyt:read'), (req, res) => {
        app.model.svDmDienDongBhyt.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/students/dien-dong-bhyt', app.permission.check('dmDienDongBhyt:write'), (req, res) => {
        const newItem = req.body.dmDienDongBhyt;
        app.model.svDmDienDongBhyt.get({ ma: newItem.ma }, (error, item) => {
            if (item) {
                res.send({ error: { exist: true, message: 'Diện đóng BHYT ' + newItem.ma.toString() + ' đã tồn tại' } });
            } else if (error) {
                res.send({ error });
            } else {
                app.model.svDmDienDongBhyt.create(newItem, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/students/dien-dong-bhyt', app.permission.check('dmDienDongBhyt:write'), (req, res) => {
        app.model.svDmDienDongBhyt.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/students/dien-dong-bhyt/delete', app.permission.check('dmDienDongBhyt:delete'), (req, res) => {
        app.model.svDmDienDongBhyt.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};