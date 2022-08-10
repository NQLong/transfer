module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7012: {
                title: 'Cấu trúc khung CTĐT', pin: true,
                link: '/user/dao-tao/cau-truc-khung-dao-tao', icon: 'fa-cogs', backgroundColor: '#A84A48'
            },
        },
    };
    app.permission.add(
        { name: 'dtCauTrucKhungDaoTao:read', menu },
        { name: 'dtCauTrucKhungDaoTao:write' },
        { name: 'dtCauTrucKhungDaoTao:delete' },
    );
    app.permissionHooks.add('staff', 'addRolesDtCauTrucKhungDaoTao', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtCauTrucKhungDaoTao:read', 'dtCauTrucKhungDaoTao:write', 'dtCauTrucKhungDaoTao:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/dao-tao/cau-truc-khung-dao-tao', app.permission.check('dtCauTrucKhungDaoTao:read'), app.templates.admin);
    app.get('/user/dao-tao/cau-truc-khung-dao-tao/:ma', app.permission.check('dtCauTrucKhungDaoTao:write'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dao-tao/cau-truc-khung-dao-tao/page/:pageNumber/:pageSize', app.permission.orCheck('dtCauTrucKhungDaoTao:read', 'dtChuongTrinhDaoTao:manage'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition == 'string' ? req.query.condition : '';
        app.model.dtCauTrucKhungDaoTao.searchPage(pageNumber, pageSize, searchTerm, (error, result) => {
            if (error) res.send({ error });
            else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = result;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });

    app.get('/api/dao-tao/cau-truc-khung-dao-tao/all', app.permission.check('dtCauTrucKhungDaoTao:read'), (req, res) => {
        app.model.dtCauTrucKhungDaoTao.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/dao-tao/cau-truc-khung-dao-tao/item/:id', app.permission.orCheck('dtCauTrucKhungDaoTao:read', 'dtChuongTrinhDaoTao:manage', 'dtThoiGianMoMon:write'), (req, res) => {
        app.model.dtCauTrucKhungDaoTao.get({ id: req.params.id }, '*', 'id ASC', (error, item) => res.send({ error, item }));
    });

    app.post('/api/dao-tao/cau-truc-khung-dao-tao', app.permission.check('dtCauTrucKhungDaoTao:write'), (req, res) => {
        const item = req.body.item;
        const namDaoTao = item?.namDaoTao;
        app.model.dtCauTrucKhungDaoTao.get({ namDaoTao }, (error, ctKhungDt) => {
            if (!error && !ctKhungDt) {
                app.model.dtCauTrucKhungDaoTao.create({ ...item, bacDaoTao: 'DH' }, async (error, item) => {
                    if (!error) {
                        //TODO: Send Email - Notification;
                        // let listEmail = await app.model.qtChucVu.getAllTruongKhoaEmail();
                    }
                    res.send({ error, item });
                });
            } else res.send({ error: `Năm ${namDaoTao} đã tồn tại!` });
        });

    });

    app.post('/api/dao-tao/cau-truc-khung-dao-tao/multiple', app.permission.check('dtCauTrucKhungDaoTao:write'), (req, res) => {
        const { data } = req.body;
        const { items, namDaoTao, maKhoa, id: idKhungDt } = data;
        const dataImported = [];

        const handleCreate = (index, idKhungDt) => {
            if (index >= items.length) res.send({ items: dataImported });
            else app.model.dtCauTrucKhungDaoTao.get({ id: items[index].id }, (error, item) => {
                const currentData = { ...items[index], ...{ maKhungDaoTao: idKhungDt } };
                delete currentData['id'];
                if (error) res.send({ error });
                else if (item) {
                    app.model.dtCauTrucKhungDaoTao.update({ id: items[index].id }, currentData, (error, item) => {
                        if (error) res.send({ error });
                        else {
                            dataImported.push(item);
                        }
                    });
                    handleCreate(index + 1, idKhungDt);
                }
                else {
                    app.model.dtCauTrucKhungDaoTao.create(currentData, (error, item) => {
                        if (error) res.send({ error });
                        else {
                            dataImported.push(item);
                            handleCreate(index + 1);
                        }
                    });
                }
            });
        };
        if (idKhungDt > 0) {
            app.model.dtKhungDaoTao.get({ id: idKhungDt }, (error, item) => {
                if (error) res.send({ error });
                else if (item) {
                    const { id: idKhungDt, namDaoTao: dbNamDaoTao, maKhoa: dbMaKhoa } = item;
                    const changes = {};
                    if (namDaoTao != dbNamDaoTao) {
                        changes[namDaoTao] = namDaoTao;
                    }
                    if (maKhoa != dbMaKhoa) {
                        changes[maKhoa] = maKhoa;
                    }
                    app.model.dtKhungDaoTao.update({ id: idKhungDt }, changes, () => { });
                    handleCreate(0, idKhungDt);
                }
                else {
                    app.model.dtKhungDaoTao.create({ namDaoTao, maKhoa }, (error, item) => {
                        if (error) res.send({ error });
                        else {
                            const { id: idKhungDt } = item;
                            handleCreate(0, idKhungDt);
                        }
                    });
                }
            });
        } else {
            app.model.dtKhungDaoTao.create({ namDaoTao, maKhoa }, (error, item) => {
                if (error) res.send({ error });
                else {
                    const { id: idKhungDt } = item;
                    handleCreate(0, idKhungDt);
                }
            });
        }

    });

    app.put('/api/dao-tao/cau-truc-khung-dao-tao', app.permission.check('dtCauTrucKhungDaoTao:write'), async (req, res) => {
        let id = req.body.id, changes = req.body.changes;
        try {
            app.model.dtCauTrucKhungDaoTao.update({ id }, changes, (error, item) => res.send({ error, item }));
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/dao-tao/cau-truc-khung-dao-tao', app.permission.check('dtCauTrucKhungDaoTao:delete'), (req, res) => {
        app.model.dtCauTrucKhungDaoTao.delete({ id: req.body.id }, errors => res.send({ errors }));
    });

    app.delete('/api/dao-tao/cau-truc-khung-dao-tao/multiple', app.permission.check('dtCauTrucKhungDaoTao:delete'), (req, res) => {
        const { data } = req.body;
        const { items } = data;
        const handleDelete = (index) => {
            if (index >= items.length) res.send();
            app.model.dtCauTrucKhungDaoTao.delete({ id: items[index].id }, (errors) => {
                if (errors) res.send({ errors });
            });
        };
        handleDelete(0);
    });

    //Phân quyền ------------------------------------------------------------------------------------------
    // app.assignRoleHooks.addRoles('daoTao', { id: 'dtCauTrucKhungDaoTao:manage', text: 'Đào tạo: Quản lý Cấu trúc khung đào tạo' });

    // app.permissionHooks.add('staff', 'checkRoleDTQuanLyCTDT', (user, staff) => new Promise(resolve => {
    //     if (staff.donViQuanLy && staff.donViQuanLy.length && user.permissions.includes('faculty:login')) {
    //         app.permissionHooks.pushUserPermission(user, 'dtCauTrucKhungDaoTao:manage');
    //     }
    //     resolve();
    // }));

    // app.permissionHooks.add('assignRole', 'checkRoleDTQuanLyCTDT', (user, assignRoles) => new Promise(resolve => {
    //     const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'daoTao');
    //     inScopeRoles.forEach(role => {
    //         if (role.tenRole == 'dtCauTrucKhungDaoTao:manage') {
    //             app.permissionHooks.pushUserPermission(user, 'dtCauTrucKhungDaoTao:manage');
    //         }
    //     });
    //     resolve();
    // }));
};