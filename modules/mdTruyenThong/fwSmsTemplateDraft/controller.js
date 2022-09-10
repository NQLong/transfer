module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.truyenThong,
        menus: {
            6022: {
                title: 'Template chờ duyệt', backgroundColor: '#a1cc1f',
                link: '/user/truyen-thong/sms/template-draft', icon: 'fa-spinner', groupIndex: 5
            },
        },
    };

    app.permission.add(
        { name: 'fwSmsTemplateDraft:read', menu },
        'fwSmsTemplateDraft:write', 'fwSmsTemplateDraft:delete', 'fwSmsTemplate:manage'
    );

    app.get('/user/truyen-thong/sms/template-draft', app.permission.check('fwSmsTemplateDraft:read'), app.templates.admin);

    // API -------------------------------------------------------------------------------
    app.get('/api/sms/template-draft/page/:pageNumber/:pageSize', app.permission.check('fwSmsTemplateDraft:read'), async (req, res) => {
        try {
            let _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                user = req.session.user;
            let donVi = null;
            if (!user.permissions.includes('fwSmsTemplate:manage')) {
                donVi = user.staff.maDonVi;
            }
            let condition = !donVi ? null : { donVi };
            let [listPurpose, page] = await Promise.all([
                app.model.fwSmsDmPurpose.getAll(),
                app.model.fwSmsTemplateDraft.getPage(_pageNumber, _pageSize, condition)
            ]);

            let purposeMapper = {};
            listPurpose.forEach(item => purposeMapper[item.id] = item.ten);
            page.list.forEach(item => item.mucDich = purposeMapper[item.purpose]);
            res.send({ page });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/sms/template-draft', app.permission.check('fwSmsTemplateDraft:write'), async (req, res) => {
        try {
            let user = req.session.user,
                email = user.email,
                donVi = user.staff?.maDonVi;
            const item = await app.model.fwSmsTemplateDraft.create(Object.assign(req.body.data, { donVi, email, lastModified: new Date().getTime() }));
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/sms/template-draft', app.permission.check('fwSmsTemplateDraft:write'), async (req, res) => {
        try {
            let user = req.session.user,
                email = user.email;
            if (req.body.changes.approved && !user.permissions.includes('fwSmsTemplate:write')) {
                res.send({ error: 'No permission!' });
            } else {
                let data = {};
                if (req.body.changes.approved) {
                    data = app.clone(req.body.changes, { approvedTime: new Date().getTime() });
                    let item = await app.model.fwSmsTemplateDraft.get({ id: req.body.id });
                    delete item.id;
                    await app.model.fwSmsTemplate.create(app.clone(item, data, { approver: email }));
                } else {
                    data = app.clone(req.body.changes, { email, lastModified: new Date().getTime() });
                }
                const item = await app.model.fwSmsTemplateDraft.update({ id: req.body.id }, data);
                res.send({ item });
            }
        } catch (error) {
            res.send({ error });
        }
    });
};