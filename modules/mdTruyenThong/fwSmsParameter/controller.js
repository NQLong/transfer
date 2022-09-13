module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.truyenThong,
        menus: {
            6025: {
                title: 'Cấu hình tham số SMS',
                link: '/user/truyen-thong/sms/parameter-sms', icon: 'fa-code', groupIndex: 5
            },
        },
    };

    app.permission.add(
        { name: 'developer:write', menu },
    );

    app.get('/user/truyen-thong/sms/parameter-sms', app.permission.check('developer:write'), app.templates.admin);

    // APIs ---------------------------------------------------------------------------------------------------------------------
    app.get('/api/sms/parameter-sms/all', app.permission.check('developer:write'), async (req, res) => {
        try {
            let items = await app.model.fwSmsParameter.getAll();
            res.send({ items });
        } catch (error) {
            console.log(error);
            res.send({ error });
        }
    });

    app.get('/api/sms/parameter-sms/get-list', app.permission.check('fwSmsTemplateDraft:write'), async (req, res) => {
        try {
            let searchTerm = req.query.condition || '';
            let items = await app.model.fwSmsParameter.getAll({
                statement: 'lower(ten) LIKE :searchTerm AND kichHoat = 1',
                parameter: {
                    searchTerm: `%${searchTerm.toLowerCase()}%`
                }
            }, 'id,ten,chuThich', 'ten ASC');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/sms/parameter-sms', app.permission.check('developer:write'), async (req, res) => {
        try {
            const data = req.body.data;
            let item = await app.model.fwSmsParameter.create(data);
            res.send({ item });
        } catch (error) {
            console.log(error);
            res.send({ error });
        }
    });

    app.put('/api/sms/parameter-sms', app.permission.check('developer:write'), async (req, res) => {
        try {
            const { changes, id } = req.body;
            let item = await app.model.fwSmsParameter.update({ id }, changes);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sms/parameter-sms', app.permission.check('fwSmsTemplateDraft:write'), async (req, res) => {
        try {
            let item = await app.model.fwSmsParameter.get({ id: req.query.id }, 'id,ten,chuThich');
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/sms/parameter-sms', app.permission.check('developer:write'), async (req, res) => {
        try {
            const { id } = req.body;
            await app.model.fwSmsParameter.delete({ id });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};