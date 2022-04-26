module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7012: {
                title: 'Cấu trúc khung đào tạo', groupIndex: 1,
                link: '/user/dao-tao/cau-truc-khung-dao-tao', icon: 'fa-cogs', backgroundColor: '#14C053'
            },
        },
    };
    app.permission.add(
        { name: 'dtCauTrucKhungDaoTao:read', menu },
        { name: 'dtCauTrucKhungDaoTao:manage', menu },
        { name: 'dtCauTrucKhungDaoTao:write' },
        { name: 'dtCauTrucKhungDaoTao:delete' },
    );

    app.get('/user/dao-tao/cau-truc-khung-dao-tao', app.permission.orCheck('dtCauTrucKhungDaoTao:read', 'dtCauTrucKhungDaoTao:manage'), app.templates.admin);
    app.get('/user/dao-tao/cau-truc-khung-dao-tao/:ma', app.permission.orCheck('dtCauTrucKhungDaoTao:read', 'dtCauTrucKhungDaoTao:manage'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dao-tao/cau-truc-khung-dao-tao/page/:pageNumber/:pageSize', app.permission.orCheck('dtCauTrucKhungDaoTao:read', 'dtCauTrucKhungDaoTao:manage'), (req, res) => {
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

    app.get('/api/dao-tao/cau-truc-khung-dao-tao/all', app.permission.check('dmKhoiKienThuc:read'), (req, res) => {
        app.model.dtCauTrucKhungDaoTao.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/dao-tao/cau-truc-khung-dao-tao/:ma', app.permission.orCheck('dtCauTrucKhungDaoTao:read', 'dtCauTrucKhungDaoTao:manage'), (req, res) => {
        const condition = req.query.condition || {};
        Object.keys(condition).forEach(key => { condition[key] === '' ? condition[key] = null : ''; });
        app.model.dtCauTrucKhungDaoTao.get(condition, '*', 'id ASC', (error, item) => res.send({ error, item }));
    });

    app.post('/api/dao-tao/cau-truc-khung-dao-tao', app.permission.orCheck('dtCauTrucKhungDaoTao:write', 'dtCauTrucKhungDaoTao:manage'), (req, res) => {
        const item = req.body.item;
        const namDaoTao = item?.namDaoTao;
        app.model.dtCauTrucKhungDaoTao.get({ namDaoTao: namDaoTao }, (error, ctKhungDt) => {
            console.log(error, ctKhungDt);
            if (!error && !ctKhungDt) {
                const data = { namDaoTao, mucCha: item.mucCha, mucCon: item.mucCon };
                app.model.dtCauTrucKhungDaoTao.create(data, (error, item) => {
                    if (!error) {
                        res.send({ error, item});
                    } else res.send({ error });
                });
            } else res.send({ error: `Năm ${namDaoTao} đã tồn tại!` });
        });

    });

    app.post('/api/dao-tao/cau-truc-khung-dao-tao/multiple', app.permission.orCheck('dtCauTrucKhungDaoTao:write', 'manager:write'), (req, res) => {
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

    app.put('/api/dao-tao/cau-truc-khung-dao-tao', app.permission.orCheck('dtCauTrucKhungDaoTao:write', 'manager:write'), async (req, res) => {
        let id = req.body.id, changes = req.body.changes;
        try {
            app.model.dtCauTrucKhungDaoTao.update({ id }, changes, (error, item) => res.send({ error, item }));
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/dao-tao/cau-truc-khung-dao-tao', app.permission.orCheck('dtCauTrucKhungDaoTao:delete', 'manager:write'), (req, res) => {
        app.model.dtCauTrucKhungDaoTao.delete({ id: req.body.id }, errors => res.send({ errors }));
    });

    app.delete('/api/dao-tao/cau-truc-khung-dao-tao/multiple', app.permission.orCheck('dtCauTrucKhungDaoTao:delete', 'manager:write'), (req, res) => {
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