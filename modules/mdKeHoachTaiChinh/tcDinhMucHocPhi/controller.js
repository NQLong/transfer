module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: { 5008: { title: 'Định mức học phí', link: '/user/finance/dinh-muc-hoc-phi' } },
    };

    app.permission.add(
        { name: 'tcDinhMucHocPhi:read', menu },
        { name: 'tcDinhMucHocPhi:write' },
        { name: 'tcDinhMucHocPhi:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesTcDinhMucHocPhi', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcDinhMucHocPhi:read', 'tcDinhMucHocPhi:write', 'tcDinhMucHocPhi:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/finance/dinh-muc-hoc-phi', app.permission.check('tcDinhMucHocPhi:read'), app.templates.admin);
    // API ---------------------------------------------------------------------------------------------------
    app.get('/api/finance/dinh-muc-hoc-phi/page/:pageNumber/:pageSize', app.permission.check('tcDinhMucHocPhi:read'), async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
                const { namBatDau, namKetThuc, hocKy, loaiPhi, loaiDaoTao } = (req.query.filter && req.query.filter != '%%%%%%') ? req.query.filter : { namBatDau: null, namKetThuc: null, hocKy: null, loaiPhi: null, loaiDaoTao: null };
            let page = await app.model.tcDinhMucHocPhi.searchPage(pageNumber, pageSize, namBatDau, namKetThuc, hocKy, loaiPhi, loaiDaoTao, searchTerm);
            const pageCondition = searchTerm;
            res.send({
                page: { totalItem: page.totalitem, pageSize: page.pagesize, pageTotal: page.pagetotal, pageNumber: page.pagenumber, pageCondition, list: page.rows }
            });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/finance/dinh-muc-hoc-phi/all', app.permission.check('tcDinhMucHocPhi:read'), async (req, res) => {
        try {
            let items = await app.model.tcDinhMucHocPhi.getAll();
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/finance/dinh-muc-hoc-phi/item/:ma', app.permission.check('tcDinhMucHocPhi:read'), async (req, res) => {
        try {
            const item = await app.model.tcDinhMucHocPhi.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/finance/dinh-muc-hoc-phi', app.permission.check('tcDinhMucHocPhi:write'), async (req, res) => {
        try {
            let item = await app.model.tcDinhMucHocPhi.create(req.body.data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/finance/dinh-muc-hoc-phi', app.permission.check('tcDinhMucHocPhi:write'), async (req, res) => {
        try {
            let item = await app.model.tcDinhMucHocPhi.update({ ma: req.body.ma }, req.body.changes);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/finance/dinh-muc-hoc-phi', app.permission.check('tcDinhMucHocPhi:delete'), async (req, res) => {
        try {
            await app.model.tcDinhMucHocPhi.delete({ ma: req.body.ma });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};