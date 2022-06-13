module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            9007: { title: 'Danh sách Môn học', subTitle: 'Của các Khoa/Bộ môn', link: '/user/dao-tao/mon-hoc', groupIndex: 2, backgroundColor: '#9DE7BE', icon: 'fa-leanpub', color: '#000' },
        },
    };
    app.permission.add(
        { name: 'dmMonHoc:read', menu },
        { name: 'dmMonHoc:manage', menu },
        { name: 'dmMonHoc:write' },
        { name: 'dmMonHoc:delete' },
        { name: 'dmMonHoc:upload' },
    );
    app.get('/user/dao-tao/mon-hoc', app.permission.orCheck('dmMonHoc:read', 'dmMonHoc:manage'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dao-tao/mon-hoc/page/:pageNumber/:pageSize', app.permission.orCheck('dmMonHoc:read', 'dmMonHoc:manage'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            donViFilter = req.query.donViFilter,
            donVi = req.query.donVi ? req.query.donVi : (req.session.user.staff ? req.session.user.staff.maDonVi : null),
            searchTerm = typeof req.query.searchTerm === 'string' ? `%${req.query.searchTerm.toLowerCase()}%` : '',
            selectedItems = req.query.selectedItems ? [req.query.selectedItems].flat() : [];
        if (req.session.user.permissions.includes('dmMonHoc:read') && donViFilter) donVi = donViFilter;
        let statement = 'ma IS NOT NULL AND (:selectedItems IS NULL OR ma NOT IN (:selectedItems)) AND (lower(ten) LIKE :searchTerm OR lower(ma) LIKE :searchTerm) AND (:donVi IS NULL OR khoa IN (:donVi))',
            parameter = {
                searchTerm, donVi, selectedItems: selectedItems.length ? selectedItems : null
            };
        let condition = { statement, parameter };
        app.model.dmMonHoc.getPage(pageNumber, pageSize, condition, '*', 'khoa,ten,ma', (error, page) => {
            page.pageCondition = {
                searchTerm,
                donViFilter: donViFilter
            };
            res.send({ error, page });
        });
    });

    app.get('/api/dao-tao/mon-hoc-pending/page/:pageNumber/:pageSize', app.permission.orCheck('dmMonHoc:read', 'dmMonHoc:manage'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            donViFilter = req.query.donViFilter,
            donVi = req.query.donVi ? req.query.donVi : (req.session.user.staff ? req.session.user.staff.maDonVi : null),
            searchTerm = typeof req.query.searchTerm === 'string' ? `%${req.query.searchTerm.toLowerCase()}%` : '',
            statement = '(lower(ten) LIKE :searchTerm OR lower(ma) LIKE :searchTerm)',
            parameter = { searchTerm },
            selectedItems = (req.query.selectedItems || []).filter(i => i != '' && i);

        if (req.session.user.permissions.includes('dmMonHoc:read') && donViFilter) donVi = donViFilter;
        if (donVi) {
            statement = 'khoa = :donVi AND (lower(ten) LIKE :searchTerm OR lower(ma) LIKE :searchTerm)';
            parameter.donVi = donVi;
        }
        if (selectedItems.length) {
            statement = 'khoa = :donVi AND (lower(ten) LIKE :searchTerm OR lower(ma) LIKE :searchTerm) AND ma NOT IN (:selectedItems)';
            parameter.selectedItems = selectedItems;
        }
        let condition = { statement: `(${statement}) AND MA IS NULL`, parameter };
        app.model.dmMonHoc.getPage(pageNumber, pageSize, condition, '*', 'khoa,ten,ma', (error, page) => {
            page.pageCondition = {
                searchTerm,
                donViFilter: donViFilter
            };
            res.send({ error, page });
        });
    });

    app.get('/api/dao-tao/mon-hoc/all', app.permission.orCheck('dmMonHoc:read', 'manager:read'), (req, res) => {
        const condition = req.query.condition || {};
        Object.keys(condition).forEach(key => { condition[key] === '' ? condition[key] = null : ''; });
        app.model.dmMonHoc.getAll(condition, '*', 'ten ASC', (error, items) => res.send({ error, items }));
    });

    app.get('/api/dao-tao/mon-hoc/item/:ma', app.permission.orCheck('dmMonHoc:read', 'dmMonHoc:manage'), (req, res) => {
        app.model.dmMonHoc.get({ ma: req.params.ma }, (error, item) => {
            if (error) res.send({ error });
            else {
                app.model.dmDonVi.get({ ma: item.khoa }, (error, khoa) => {
                    res.send({ error, item: { ...item, khoa } });
                });
            }
        });
    });

    app.post('/api/dao-tao/mon-hoc', app.permission.orCheck('dmMonHoc:write', 'dmMonHoc:manage'), (req, res) => {
        app.model.dmMonHoc.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/dao-tao/mon-hoc', app.permission.orCheck('dmMonHoc:write', 'dmMonHoc:manage'), (req, res) => {
        app.model.dmMonHoc.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/dao-tao/mon-hoc', app.permission.orCheck('dmMonHoc:write', 'dmMonHoc:manage'), (req, res) => {
        app.model.dmMonHoc.delete({ id: req.body.id }, errors => res.send({ errors }));
    });

    app.post('/api/dao-tao/mon-hoc/multiple', app.permission.orCheck('dmMonHoc:write', 'dmMonHoc:manage'), (req, res) => {
        const dmMonHoc = req.body.dmMonHoc, errorList = [];
        for (let i = 0; i <= dmMonHoc.length; i++) {
            if (i == dmMonHoc.length) {
                res.send({ error: errorList });
            } else {
                if (dmMonHoc[i].kichHoat === 'true' | dmMonHoc[i].kichHoat === 'false')
                    dmMonHoc[i].kichHoat === 'true' ? dmMonHoc[i].kichHoat = 1 : dmMonHoc[i].kichHoat = 0;
                const current = dmMonHoc[i];
                app.model.dmMonHoc.create(current, (error,) => {
                    if (error) errorList.push(error);
                });
            }
        }
    });

    app.get('/api/dao-tao/mon-hoc/page-all/:pageNumber/:pageSize', app.permission.orCheck('dtDangKyMoMon:read', 'dmMonHoc:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            isDangKyMoMon = req.query.isDangKyMoMon,
            searchTerm = typeof req.query.searchTerm === 'string' ? `%${req.query.searchTerm.toLowerCase()}%` : '',
            statement = 'lower(ten) LIKE :searchTerm OR lower(ma) LIKE :searchTerm';
        if (isDangKyMoMon) statement = `khoa != 33 AND (${statement})`;
        app.model.dmMonHoc.getPage(pageNumber, pageSize, {
            statement,
            parameter: { searchTerm }
        }, '*', 'khoa,ten,ma', (error, page) => {
            res.send({ error, page });
        });
    });

    //Phân quyền cho đơn vị ------------------------------------------------------------------------------
    app.assignRoleHooks.addRoles('daoTao', { id: 'dmMonHoc:manage', text: 'Đào tạo: Quản lý môn học' });

    app.assignRoleHooks.addHook('daoTao', async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole == 'daoTao' && userPermissions.includes('manager:write')) {
            const assignRolesList = app.assignRoleHooks.get('daoTao').map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('staff', 'checkRoleDTQuanLyMonHoc', (user, staff) => new Promise(resolve => {
        if (staff.donViQuanLy && staff.donViQuanLy.length && user.permissions.includes('faculty:login')) {
            app.permissionHooks.pushUserPermission(user, 'dmMonHoc:manage');
        }
        resolve();
    }));

    app.permissionHooks.add('assignRole', 'checkRoleDTQuanLyMonHoc', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'daoTao');
        inScopeRoles.forEach(role => {
            if (role.tenRole == 'dmMonHoc:manage') {
                app.permissionHooks.pushUserPermission(user, 'dmMonHoc:manage');
            }
        });
        resolve();
    }));
};