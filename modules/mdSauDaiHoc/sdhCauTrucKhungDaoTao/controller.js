module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7505: {
                title: 'Cấu trúc CTĐT',
                link: '/user/sau-dai-hoc/cau-truc-khung-dao-tao',
                groupIndex: 2
            },
        },
    };

    app.permission.add(
        { name: 'sdhCauTrucKhungDaoTao:manage', menu },
        { name: 'sdhCauTrucKhungDaoTao:write' },
        { name: 'sdhCauTrucKhungDaoTao:delete' },
    );
    app.permissionHooks.add('staff', 'addRolesSdhCauTrucKhungDaoTao', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhCauTrucKhungDaoTao:write', 'sdhCauTrucKhungDaoTao:delete', 'sdhCauTrucKhungDaoTao:manage');
            resolve();
        } else resolve();
    }));

    app.get('/user/sau-dai-hoc/cau-truc-khung-dao-tao', app.permission.check('sdhCauTrucKhungDaoTao:manage'), app.templates.admin);
    app.get('/user/sau-dai-hoc/cau-truc-khung-dao-tao/:ma', app.permission.orCheck('sdhCauTrucKhungDaoTao:write', 'sdhCauTrucKhungDaoTao:manage'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sau-dai-hoc/cau-truc-khung-dao-tao/page/:pageNumber/:pageSize', app.permission.check('sdhCauTrucKhungDaoTao:manage'), async (req, res) => {
        try {
            let _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition == 'string' ? req.query.condition : '';
            let result = await app.model.sdhCauTrucKhungDaoTao.searchPage(_pageNumber, _pageSize, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = result;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, list } });
        } catch (error) {
            res.send({ error });
        }

    });

    app.get('/api/sau-dai-hoc/cau-truc-khung-dao-tao/all', app.permission.check('sdhCauTrucKhungDaoTao:manage'), (req, res) => {
        app.model.sdhCauTrucKhungDaoTao.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/sau-dai-hoc/cau-truc-khung-dao-tao/:id', app.permission.orCheck('sdhChuongTrinhDaoTao:manage', 'sdhCauTrucKhungDaoTao:manage'), (req, res) => {
        app.model.sdhCauTrucKhungDaoTao.get({ id: req.params.id }, '*', 'id ASC', (error, item) => res.send({ error, item }));
    });

    app.post('/api/sau-dai-hoc/cau-truc-khung-dao-tao', app.permission.check('sdhCauTrucKhungDaoTao:write'), async (req, res) => {
        try {
            const item = req.body.item;
            const namDaoTao = item?.namDaoTao;
            const ctKhungDt = await app.model.sdhCauTrucKhungDaoTao.get({ namDaoTao });
            if (!ctKhungDt) {
                let newItem = await app.model.sdhCauTrucKhungDaoTao.create({ ...item, bacDaoTao: 'SDH' });
                res.send({ item: newItem });
            } else throw `Năm ${namDaoTao} đã tồn tại!`;
        } catch (error) {
            res.send({ error });
        }


    });

    app.post('/api/sau-dai-hoc/cau-truc-khung-dao-tao/multiple', app.permission.check('sdhCauTrucKhungDaoTao:write'), (req, res) => {
        const { data } = req.body;
        const { items, namDaoTao, maKhoa, id: idKhungDt } = data;
        const dataImported = [];

        const handleCreate = (index, idKhungDt) => {
            if (index >= items.length) res.send({ items: dataImported });
            else app.model.sdhCauTrucKhungDaoTao.get({ id: items[index].id }, (error, item) => {
                const currentData = { ...items[index], ...{ maKhungDaoTao: idKhungDt } };
                delete currentData['id'];
                if (error) res.send({ error });
                else if (item) {
                    app.model.sdhCauTrucKhungDaoTao.update({ id: items[index].id }, currentData, (error, item) => {
                        if (error) res.send({ error });
                        else {
                            dataImported.push(item);
                        }
                    });
                    handleCreate(index + 1, idKhungDt);
                }
                else {
                    app.model.sdhCauTrucKhungDaoTao.create(currentData, (error, item) => {
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

    app.put('/api/sau-dai-hoc/cau-truc-khung-dao-tao', app.permission.check('sdhCauTrucKhungDaoTao:write'), async (req, res) => {
        try {
            let id = req.body.id, changes = req.body.changes;
            let item = await app.model.sdhCauTrucKhungDaoTao.update({ id }, changes);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/sau-dai-hoc/cau-truc-khung-dao-tao', app.permission.check('sdhCauTrucKhungDaoTao:delete'), (req, res) => {
        app.model.sdhCauTrucKhungDaoTao.delete({ id: req.body.id }, error => res.send({ error }));
    });

    app.delete('/api/sau-dai-hoc/cau-truc-khung-dao-tao/multiple', app.permission.check('sdhCauTrucKhungDaoTao:delete'), (req, res) => {
        const { data } = req.body;
        const { items } = data;
        const handleDelete = (index) => {
            if (index >= items.length) res.send();
            app.model.sdhCauTrucKhungDaoTao.delete({ id: items[index].id }, (errors) => {
                if (errors) res.send({ errors });
            });
        };
        handleDelete(0);
    });

    //Phân quyền ------------------------------------------------------------------------------------------
    // app.assignRoleHooks.addRoles('daoTao', { id: 'sdhCauTrucKhungDaoTao:manage', text: 'Đào tạo: Quản lý Cấu trúc khung đào tạo' });

    // app.permissionHooks.add('staff', 'checkRoleDTQuanLyCTDT', (user, staff) => new Promise(resolve => {
    //     if (staff.donViQuanLy && staff.donViQuanLy.length && user.permissions.includes('faculty:login')) {
    //         app.permissionHooks.pushUserPermission(user, 'sdhCauTrucKhungDaoTao:manage');
    //     }
    //     resolve();
    // }));

    // app.permissionHooks.add('assignRole', 'checkRoleDTQuanLyCTDT', (user, assignRoles) => new Promise(resolve => {
    //     const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'daoTao');
    //     inScopeRoles.forEach(role => {
    //         if (role.tenRole == 'sdhCauTrucKhungDaoTao:manage') {
    //             app.permissionHooks.pushUserPermission(user, 'sdhCauTrucKhungDaoTao:manage');
    //         }
    //     });
    //     resolve();
    // }));
};