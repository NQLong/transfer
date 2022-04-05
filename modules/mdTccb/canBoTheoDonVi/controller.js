module.exports = app => {
    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1021: { title: 'Danh sách nhân sự đơn vị', link: '/user/nhan-su-don-vi', icon: 'fa-user-circle-o', backgroundColor: '#e30000', pin: true },
        },
    };

    app.permission.add(
        { name: 'manager:read', menu: menuStaff },
        { name: 'manager:write' }
    );
    app.get('/user/nhan-su-don-vi', app.permission.check('manager:read'), app.templates.admin);

    //Manager hook -------------------------------------------------------------------------------------------------

    //Check role managers
    app.permissionHooks.add('staff', 'manager', user => new Promise(resolve => {
        user.staff.donViQuanLy = app.initManager(user, '013', '005', '003', '016', '009', '007');
        user.staff.donViQuanLy.length && app.permissionHooks.pushUserPermission(user, 'manager:read', 'manager:write');
        resolve();
    }));

    app.get('/api/nhan-su-don-vi', app.permission.check('manager:read'), (req, res) => {
        let listDonVi = req.query.listDonVi || [],
            condition = {
                statement: 'maDonVi IN (:listDonVi)',
                parameter: { listDonVi }
            };
        listDonVi.length ? app.model.canBo.getAll(condition, 'shcc,ho,ten,email,dienThoaiCaNhan,ngach,maDonVi,ngayNghi', 'ten', (error, items) => {
            if (error || !items) res.send({ error });
            else if (listDonVi.includes('30')) {
                let result = [];
                items.forEach((tccbStaff, index, list) =>
                    app.model.tccbStaffLog.get({ email: tccbStaff.email }, (error, tccbLog) => {
                        if (error) {
                            res.send({ error });
                        } else {
                            app.model.dmNgachCdnn.get({ ma: tccbStaff.ngach }, (error, ngachCDNN) => {
                                if (!error && ngachCDNN) {
                                    tccbStaff = app.clone(tccbStaff, { tccbLog, tenNgach: ngachCDNN.ten });
                                    result.push(tccbStaff);
                                    if (index === list.length - 1) res.send({ error, items: result });
                                }
                            });
                        }
                    }
                    ));
            } else {
                res.send({ error, items });
            }
        }) : res.send({ items: [] });
    });
};