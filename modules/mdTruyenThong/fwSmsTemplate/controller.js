module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.truyenThong,
        menus: {
            6023: {
                title: 'SMS Template',
                link: '/user/truyen-thong/sms/template', icon: 'fa-file-text', groupIndex: 5
            },
        },
    };

    app.permission.add(
        { name: 'fwSmsTemplate:read', menu },
        'fwSmsTemplate:write', 'fwSmsTemplate:delete'
    );

    app.get('/user/truyen-thong/sms/template', app.permission.check('fwSmsTemplate:read'), app.templates.admin);

    // API -------------------------------------------------------------------------------
    app.get('/api/sms/template/page/:pageNumber/:pageSize', app.permission.check('fwSmsTemplate:read'), async (req, res) => {
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
                app.model.fwSmsTemplate.getPage(_pageNumber, _pageSize, condition)
            ]);

            let purposeMapper = {};
            listPurpose.forEach(item => purposeMapper[item.id] = item.ten);
            page.list.forEach(item => item.mucDich = purposeMapper[item.purpose]);
            res.send({ page });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/sms/template', app.permission.check('fwSmsTemplate:write'), async (req, res) => {
        try {
            let user = req.session.user,
                email = user.email;
            const item = await app.model.fwSmsTemplate.create(Object.assign(req.body.data, { approver: email, timeApproved: Date.now() }));
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
};