module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7515: {
                title: 'Loại quyết định',
                link: '/user/sau-dai-hoc/loai-quyet-dinh',
                groupIndex: 3
            }
        },
    };

    app.permission.add(
        { name: 'sdhLoaiQuyetDinh:read', menu },
        { name: 'sdhLoaiQuyetDinh:write' },
        { name: 'sdhLoaiQuyetDinh:delete' },
    );
    app.get('/user/sau-dai-hoc/loai-quyet-dinh', app.permission.check('staff:login'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesLoaiQuyetDinh', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhLoaiQuyetDinh:read', 'sdhLoaiQuyetDinh:write', 'sdhLoaiQuyetDinh:delete', 'staff:login');
            resolve();
        } else resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/sau-dai-hoc/loai-quyet-dinh/page/:pageNumber/:pageSize', app.permission.check('sdhLoaiQuyetDinh:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let searchTerm = { statement: null };
        if (req.query.condition) {
            searchTerm = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.sdhLoaiQuyetDinh.getPage(pageNumber, pageSize, searchTerm, (error, page) => {
            res.send({ error, page });
        });

    });

    app.post('/api/sau-dai-hoc/loai-quyet-dinh', app.permission.check('sdhLoaiQuyetDinh:write'), (req, res) => {
        const changes = req.body.changes;
        app.model.sdhLoaiQuyetDinh.create(changes, (error, item) => { res.send({ error, item }); });
    });

    app.put('/api/sau-dai-hoc/loai-quyet-dinh', app.permission.check('sdhLoaiQuyetDinh:write'), (req, res) => {
        let newItem = req.body.changes;
        app.model.sdhLoaiQuyetDinh.update({ ma: req.body.ma }, newItem, (error, item) => {
            res.send({ error, item });
        });
    });

    app.delete('/api/sau-dai-hoc/loai-quyet-dinh', app.permission.check('sdhLoaiQuyetDinh:write'), (req, res) => {
        app.model.sdhLoaiQuyetDinh.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};