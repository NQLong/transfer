module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            2113: { title: 'Khen thưởng chú thích', link: '/user/danh-muc/khen-thuong-chu-thich' },
        },
    };
    app.permission.add(
        { name: 'dmKhenThuongChuThich:read', menu },
        { name: 'dmKhenThuongChuThich:write' },
        { name: 'dmKhenThuongChuThich:delete' },
    );
    app.get('/user/danh-muc/khen-thuong-chu-thich', app.permission.check('dmKhenThuongChuThich:read'), app.templates.admin);
    app.get('/user/danh-muc/khen-thuong-chu-thich/upload', app.permission.check('staff:login'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/khen-thuong-chu-thich/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmKhenThuongChuThich.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/khen-thuong-chu-thich/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmKhenThuongChuThich.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.post('/api/danh-muc/khen-thuong-chu-thich', app.permission.check('dmKhenThuongChuThich:write'), (req, res) => {
        let newData = req.body.item;
        newData.phuCap = newData.phuCap ? parseFloat(newData.phuCap).toFixed(2) : null;
        newData.kichHoat = newData.kichHoat ? parseInt(newData.kichHoat) : null;
        app.model.dmKhenThuongChuThich.create(newData, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/khen-thuong-chu-thich', app.permission.check('dmKhenThuongChuThich:write'), (req, res) => {
        let changes = app.clone(req.body.changes);
        app.model.dmKhenThuongChuThich.update({ ma: req.body.ma }, changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/khen-thuong-chu-thich', app.permission.check('dmKhenThuongChuThich:delete'), (req, res) => {
        app.model.dmKhenThuongChuThich.delete({ ma: req.body.ma }, error => res.send({ error }));
    });

    app.post('/api/danh-muc/khen-thuong-chu-thich/multiple', app.permission.check('dmKhenThuongChuThich:write'), (req, res) => {
        const isOverride = req.body.isOverride;
        const data = req.body.dmKhenThuongChuThich;
        const dataImported = [];
        const handleCreate = index => {
            if (index >= data.length) {
                res.send({ data: { message: 'Upload success', items: dataImported } });
            } else {
                app.model.dmKhenThuongChuThich.get({ ma: data[index].ma }, (error, item) => {
                    let currentDate = data[index];
                    currentDate.phuCap = currentDate.phuCap ? parseFloat(currentDate.phuCap).toFixed(2) : null;
                    currentDate.kichHoat = currentDate.kichHoat ? parseInt(currentDate.kichHoat) : null;
                    if (error) {
                        res.send({ error });
                    } else if (item) {
                        if (isOverride == 'TRUE') {
                            app.model.dmKhenThuongChuThich.update({ ma: data[index].ma }, currentDate, (error, item) => {
                                if (error) {
                                    res.send({ error });
                                } else {
                                    dataImported.push(item);
                                    handleCreate(index + 1);
                                }
                            });
                        } else {
                            handleCreate(index + 1);
                        }
                    } else {
                        app.model.dmKhenThuongChuThich.create(currentDate, (error, item) => {
                            if (error) {
                                res.send({ error });
                            } else {
                                dataImported.push(item);
                                handleCreate(index + 1);
                            }
                        });
                    }
                });
            }
        };
        handleCreate(0);
    });

};